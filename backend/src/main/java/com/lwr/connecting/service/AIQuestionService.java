package com.lwr.connecting.service;

import com.lwr.connecting.entity.*;
import com.lwr.connecting.enums.Difficulty;
import com.lwr.connecting.repository.*;
import com.lwr.connecting.service.ai.AIQuestionProvider;
import com.lwr.connecting.service.ai.GeminiQuestionProvider;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AIQuestionService {

    private static final Logger log = LoggerFactory.getLogger(AIQuestionService.class);

    private final Map<String, AIQuestionProvider> aiProviders;
    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final SubTopicRepository subTopicRepository;
    private final QuestionRepository questionRepository;
    private final QuestionGenerationRequestRepository requestRepository;
    private final QuestionValidationService validationService;

    /**
     * Returns a safe status map for the Gemini provider configuration.
     * Never includes the API key or any secret value.
     */
    public Map<String, Object> getGeminiProviderStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        AIQuestionProvider provider = aiProviders.get("geminiQuestionProvider");

        if (provider instanceof GeminiQuestionProvider gemini) {
            boolean configured = gemini.isConfigured();
            status.put("providerName", gemini.getProviderName());
            status.put("configured", configured);
            status.put("apiKeyPresent", configured);
            status.put("note", configured
                    ? "GEMINI_API_KEY is set and appears valid."
                    : "GEMINI_API_KEY is missing or is a placeholder. "
                    + "Set the GEMINI_API_KEY environment variable before starting the backend.");
        } else {
            status.put("providerName", "UNKNOWN");
            status.put("configured", false);
            status.put("note", "GeminiQuestionProvider bean not found.");
        }

        return status;
    }

    @Transactional
    public List<Question> generateAndValidateQuestions(Long examId, Long subjectId, Long topicId, Long subTopicId,
                                                       Difficulty difficulty, int count, String providerName) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found: " + examId));

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + subjectId));

        Topic topic = topicId != null ? topicRepository.findById(topicId).orElse(null) : null;
        SubTopic subTopic = subTopicId != null ? subTopicRepository.findById(subTopicId).orElse(null) : null;

        String selectedProvider = (providerName != null && !providerName.isEmpty())
                ? providerName.toUpperCase()
                : "MOCK_AI";

        log.info("[AIQuestionService] Generating {} questions | provider={} exam={} subject={} topic={} difficulty={}",
                count, selectedProvider,
                exam.getName(),
                subject.getName(),
                topic != null ? topic.getName() : "N/A",
                difficulty);

        // Save Request
        QuestionGenerationRequest req = QuestionGenerationRequest.builder()
                .exam(exam)
                .subject(subject)
                .topic(topic)
                .subTopic(subTopic)
                .difficulty(difficulty)
                .count(count)
                .status("PENDING")
                .aiProvider(selectedProvider)
                .build();
        req = requestRepository.save(req);

        // Select Provider
        AIQuestionProvider provider = getProvider(selectedProvider);
        log.info("[AIQuestionService] Resolved provider bean: {}", provider.getProviderName());

        List<Question> rawQuestions = provider.generateQuestions(exam, subject, topic, subTopic, difficulty, count);
        List<Question> validatedQuestions = new ArrayList<>();
        int rejected = 0;

        for (Question raw : rawQuestions) {
            // Save initial question to get ID for validation mapping
            Question saved = questionRepository.save(raw);
            QuestionValidation val = validationService.validateQuestion(saved);

            if (Boolean.TRUE.equals(val.getIsValid())) {
                validatedQuestions.add(saved);
            } else {
                log.warn("[AIQuestionService] Question id={} REJECTED: {}", saved.getId(), val.getValidationErrors());
                saved.setActive(false);
                questionRepository.save(saved);
                rejected++;
            }
        }

        log.info("[AIQuestionService] Generation complete: generated={} accepted={} rejected={}",
                rawQuestions.size(), validatedQuestions.size(), rejected);

        req.setStatus("VALIDATED");
        requestRepository.save(req);

        return validatedQuestions;
    }

    private AIQuestionProvider getProvider(String providerName) {
        if ("GEMINI".equalsIgnoreCase(providerName)) {
            AIQuestionProvider p = aiProviders.get("geminiQuestionProvider");
            if (p != null) return p;
            log.warn("[AIQuestionService] geminiQuestionProvider bean not found, falling back to mockAIQuestionProvider");
        }
        return aiProviders.getOrDefault("mockAIQuestionProvider", aiProviders.values().iterator().next());
    }
}
