package com.lwr.connecting.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lwr.connecting.entity.*;
import com.lwr.connecting.enums.Difficulty;
import com.lwr.connecting.enums.QuestionSourceType;
import com.lwr.connecting.enums.QuestionType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Real Gemini AI question provider using Google's Generative Language REST API.
 *
 * <p>Configuration (all read from environment variables via application.properties):
 * <ul>
 *   <li>GEMINI_API_KEY  – required for live generation; if absent, falls back to MockAI</li>
 *   <li>GEMINI_MODEL    – model identifier (default: gemini-1.5-flash)</li>
 *   <li>GEMINI_TIMEOUT_SECONDS – HTTP timeout (default: 30s)</li>
 * </ul>
 *
 * <p>The API key is NEVER logged, printed, or exposed in any response or exception message.
 */
@Service("geminiQuestionProvider")
public class GeminiQuestionProvider implements AIQuestionProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiQuestionProvider.class);

    private static final String BASE_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String model;

    @Value("${gemini.timeout.seconds:30}")
    private int timeoutSeconds;

    private final MockAIQuestionProvider fallbackProvider = new MockAIQuestionProvider();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getProviderName() {
        return "GEMINI";
    }

    /**
     * Returns true only if a non-empty, non-placeholder API key is configured.
     */
    public boolean isConfigured() {
        return apiKey != null
                && !apiKey.trim().isEmpty()
                && !apiKey.equalsIgnoreCase("YOUR_GEMINI_API_KEY")
                && !apiKey.equalsIgnoreCase("mock_development_key");
    }

    @Override
    public List<Question> generateQuestions(Exam exam, Subject subject, Topic topic,
                                            SubTopic subTopic, Difficulty difficulty, int count) {
        if (!isConfigured()) {
            log.warn("[GeminiQuestionProvider] GEMINI_API_KEY is not set or is a placeholder. "
                    + "Falling back to MockAI. Set GEMINI_API_KEY env variable for live generation.");
            List<Question> fallback = fallbackProvider.generateQuestions(exam, subject, topic, subTopic, difficulty, count);
            fallback.forEach(q -> q.setSourceReference("MockAI Fallback (GEMINI_API_KEY missing)"));
            return fallback;
        }

        log.info("[GeminiQuestionProvider] Requesting {} questions via model '{}' | Exam={} Subject={} Topic={} Difficulty={}",
                count,
                model,
                exam != null ? exam.getName() : "N/A",
                subject != null ? subject.getName() : "N/A",
                topic != null ? topic.getName() : "N/A",
                difficulty);

        try {
            String prompt = buildPrompt(exam, subject, topic, subTopic, difficulty, count);
            String responseBody = callGeminiApi(prompt);
            List<Question> parsed = parseGeminiResponse(responseBody, exam, subject, topic, subTopic, difficulty);
            log.info("[GeminiQuestionProvider] Successfully parsed {} questions from Gemini response", parsed.size());
            return parsed;
        } catch (GeminiApiException ex) {
            // Safe: ex.getMessage() is pre-sanitised and never contains the API key
            log.error("[GeminiQuestionProvider] Gemini API error: {} — falling back to MockAI", ex.getMessage());
            List<Question> fallback = fallbackProvider.generateQuestions(exam, subject, topic, subTopic, difficulty, count);
            fallback.forEach(q -> q.setSourceReference("MockAI Fallback (Gemini API error)"));
            return fallback;
        } catch (Exception ex) {
            // Catch-all — log class name only, never log stack traces that could contain auth headers
            log.error("[GeminiQuestionProvider] Unexpected error during question generation ({}). Falling back to MockAI.",
                    ex.getClass().getSimpleName());
            List<Question> fallback = fallbackProvider.generateQuestions(exam, subject, topic, subTopic, difficulty, count);
            fallback.forEach(q -> q.setSourceReference("MockAI Fallback (unexpected error)"));
            return fallback;
        }
    }

    // ============================================================
    // PROMPT ENGINEERING
    // ============================================================

    private String buildPrompt(Exam exam, Subject subject, Topic topic,
                               SubTopic subTopic, Difficulty difficulty, int count) {
        String examName     = exam    != null ? exam.getName()       : "JEE Main";
        String subjectName  = subject != null ? subject.getName()    : "Physics";
        String topicName    = topic   != null ? topic.getName()      : "General";
        String subtopicName = subTopic != null ? subTopic.getName()  : "";
        String diffName     = difficulty != null ? difficulty.name() : "MEDIUM";

        String subtopicLine = subtopicName.isEmpty() ? "" : ", specifically on the sub-topic \"" + subtopicName + "\"";

        return "You are an expert question paper setter for " + examName + ".\n"
                + "Generate exactly " + count + " high-quality multiple-choice questions (SINGLE_CHOICE) "
                + "on the topic \"" + topicName + "\" in " + subjectName + subtopicLine + ".\n"
                + "Difficulty level: " + diffName + ".\n\n"
                + "STRICT REQUIREMENTS:\n"
                + "1. Each question must have a clear, unambiguous stem.\n"
                + "2. Provide exactly 4 distinct options labelled A, B, C, D.\n"
                + "3. Exactly one option must be correct. Correct answer must be the letter only (A/B/C/D).\n"
                + "4. Provide a step-by-step explanation that references specific physics/chemistry/math laws.\n"
                + "5. Do NOT reference any specific past year exam paper or call this a PYQ.\n"
                + "6. Do NOT include LaTeX or special math markup — use plain text with Unicode if needed.\n\n"
                + "OUTPUT FORMAT — return ONLY a valid JSON array, no markdown fences, no extra text:\n"
                + "[\n"
                + "  {\n"
                + "    \"questionText\": \"<full question text>\",\n"
                + "    \"optionA\": \"<option A text>\",\n"
                + "    \"optionB\": \"<option B text>\",\n"
                + "    \"optionC\": \"<option C text>\",\n"
                + "    \"optionD\": \"<option D text>\",\n"
                + "    \"correctOption\": \"A\",\n"
                + "    \"explanation\": \"<step-by-step solution>\"\n"
                + "  }\n"
                + "]\n\n"
                + "Generate all " + count + " questions now.";
    }

    // ============================================================
    // HTTP REQUEST
    // ============================================================

    private String callGeminiApi(String prompt) throws GeminiApiException {
        // API key is interpolated into the URL, never logged
        String url = String.format(BASE_URL, model, apiKey);

        // Build JSON body using ObjectMapper — avoids any injection via prompt text
        String requestBody;
        try {
            requestBody = objectMapper.writeValueAsString(
                    java.util.Map.of("contents",
                            java.util.List.of(
                                    java.util.Map.of("parts",
                                            java.util.List.of(
                                                    java.util.Map.of("text", prompt)
                                            )
                                    )
                            )
                    )
            );
        } catch (Exception e) {
            throw new GeminiApiException("Failed to serialize request body: " + e.getMessage());
        }

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(timeoutSeconds))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response;
        try {
            response = client.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (java.net.http.HttpTimeoutException ex) {
            throw new GeminiApiException("Gemini API request timed out after " + timeoutSeconds + "s");
        } catch (java.io.IOException | InterruptedException ex) {
            if (ex instanceof InterruptedException) Thread.currentThread().interrupt();
            throw new GeminiApiException("Network error calling Gemini API: " + ex.getClass().getSimpleName());
        }

        int statusCode = response.statusCode();
        if (statusCode == 200) {
            return response.body();
        } else if (statusCode == 401 || statusCode == 403) {
            throw new GeminiApiException("Gemini API authentication failed (HTTP " + statusCode
                    + "). Check that GEMINI_API_KEY is valid and has access to model '" + model + "'.");
        } else if (statusCode == 429) {
            throw new GeminiApiException("Gemini API rate limit / quota exceeded (HTTP 429). "
                    + "Wait before retrying or upgrade your API plan.");
        } else if (statusCode >= 500) {
            throw new GeminiApiException("Gemini API server error (HTTP " + statusCode + "). Retry later.");
        } else {
            // Log status code only — NEVER log response body (may contain partial key echoes)
            throw new GeminiApiException("Unexpected Gemini API response (HTTP " + statusCode + ").");
        }
    }

    // ============================================================
    // RESPONSE PARSING
    // ============================================================

    private List<Question> parseGeminiResponse(String responseBody, Exam exam, Subject subject,
                                               Topic topic, SubTopic subTopic, Difficulty difficulty)
            throws GeminiApiException {
        try {
            JsonNode root = objectMapper.readTree(responseBody);

            // Extract text from candidates[0].content.parts[0].text
            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isMissingNode() || textNode.isNull()) {
                throw new GeminiApiException("Gemini response did not contain expected 'candidates[0].content.parts[0].text' field.");
            }

            String rawText = textNode.asText().trim();

            // Strip any accidental markdown code fences
            if (rawText.startsWith("```")) {
                rawText = rawText.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
            }

            JsonNode questionsArray = objectMapper.readTree(rawText);
            if (!questionsArray.isArray()) {
                throw new GeminiApiException("Gemini returned non-array JSON for questions.");
            }

            List<Question> result = new ArrayList<>();
            Difficulty diff = difficulty != null ? difficulty : Difficulty.MEDIUM;

            for (JsonNode node : questionsArray) {
                String questionText = node.path("questionText").asText("").trim();
                String optionA      = node.path("optionA").asText("").trim();
                String optionB      = node.path("optionB").asText("").trim();
                String optionC      = node.path("optionC").asText("").trim();
                String optionD      = node.path("optionD").asText("").trim();
                String correct      = node.path("correctOption").asText("").trim().toUpperCase();
                String explanation  = node.path("explanation").asText("").trim();

                // Per-question structural validation
                if (questionText.isEmpty() || optionA.isEmpty() || optionB.isEmpty()
                        || optionC.isEmpty() || optionD.isEmpty()
                        || !List.of("A", "B", "C", "D").contains(correct)
                        || explanation.isEmpty()) {
                    log.warn("[GeminiQuestionProvider] Skipping malformed question from Gemini response: {}",
                            questionText.isEmpty() ? "(empty question text)" : questionText.substring(0, Math.min(60, questionText.length())));
                    continue;
                }

                Question q = Question.builder()
                        .exam(exam)
                        .subject(subject)
                        .topic(topic)
                        .subTopic(subTopic)
                        .questionText(questionText)
                        .optionA(optionA)
                        .optionB(optionB)
                        .optionC(optionC)
                        .optionD(optionD)
                        .correctOption(correct)
                        .difficulty(diff)
                        .questionType(QuestionType.SINGLE_CHOICE)
                        .marks(4)
                        .negativeMarks(1)
                        .explanation(explanation)
                        .sourceReference("Gemini AI (" + model + ")")
                        .sourceType(QuestionSourceType.AI_GENERATED)
                        .active(true)
                        .build();

                result.add(q);
            }

            if (result.isEmpty()) {
                throw new GeminiApiException("Gemini response parsed successfully but all questions failed structural validation.");
            }

            return result;

        } catch (GeminiApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new GeminiApiException("Failed to parse Gemini JSON response: " + ex.getClass().getSimpleName());
        }
    }

    // ============================================================
    // INTERNAL EXCEPTION — safe (never exposes key or raw API body)
    // ============================================================

    static class GeminiApiException extends Exception {
        GeminiApiException(String message) {
            super(message);
        }
    }
}
