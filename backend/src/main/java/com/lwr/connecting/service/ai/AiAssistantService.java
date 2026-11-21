package com.lwr.connecting.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lwr.connecting.entity.*;
import com.lwr.connecting.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiAssistantService {

    private static final Logger log = LoggerFactory.getLogger(AiAssistantService.class);
    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${gemini.timeout.seconds:25}")
    private int timeoutSeconds;

    private final CollegeRepository collegeRepository;
    private final CutoffRepository cutoffRepository;
    private final ExamRepository examRepository;
    private final BranchRepository branchRepository;
    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;
    private final TestRepository testRepository;
    private final StateRepository stateRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean isGeminiConfigured() {
        return geminiApiKey != null
                && !geminiApiKey.trim().isEmpty()
                && !geminiApiKey.equalsIgnoreCase("YOUR_GEMINI_API_KEY")
                && !geminiApiKey.equalsIgnoreCase("mock_development_key");
    }

    public Map<String, Object> getAiHealthStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("provider", "GEMINI");
        status.put("model", geminiModel);
        boolean configured = isGeminiConfigured();
        status.put("apiKeyConfigured", configured);
        status.put("activeEngine", configured ? "GEMINI_LIVE" : "LWR_KNOWLEDGE_ENGINE");
        status.put("knowledgeEngineAvailable", true);
        status.put("collegesLoaded", collegeRepository.count());
        status.put("cutoffsLoaded", cutoffRepository.count());
        status.put("status", configured ? "CONFIGURED" : "STANDBY_KNOWLEDGE_ENGINE_ACTIVE");
        return status;
    }

    public Map<String, Object> testGeminiConnection() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("provider", "GEMINI");
        result.put("model", geminiModel);
        boolean configured = isGeminiConfigured();
        result.put("apiKeyConfigured", configured);

        if (!configured) {
            result.put("status", "STANDBY_KNOWLEDGE_ENGINE_ACTIVE");
            result.put("activeEngine", "LWR_KNOWLEDGE_ENGINE");
            result.put("message", "Gemini API key is not configured. LWR Knowledge Engine is actively serving counseling workflows with 71 colleges and cutoff data.");
            return result;
        }

        try {
            String url = String.format(GEMINI_API_URL, geminiModel, geminiApiKey);
            Map<String, Object> part = Map.of("text", "Hello");
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> bodyMap = Map.of("contents", List.of(content));
            String bodyJson = objectMapper.writeValueAsString(bodyMap);

            HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> resp = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                result.put("status", "AVAILABLE");
                result.put("activeEngine", "GEMINI_LIVE");
                result.put("message", "Gemini API connected successfully and verified operational.");
            } else {
                result.put("status", "DEGRADED");
                result.put("httpStatusCode", resp.statusCode());
                result.put("activeEngine", "LWR_KNOWLEDGE_ENGINE");
                result.put("message", "Gemini API returned status " + resp.statusCode() + ". LWR Knowledge Engine fallback active.");
            }
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("activeEngine", "LWR_KNOWLEDGE_ENGINE");
            result.put("message", "Gemini test call failed: " + e.getMessage() + ". LWR Knowledge Engine fallback active.");
        }
        return result;
    }

    public Map<String, Object> processChat(String prompt, List<Map<String, String>> history, Map<String, Object> studentContext) {
        if (studentContext == null) {
            studentContext = new HashMap<>();
        } else {
            studentContext = new HashMap<>(studentContext);
        }

        String trimmed = prompt != null ? prompt.trim() : "";
        String lower = trimmed.toLowerCase();

        // 1. Update Context from Student Input
        updateContextFromPrompt(lower, studentContext);

        // 2. If Gemini is configured, attempt live call with platform grounding
        if (isGeminiConfigured()) {
            try {
                String liveResponse = callGeminiLive(trimmed, history, studentContext);
                if (liveResponse != null && !liveResponse.isBlank()) {
                    Map<String, Object> result = new LinkedHashMap<>();
                    result.put("response", liveResponse);
                    result.put("provider", "GEMINI");
                    result.put("studentContext", studentContext);
                    result.put("suggestedChips", generateSuggestedChips(studentContext));
                    return result;
                }
            } catch (Exception e) {
                log.warn("[AiAssistantService] Live Gemini call failed ({}). Gracefully engaging LWR Knowledge Engine.", e.getMessage());
            }
        }

        // 3. LWR Knowledge Engine (Fallback & Built-in Expert Engine)
        Map<String, Object> fallbackResult = generateKnowledgeEngineResponse(trimmed, lower, history, studentContext);
        fallbackResult.put("provider", "LWR_KNOWLEDGE_ENGINE");
        fallbackResult.put("studentContext", studentContext);
        if (!fallbackResult.containsKey("suggestedChips")) {
            fallbackResult.put("suggestedChips", generateSuggestedChips(studentContext));
        }
        return fallbackResult;
    }

    private void updateContextFromPrompt(String lower, Map<String, Object> context) {
        // Intermediate Year
        if (lower.contains("1st year") || lower.contains("first year") || lower.contains("inter 1") || lower.contains("class 11") || lower.contains("11th")) {
            context.put("interYear", "Intermediate 1st Year");
        } else if (lower.contains("2nd year") || lower.contains("second year") || lower.contains("inter 2") || lower.contains("class 12") || lower.contains("12th")) {
            context.put("interYear", "Intermediate 2nd Year");
        }

        // Target Exam
        if (lower.contains("ap eapcet") || lower.contains("ap eamcet") || lower.contains("eapcet") || lower.contains("eamcet")) {
            context.put("targetExam", "AP EAPCET");
        } else if (lower.contains("tg eapcet") || lower.contains("ts eamcet") || lower.contains("ts eapcet") || lower.contains("telangana")) {
            context.put("targetExam", "TG EAPCET");
        } else if (lower.contains("jee advanced") || lower.contains("iit")) {
            context.put("targetExam", "JEE Advanced");
        } else if (lower.contains("jee main") || lower.contains("jee")) {
            context.put("targetExam", "JEE Main");
        }

        // Target Branch
        if (lower.contains("cse") || lower.contains("computer science")) {
            context.put("preferredBranch", "CSE");
        } else if (lower.contains("ai") || lower.contains("aiml") || lower.contains("machine learning")) {
            context.put("preferredBranch", "CSE_AIML");
        } else if (lower.contains("ece") || lower.contains("electronics")) {
            context.put("preferredBranch", "ECE");
        } else if (lower.contains("mechanical") || lower.contains("mech")) {
            context.put("preferredBranch", "MECH");
        }

        // Rank
        Pattern rankPattern = Pattern.compile("(?:rank\\s*[:=]?\\s*|\\b)(\\d{2,6})\\b");
        Matcher m = rankPattern.matcher(lower);
        if (m.find()) {
            try {
                int r = Integer.parseInt(m.group(1));
                if (r >= 10 && r <= 200000) {
                    context.put("rank", r);
                }
            } catch (Exception ignored) {}
        }

        // Category
        if (lower.contains("bc-a") || lower.contains("bc_a") || lower.contains("bca")) {
            context.put("category", "BC_A");
        } else if (lower.contains("bc-b") || lower.contains("bc_b") || lower.contains("bcb")) {
            context.put("category", "BC_B");
        } else if (lower.contains("bc-c") || lower.contains("bc_c") || lower.contains("bcc")) {
            context.put("category", "BC_C");
        } else if (lower.contains("bc-d") || lower.contains("bc_d") || lower.contains("bcd")) {
            context.put("category", "BC_D");
        } else if (lower.contains("bc-e") || lower.contains("bc_e") || lower.contains("bce")) {
            context.put("category", "BC_E");
        } else if (lower.contains("sc category") || lower.contains(" sc ") || lower.endsWith(" sc")) {
            context.put("category", "SC");
        } else if (lower.contains("st category") || lower.contains(" st ") || lower.endsWith(" st")) {
            context.put("category", "ST");
        } else if (lower.contains("ews")) {
            context.put("category", "EWS");
        } else if (lower.contains(" oc ") || lower.contains("open") || lower.contains("general")) {
            context.put("category", "OC");
        }
    }

    private Map<String, Object> generateKnowledgeEngineResponse(
            String rawPrompt,
            String lower,
            List<Map<String, String>> history,
            Map<String, Object> context) {

        Map<String, Object> result = new LinkedHashMap<>();
        log.info("[AiAssistantService] Prompt: '{}' | Context: {}", rawPrompt, context);

        // 1. Initial Greeting flow: "Hi", "Hello", "Hey"
        if (isPureGreeting(lower)) {
            String greeting = "Hi! 👋 Welcome to Laughs With Ramesh Connecting. I'm your LWR AI study and B.Tech guidance assistant. Are you studying Intermediate 1st year or 2nd year? And are you preparing for AP EAPCET, TG EAPCET, JEE Main, or another entrance exam?";
            result.put("response", greeting);
            result.put("suggestedChips", List.of("I'm in Intermediate 1st year", "I'm in Intermediate 2nd year", "AP EAPCET", "JEE Main"));
            return result;
        }

        // 2. Thank You / Polite closing
        if (lower.contains("thank") || lower.contains("dhanyavadalu") || lower.contains("thanks")) {
            result.put("response", "You're very welcome! 😊 Keep practicing consistently, stay confident, and remember that steady effort always yields great results. Let me know whenever you need help with your study timetable, PYQs, or college cutoffs. All the best with your preparation!");
            result.put("suggestedChips", List.of("Generate Mock Test", "Explore AP Colleges", "High-Weightage Topics"));
            return result;
        }

        // 3. Study Plan & Timetable: "I want a study timetable"
        if (lower.contains("timetable") || lower.contains("time table") || lower.contains("study plan") || lower.contains("schedule") || lower.contains("daily routine")) {
            return handleStudyTimetableQuery(context);
        }

        // 4. Counselling Guide: "Explain the EAMCET counselling process"
        if (lower.contains("counselling") || lower.contains("counseling") || lower.contains("web options") || lower.contains("apsche") || lower.contains("tsche")) {
            return handleCounsellingProcessQuery();
        }

        // 5. Connect with Ramesh / Speak to Mentor
        if (lower.contains("ramesh") || lower.contains("speak to ramesh") || lower.contains("talk to ramesh")
                || lower.contains("connect with ramesh") || lower.contains("appointment") || lower.contains("meet ramesh")
                || lower.contains("guidance session") || lower.contains("ramesh tho")) {
            return handleConnectWithRameshQuery();
        }

        // 6. Specific College Cutoff Query: "What is the cutoff for AUCE?" / "JNTU Kakinada cutoff" / "KL University cutoff"
        if (lower.contains("cutoff") || lower.contains("cut off") || lower.contains("closing rank")) {
            Map<String, Object> cutoffResponse = handleCutoffQuery(lower);
            if (cutoffResponse != null) {
                return cutoffResponse;
            }
        }

        // 7. Mock Test Requests: "Give me AP EAPCET mock test"
        if (lower.contains("mock test") || lower.contains("grand test") || lower.contains("practice test")) {
            return handleMockTestQuery(context);
        }

        // 7. Difficult Topic & Math explanations: "I don't understand Maths"
        if (lower.contains("don't understand") || lower.contains("math") || lower.contains("physics") || lower.contains("chemistry") || lower.contains("difficult") || lower.contains("topic")) {
            return handleTopicExplanationQuery(lower);
        }

        // 8. Branch Comparison: "CSE vs ECE"
        if (lower.contains("cse vs ece") || lower.contains("ece vs cse") || (lower.contains("cse") && lower.contains("ece")) || lower.contains("which branch")) {
            return handleBranchComparisonQuery();
        }

        // 9. Telugu-English Transliteration queries
        if (lower.contains("ela") || lower.contains("kavali") || lower.contains("vastundi") || lower.contains("undi") || lower.contains("cheyali") || lower.contains("manchi")) {
            return handleTeluguEnglishQuery(lower, context);
        }

        // 10. Intermediate year response: "I'm in Intermediate 2nd year"
        if (lower.contains("1st year") || lower.contains("first year") || lower.contains("2nd year") || lower.contains("second year")) {
            if (!context.containsKey("targetExam")) {
                String response = "Great! 😊 Which entrance exam are you preparing for—AP EAPCET, TG EAPCET, JEE Main, or more than one?";
                result.put("response", response);
                result.put("suggestedChips", List.of("AP EAPCET", "TG EAPCET", "JEE Main", "Both JEE and AP EAPCET"));
                return result;
            }
        }

        // 11. Exam confirmation response: "AP EAPCET" or "JEE"
        if ((lower.equals("ap eapcet") || lower.equals("eapcet") || lower.equals("tg eapcet") || lower.equals("jee main") || lower.equals("jee")) &&
                !lower.contains("mock") && !lower.contains("syllabus") && !lower.contains("college")) {
            String response = "Got it! Are you looking for a study timetable, mock tests, previous-year questions, college cutoffs, or help choosing a college?";
            result.put("response", response);
            result.put("suggestedChips", List.of("I want to know which college I can get", "Give me AP EAPCET mock test", "I want a study timetable", "High-weightage topics"));
            return result;
        }

        // 12. College Prediction Inquiry without rank
        boolean isCollegePredictionInquiry = lower.contains("which college") || lower.contains("what college")
                || lower.contains("college can i get") || lower.contains("colleges can i get")
                || lower.contains("help choosing a college") || lower.contains("college predictor")
                || lower.contains("suggest colleges") || lower.contains("eligible colleges")
                || lower.contains("seat allotment");

        if (isCollegePredictionInquiry && !context.containsKey("rank") && !containsDigits(lower)) {
            String examName = context.getOrDefault("targetExam", "AP EAPCET").toString();
            String response = "Sure! I can help you explore colleges based on historical cutoff data. What is your expected or actual " + examName + " rank, category, and preferred branch?";
            result.put("response", response);
            result.put("suggestedChips", List.of("Rank 5000 OC CSE", "Rank 12000 BC-A ECE", "Rank 25000 SC CSE", "Open College Predictor"));
            return result;
        }

        // 13. College Eligibility Query with Rank (e.g. "Which college can I get with rank 5000?" or "rank 5000 in AP EAPCET")
        if ((isCollegePredictionInquiry || lower.contains("rank") || lower.contains("eligible")) && (context.containsKey("rank") || containsDigits(lower))) {
            return handleCollegePredictorQuery(lower, context);
        }

        // 14. Colleges in State / CSE Colleges: "Show CSE colleges in Andhra Pradesh"
        if ((lower.contains("show") || lower.contains("list") || lower.contains("top") || lower.contains("find")) && lower.contains("college")) {
            return handleCollegesListQuery(lower);
        }

        // 15. Default helpful educational guide response
        String defaultMsg = "I am your **LWR AI** study and B.Tech admissions guide for Intermediate students.\n\n"
                + "Here is how I can help you right now:\n"
                + "- **College Predictor**: Tell me your rank, exam, and category (e.g. *\"Rank 5000 in AP EAPCET OC CSE\"*)\n"
                + "- **Mock Tests**: Ask for timed CBT mock tests (*\"Give me AP EAPCET mock test\"*)\n"
                + "- **College Cutoffs**: Look up official closing ranks (*\"What is the cutoff for AUCE?\"*)\n"
                + "- **Study Plans**: Generate customized daily timetables (*\"I want a study timetable\"*)\n"
                + "- **Syllabus & Topics**: High-weightage chapters and difficult topic explanations\n"
                + "- **Counselling Guide**: Step-by-step APSCHE & TSCHE web options walkthrough\n\n"
                + "What would you like to explore today?";
        result.put("response", defaultMsg);
        result.put("suggestedChips", List.of("Rank 5000 in AP EAPCET", "Give me AP EAPCET mock test", "What is the cutoff for AUCE?", "EAMCET Counselling Process"));
        return result;
    }

    private boolean isPureGreeting(String lower) {
        return lower.equals("hi") || lower.equals("hello") || lower.equals("hey") || lower.equals("namaste") ||
                lower.startsWith("hi ") || lower.startsWith("hello ") || lower.equals("hi!") || lower.equals("hello!");
    }

    private boolean containsDigits(String text) {
        for (char c : text.toCharArray()) {
            if (Character.isDigit(c)) return true;
        }
        return false;
    }

    private Map<String, Object> handleCollegePredictorQuery(String lower, Map<String, Object> context) {
        Map<String, Object> result = new LinkedHashMap<>();

        int userRank = 5000;
        if (context.containsKey("rank")) {
            userRank = (Integer) context.get("rank");
        } else {
            Pattern p = Pattern.compile("(\\d{2,6})");
            Matcher m = p.matcher(lower);
            if (m.find()) {
                userRank = Integer.parseInt(m.group(1));
            }
        }

        String category = context.getOrDefault("category", "OC").toString();
        String branchCode = context.getOrDefault("preferredBranch", "").toString();
        String examName = context.getOrDefault("targetExam", "AP EAPCET").toString();

        Long examId = 2L; // AP_EAPCET default
        Optional<Exam> examOpt = examRepository.findByCode("AP_EAPCET");
        if (examOpt.isPresent()) {
            examId = examOpt.get().getId();
        }

        Long branchId = null;
        if (!branchCode.isEmpty()) {
            Optional<Branch> bOpt = branchRepository.findByCode(branchCode);
            if (bOpt.isPresent()) branchId = bOpt.get().getId();
        }

        List<Cutoff> matches = cutoffRepository.predictEligibleCutoffs(examId, userRank, category, branchId);

        if (matches.isEmpty() && !category.equalsIgnoreCase("OC")) {
            // Fallback to OC check if category records are sparse
            matches = cutoffRepository.predictEligibleCutoffs(examId, userRank, "OC", branchId);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("### 🎯 College Eligibility Analysis for Rank ").append(String.format("%,d", userRank))
          .append(" (").append(examName).append(" - ").append(category).append(" Category)\n\n");

        if (matches.isEmpty()) {
            sb.append("Based on historical closing rank data in our database, no direct matches were found for Rank ")
              .append(String.format("%,d", userRank)).append(" in ").append(category).append(" category.\n\n")
              .append("💡 **Guidance:** You can explore private colleges and other engineering branches on our platform, or visit the full [College Predictor](/college-predictor) to view alternative matches.");
        } else {
            sb.append("Here are top verified college & branch options where previous closing ranks match your score:\n\n");

            int count = 0;
            for (Cutoff c : matches) {
                if (count >= 5) break;
                int margin = c.getClosingRank() - userRank;
                String chance = margin >= 5000 ? "🟢 Strong Chance" : margin >= 1000 ? "🟡 Possible" : "🔵 Reach / Competitive";

                sb.append(count + 1).append(". **").append(c.getCollege().getName()).append("** (").append(c.getCollege().getCity()).append(")\n")
                  .append("   - **Branch:** ").append(c.getBranch().getName()).append(" (").append(c.getBranch().getCode()).append(")\n")
                  .append("   - **Status:** ").append(chance).append(" (Previous Closing Rank: ").append(String.format("%,d", c.getClosingRank()))
                  .append(", Safety Margin: +").append(String.format("%,d", margin)).append(")\n")
                  .append("   - **Source:** ").append(c.getSourceReference() != null ? c.getSourceReference() : "APSCHE Official Counselling").append("\n\n");
                count++;
            }

            sb.append("> [!NOTE]\n")
              .append("> Historical cutoffs are reference benchmarks from previous counselling rounds and are not guaranteed admissions. Final seat allotments depend on total test takers and web option preferences.\n\n")
              .append("Would you like me to show cutoffs for other branches or explain how to arrange these colleges in your web options?");
        }

        result.put("response", sb.toString());
        result.put("action", "OPEN_PREDICTOR");
        result.put("actionLabel", "Open College Predictor");
        result.put("actionUrl", "/college-predictor");
        result.put("suggestedChips", List.of("Show CSE colleges in Andhra Pradesh", "Explain the EAMCET counselling process", "Give me AP EAPCET mock test"));
        return result;
    }

    private Map<String, Object> handleCutoffQuery(String lower) {
        Map<String, Object> result = new LinkedHashMap<>();

        // 1. KL UNIVERSITY SPECIAL CASE
        if (lower.contains("kl university") || lower.contains("klu") || lower.contains("koneru lakshmaiah")) {
            College klu = collegeRepository.findByCode("KLU").orElse(null);
            StringBuilder sb = new StringBuilder();
            sb.append("### 🏛️ KL University (KLEF) — Admission & Cutoff Guidance\n\n");
            sb.append("**Type:** Deemed to be University (NAAC A++, NIRF Ranked)\n");
            sb.append("**Location:** Vaddeswaram, Guntur District, Andhra Pradesh (near Vijayawada)\n\n");
            sb.append("#### 📌 Admission Routes:\n");
            sb.append("1. **KLEEE (Koneru Lakshmaiah Engineering Entrance Exam)**: The primary university-level entrance examination. High scorers receive up to 100% merit fee concessions.\n");
            sb.append("2. **AP EAPCET Counselling**: Limited seats are filled through state convener quota (Category A & B seats).\n");
            sb.append("3. **JEE Main / Uni-GAUGE**: Direct applications accepted based on percentile.\n\n");

            if (klu != null) {
                List<Cutoff> cutoffs = cutoffRepository.findByCollegeIdAndActiveTrueOrderByYearDesc(klu.getId());
                if (!cutoffs.isEmpty()) {
                    sb.append("#### 📊 Verified AP EAPCET Historical Cutoffs:\n\n");
                    sb.append("| Branch | Category | Year | Opening Rank | Closing Rank | Source |\n");
                    sb.append("|---|---|---|---|---|---|\n");
                    for (Cutoff c : cutoffs) {
                        sb.append("| ").append(c.getBranch().getName())
                          .append(" | ").append(c.getCategory())
                          .append(" | ").append(c.getYear())
                          .append(" | ").append(c.getOpeningRank() != null ? String.format("%,d", c.getOpeningRank()) : "-")
                          .append(" | **").append(String.format("%,d", c.getClosingRank())).append("**")
                          .append(" | [Official Source](").append(c.getSourceReference() != null ? c.getSourceReference() : "https://www.kluniversity.in/admissions/").append(") |\n");
                    }
                    sb.append("\n");
                }
            }

            sb.append("💡 **Official Admissions Portal:** [KL University Admissions](https://www.kluniversity.in/admissions/)\n\n");
            sb.append("Would you like me to check other college cutoffs, open the predictor, or schedule a guidance session with Ramesh?");

            result.put("response", sb.toString());
            result.put("suggestedChips", List.of("Open Predictor", "Search Colleges", "Check Cutoffs", "Connect with Ramesh"));
            return result;
        }

        // 2. DYNAMIC COLLEGE LOOKUP
        List<College> colleges = collegeRepository.findByActiveTrueOrderByNameAsc();
        College matchedCollege = null;

        for (College c : colleges) {
            String cCode = c.getCode() != null ? c.getCode().toLowerCase() : "";
            String cName = c.getName() != null ? c.getName().toLowerCase() : "";
            if ((!cCode.isBlank() && lower.contains(cCode)) || (!cName.isBlank() && lower.contains(cName)) ||
               (c.getCity() != null && lower.contains(c.getCity().toLowerCase()) && (lower.contains("college") || lower.contains("university") || lower.contains("iit") || lower.contains("nit")))) {
                matchedCollege = c;
                break;
            }
        }

        if (matchedCollege == null && (lower.contains("auce") || lower.contains("andhra university"))) {
            matchedCollege = collegeRepository.findByCode("AUCE").orElse(null);
        }

        if (matchedCollege != null) {
            List<Cutoff> cutoffs = cutoffRepository.findByCollegeIdAndActiveTrueOrderByYearDesc(matchedCollege.getId());

            StringBuilder sb = new StringBuilder();
            sb.append("### 🏛️ Verified Cutoffs: ").append(matchedCollege.getName()).append(" (").append(matchedCollege.getCode()).append(")\n")
              .append("**Location:** ").append(matchedCollege.getLocation()).append("\n")
              .append("**Ownership:** ").append(matchedCollege.getGovernmentStatus() != null ? matchedCollege.getGovernmentStatus() : "University")
              .append(matchedCollege.getIsAutonomous() != null && matchedCollege.getIsAutonomous() ? " • Autonomous" : "").append("\n")
              .append("**Admission Authority:** ").append(matchedCollege.getAdmissionAuthority() != null ? matchedCollege.getAdmissionAuthority() : "State Authority").append("\n");

            if (matchedCollege.getFeeRange() != null) {
                sb.append("**Tuition Fees:** ").append(matchedCollege.getFeeRange()).append("\n");
            }
            if (matchedCollege.getAdmissionLink() != null) {
                sb.append("**Official Counselling Portal:** [Visit Portal](").append(matchedCollege.getAdmissionLink()).append(")\n");
            }
            sb.append("\n");

            if (cutoffs.isEmpty()) {
                sb.append("⚠️ *No verified cutoff data is currently available for this specific combination in our database.*\n\n")
                  .append("You can check the official portal at ").append(matchedCollege.getWebsite() != null ? matchedCollege.getWebsite() : "the state counselling website")
                  .append(" or submit a doubt to our mentors for personalized advice.\n");
            } else {
                sb.append("| Branch | Category | Year | Opening Rank | Closing Rank | Source |\n")
                  .append("|---|---|---|---|---|---|\n");

                for (Cutoff c : cutoffs.stream().limit(8).collect(Collectors.toList())) {
                    sb.append("| ").append(c.getBranch().getName())
                      .append(" | ").append(c.getCategory())
                      .append(" | ").append(c.getYear())
                      .append(" | ").append(c.getOpeningRank() != null ? String.format("%,d", c.getOpeningRank()) : "-")
                      .append(" | **").append(c.getClosingRank() != null ? String.format("%,d", c.getClosingRank()) : "-").append("**")
                      .append(" | ").append(c.getSourceReference() != null ? c.getSourceReference() : "Official Release")
                      .append(" |\n");
                }

                sb.append("\n*Data Source: Verified historical cutoff records from ").append(cutoffs.get(0).getSourceReference() != null ? cutoffs.get(0).getSourceReference() : "Official State Authority").append(".*");
            }

            result.put("response", sb.toString());
            result.put("action", "OPEN_CUTOFFS");
            result.put("actionLabel", "Check Cutoff Explorer");
            result.put("actionUrl", "/cutoffs");
            result.put("suggestedChips", List.of("Search Colleges", "Check Cutoffs", "Open Predictor", "Start Mock Test", "Connect with Ramesh"));
            return result;
        }

        return null;
    }

    private Map<String, Object> handleConnectWithRameshQuery() {
        Map<String, Object> result = new LinkedHashMap<>();
        String msg = "### 🤝 Connect with Ramesh — 1-on-1 Student Guidance\n\n"
                + "You can directly schedule a personalized 1-on-1 guidance session with **Ramesh** to clarify your doubts!\n\n"
                + "#### 📋 What You Can Discuss:\n"
                + "- **College & Branch Selection**: Tailored advice based on your rank, budget, and long-term tech aspirations.\n"
                + "- **Exam Strategy**: Actionable daily schedules and subject prioritization for AP EAPCET, TG EAPCET, and JEE Main.\n"
                + "- **Counselling & Web Options**: How to arrange college preferences safely during official seat allotment rounds.\n\n"
                + "#### 🚀 Next Steps:\n"
                + "1. Visit the [Connect with Ramesh](/doubt-sessions) page.\n"
                + "2. Fill out your target entrance exam, subject category, and doubt description.\n"
                + "3. Ramesh reviews every request personally and schedules a dedicated Google Meet session.\n"
                + "4. You will receive an instant in-app notification and email confirmation once scheduled!";

        result.put("response", msg);
        result.put("action", "CONNECT_WITH_RAMESH");
        result.put("actionLabel", "Connect with Ramesh");
        result.put("actionUrl", "/doubt-sessions");
        result.put("suggestedChips", List.of("Connect with Ramesh", "Explore Colleges", "College Predictor", "Study Timetable"));
        return result;
    }

    private Map<String, Object> handleCollegesListQuery(String lower) {
        Map<String, Object> result = new LinkedHashMap<>();

        // Detect targeted region or city
        String targetRegion = "All India";
        String cityFilter = null;
        String stateCode = null;

        if (lower.contains("bengaluru") || lower.contains("bangalore")) {
            targetRegion = "Bengaluru (Karnataka)";
            cityFilter = "Bengaluru";
        } else if (lower.contains("hyderabad")) {
            targetRegion = "Hyderabad (Telangana)";
            cityFilter = "Hyderabad";
        } else if (lower.contains("chennai")) {
            targetRegion = "Chennai (Tamil Nadu)";
            cityFilter = "Chennai";
        } else if (lower.contains("delhi")) {
            targetRegion = "Delhi (NCR)";
            cityFilter = "Delhi";
        } else if (lower.contains("mumbai")) {
            targetRegion = "Mumbai (Maharashtra)";
            cityFilter = "Mumbai";
        } else if (lower.contains("pune")) {
            targetRegion = "Pune (Maharashtra)";
            cityFilter = "Pune";
        } else if (lower.contains("karnataka")) {
            targetRegion = "Karnataka";
            stateCode = "KA";
        } else if (lower.contains("tamil nadu") || lower.contains("tamilnadu")) {
            targetRegion = "Tamil Nadu";
            stateCode = "TN";
        } else if (lower.contains("maharashtra")) {
            targetRegion = "Maharashtra";
            stateCode = "MH";
        } else if (lower.contains("kerala")) {
            targetRegion = "Kerala";
            stateCode = "KL";
        } else if (lower.contains("telangana") || lower.contains("ts")) {
            targetRegion = "Telangana";
            stateCode = "TS";
        } else if (lower.contains("andhra") || lower.contains("ap")) {
            targetRegion = "Andhra Pradesh";
            stateCode = "AP";
        }

        List<College> all = collegeRepository.findByActiveTrueOrderByNameAsc();
        final String finalCity = cityFilter;
        final String finalState = stateCode;

        List<College> filtered = all.stream().filter(c -> {
            if (finalCity != null) {
                return (c.getCity() != null && c.getCity().toLowerCase().contains(finalCity.toLowerCase()))
                        || (c.getLocation() != null && c.getLocation().toLowerCase().contains(finalCity.toLowerCase()));
            }
            if (finalState != null) {
                return (c.getState() != null && c.getState().getCode() != null && c.getState().getCode().equalsIgnoreCase(finalState))
                        || (c.getStateText() != null && c.getStateText().toLowerCase().contains(finalState.toLowerCase()));
            }
            return true;
        }).collect(Collectors.toList());

        if (filtered.isEmpty()) {
            filtered = all;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("### 🏫 Engineering Colleges in ").append(targetRegion).append("\n\n")
          .append("Here are verified premier institutions matching your search:\n\n");

        int count = 1;
        for (College c : filtered.stream().limit(7).collect(Collectors.toList())) {
            sb.append(count++).append(". **").append(c.getName()).append("** (Code: `").append(c.getCode()).append("`)\n")
              .append("   - **Location:** ").append(c.getCity() != null ? c.getCity() : c.getLocation())
              .append(c.getPincode() != null ? " - " + c.getPincode() : "").append("\n")
              .append("   - **Ownership:** ").append(c.getGovernmentStatus() != null ? c.getGovernmentStatus() : "University")
              .append(c.getIsAutonomous() != null && c.getIsAutonomous() ? " • Autonomous" : "")
              .append(c.getAicteApproved() != null && c.getAicteApproved() ? " • AICTE Approved" : "").append("\n")
              .append("   - **Fee Range:** ").append(c.getFeeRange() != null ? c.getFeeRange() : "As per State Admission Committee").append("\n")
              .append("   - **Admission Route:** ").append(c.getAdmissionAuthority() != null ? c.getAdmissionAuthority() : "State / National Counselling").append("\n\n");
        }

        sb.append("👉 Explore the full database of institutions with branch cutoffs on the [All-India Colleges Directory](/colleges).");

        result.put("response", sb.toString());
        result.put("action", "OPEN_COLLEGES");
        result.put("actionLabel", "Explore All-India Colleges");
        result.put("actionUrl", "/colleges");
        result.put("suggestedChips", List.of("Search Colleges in Bengaluru", "Explore Colleges in Hyderabad", "College Predictor", "Connect with Ramesh"));
        return result;
    }

    private Map<String, Object> handleMockTestQuery(Map<String, Object> context) {
        Map<String, Object> result = new LinkedHashMap<>();

        String examName = context.getOrDefault("targetExam", "AP EAPCET").toString();

        StringBuilder sb = new StringBuilder();
        sb.append("### 📝 ").append(examName).append(" Online CBT Mock Tests\n\n")
          .append("You can take full-length grand mock tests and chapter-wise topic tests directly on our platform:\n\n")
          .append("1. **Full-Length Grand Test**: 160 Questions (80 Mathematics, 40 Physics, 40 Chemistry), 180 Minutes, real exam CBT interface.\n")
          .append("2. **Topic Mock Tests**: 10 to 50 questions with instant AI solutions on high-weightage topics like Matrices, Integration, Newton's Laws, and Organic Chemistry.\n")
          .append("3. **Anti-Cheating Timer & Palette**: Color-coded question status (Answered, Marked for Review, Unvisited).\n\n")
          .append("👉 Click below to start an online mock test now:\n")
          .append("- [Open Mock Test Catalog](/mock-tests)\n")
          .append("- [Explore Previous Year Questions (PYQs)](/pyqs)");

        result.put("response", sb.toString());
        result.put("action", "OPEN_MOCK_TESTS");
        result.put("actionLabel", "Take CBT Mock Test");
        result.put("actionUrl", "/mock-tests");
        result.put("suggestedChips", List.of("I want a study timetable", "High-weightage topics in Maths", "Find colleges by rank"));
        return result;
    }

    private Map<String, Object> handleStudyTimetableQuery(Map<String, Object> context) {
        Map<String, Object> result = new LinkedHashMap<>();
        String exam = context.getOrDefault("targetExam", "AP EAPCET").toString();

        String plan = "### 📅 High-Yield Daily Study Timetable for " + exam + "\n\n"
                + "A balanced 8 to 10 hour daily schedule designed for Intermediate students:\n\n"
                + "| Time Slot | Subject | Focus Area | Strategy |\n"
                + "|---|---|---|---|\n"
                + "| **6:00 AM – 8:30 AM** | **Mathematics** | Matrices, Vectors, Calculus | Fresh mind: solve numerical problems & formula practice |\n"
                + "| **9:30 AM – 12:00 PM** | **Physics** | Mechanics, Modern Physics, Optics | Concept understanding + 20 numerical problems |\n"
                + "| **2:00 PM – 4:00 PM** | **Chemistry** | Organic Reactions & Inorganic NCERT | High-scoring memorization & reaction mechanisms |\n"
                + "| **4:30 PM – 6:30 PM** | **Revision / Practice** | Mixed Formula Sheets | Speed problem solving without calculator |\n"
                + "| **8:00 PM – 10:00 PM** | **Mock Test / PYQs** | Timed Chapter Test | 30 PYQs under strict timer on [LWR Mock Tests](/mock-tests) |\n"
                + "| **10:00 PM – 10:30 PM** | **Day Review** | Mistake Notebook | Note down wrong questions to review on weekends |\n\n"
                + "> [!TIP]\n"
                + "> In AP EAPCET, Mathematics carries 80 marks out of 160 (50% weightage). Allocate half your problem-solving hours to Maths!";

        result.put("response", plan);
        result.put("action", "OPEN_SYLLABUS");
        result.put("actionLabel", "View Exam Syllabus");
        result.put("actionUrl", "/syllabus");
        result.put("suggestedChips", List.of("High-weightage topics in Maths", "Give me AP EAPCET mock test", "CSE vs ECE"));
        return result;
    }

    private Map<String, Object> handleCounsellingProcessQuery() {
        Map<String, Object> result = new LinkedHashMap<>();

        String response = "### 🎓 Official EAMCET (EAPCET) Counselling Process (Step-by-Step)\n\n"
                + "APSCHE and TGCHE conduct admissions via centralized Web-Based Counselling in 5 stages:\n\n"
                + "1. **Registration & Fee Payment**: Pay the online processing fee on the official portal (`eapcet-sche.aptonline.in`).\n"
                + "2. **Certificate Verification**: Online or offline verification of Intermediate marks memo, Transfer Certificate (TC), Study/Bonafide certificates (Class 6-12), Caste Certificate, and EWS certificate.\n"
                + "3. **Web Options Entry**: The most crucial step! Fill as many college and branch choices as possible. Always rank Government University colleges (AUCE, JNTUK, JNTUH) and top autonomous colleges (CBIT, GVP, VR Siddhartha) at the top.\n"
                + "4. **Mock & Final Seat Allotment**: Seats are allotted based on your state merit rank, category reservation (BC/SC/ST/EWS), and local area quota (AU/SVU/OU).\n"
                + "5. **Self-Reporting & College Joining**: Download the allotment order and complete online self-reporting and physical reporting at the allotted campus.\n\n"
                + "Need help deciding your web options order for a specific rank?";

        result.put("response", response);
        result.put("action", "OPEN_COLLEGES");
        result.put("actionLabel", "Explore Colleges Directory");
        result.put("actionUrl", "/colleges");
        result.put("suggestedChips", List.of("Which college can I get with rank 5000?", "Show CSE colleges in Andhra Pradesh", "What is the cutoff for AUCE?"));
        return result;
    }

    private Map<String, Object> handleTopicExplanationQuery(String lower) {
        Map<String, Object> result = new LinkedHashMap<>();

        if (lower.contains("matrix") || lower.contains("matrices")) {
            String resp = "### 🔢 Simplified Math Concept: Matrices & Determinants\n\n"
                    + "Matrices is one of the highest scoring topics in AP EAPCET (accounts for **~12-14% of the Math section**, ~10-12 marks).\n\n"
                    + "**Key Formulas to Memorize:**\n"
                    + "1. `det(A * B) = det(A) * det(B)`\n"
                    + "2. `det(k * A) = k^n * det(A)` (where n is the matrix order)\n"
                    + "3. `det(adj(A)) = (det(A))^(n - 1)`\n"
                    + "4. `A * adj(A) = det(A) * I`\n"
                    + "5. `A^(-1) = adj(A) / det(A)` (provided `det(A) != 0`)\n\n"
                    + "**Practice Example:** If A is a 3x3 matrix and `det(A) = 4`, then `det(adj(A)) = 4^(3-1) = 4^2 = 16`.\n\n"
                    + "Would you like to try a practice question or move to Vectors & 3D Geometry?";
            result.put("response", resp);
            result.put("suggestedChips", List.of("Give me a Matrices practice question", "High-weightage topics", "Create a study timetable"));
            return result;
        }

        String generalMath = "### 📘 Mastering Intermediate Mathematics for Entrance Exams\n\n"
                + "Maths carries **80 marks** in AP EAPCET (50% of the paper) and **100 marks** in JEE Main.\n\n"
                + "Here are the top high-yield chapters to focus on first:\n"
                + "1. **Matrices & Determinants**: High scoring, low calculation error rate.\n"
                + "2. **Vectors & 3D Geometry**: Direct formula questions (~8-10 marks).\n"
                + "3. **Trigonometry**: Transformation formulas and properties of triangles.\n"
                + "4. **Differential Calculus**: Limits, continuity, and Maxima/Minima.\n"
                + "5. **Coordinate Geometry**: Straight lines and Circles.\n\n"
                + "Tell me which chapter you find hardest, and I will break down the core concepts with shortcuts!";
        result.put("response", generalMath);
        result.put("suggestedChips", List.of("Explain Matrices", "I want a study timetable", "Give me AP EAPCET mock test"));
        return result;
    }

    private Map<String, Object> handleBranchComparisonQuery() {
        Map<String, Object> result = new LinkedHashMap<>();

        String comp = "### ⚖️ Computer Science (CSE) vs Electronics & Communication (ECE)\n\n"
                + "| Feature | Computer Science & Engineering (CSE) | Electronics & Communication (ECE) |\n"
                + "|---|---|---|\n"
                + "| **Core Focus** | Software engineering, data structures, algorithms, AI/ML, cloud systems | Hardware circuits, VLSI, microprocessors, signal processing, IoT |\n"
                + "| **Industry Demand** | High global demand in IT, product firms, startups, fintech | Core semiconductor, chip design (Qualcomm, Intel), telecom + IT eligibility |\n"
                + "| **Placement Trends** | Highest average campus placement packages | Strong placements in top universities; core VLSI packages grow rapidly |\n"
                + "| **Higher Studies** | MS in CS, Artificial Intelligence, Data Science | MS in VLSI, Embedded Systems, Robotics, Telecommunications |\n\n"
                + "💡 **Recommendation for Intermediate Students:**\n"
                + "- Choose **CSE** if you enjoy coding, software logic, app/web development, and product design.\n"
                + "- Choose **ECE** if you like physics, circuits, microcontrollers, and want flexibility between hardware and software tech careers.";

        result.put("response", comp);
        result.put("suggestedChips", List.of("Explore CSE colleges", "Find colleges by rank", "What is the cutoff for AUCE?"));
        return result;
    }

    private Map<String, Object> handleTeluguEnglishQuery(String lower, Map<String, Object> context) {
        Map<String, Object> result = new LinkedHashMap<>();

        String response = "Namaste! 🙏 Laughs With Ramesh Connecting ki swagatam!\n\n"
                + "Intermediate 1st or 2nd year students kosam mana platform lo complete B.Tech guidance unnadhi:\n\n"
                + "- **College Predictor**: Mee rank and category (OC/BC/SC/ST) enter chesthe, previous year official closing ranks base cheskoni eligible colleges choopisthundhi.\n"
                + "- **Mock Tests**: AP EAPCET & JEE Main CBT online practice tests instant solution explanations tho rayavachu.\n"
                + "- **Cutoff Explorer**: AUCE, JNTUK, CBIT lanti top colleges cutoffs clear ga chudavachu.\n"
                + "- **Study Timetable**: Maths (80 marks), Physics, and Chemistry ki daily revision schedule prepare cheyyavachu.\n\n"
                + "Mee exam rank or prepare avthunna exam gurinchi cheppandi, ventane help chesthanu! 😊";

        result.put("response", response);
        result.put("suggestedChips", List.of("Rank 5000 in AP EAPCET", "Give me AP EAPCET mock test", "What is the cutoff for AUCE?"));
        return result;
    }

    private List<String> generateSuggestedChips(Map<String, Object> context) {
        if (!context.containsKey("interYear")) {
            return List.of("I'm in Intermediate 1st year", "I'm in Intermediate 2nd year", "Prepare for AP EAPCET", "Prepare for JEE Main");
        }
        if (!context.containsKey("targetExam")) {
            return List.of("AP EAPCET", "TG EAPCET", "JEE Main", "Both JEE and AP EAPCET");
        }
        if (!context.containsKey("rank")) {
            return List.of("Which college can I get with rank 5000?", "Give me AP EAPCET mock test", "What is the cutoff for AUCE?", "Create a study timetable");
        }
        return List.of("Explore CSE colleges", "Explain EAMCET counselling process", "Take AP EAPCET Mock Test", "CSE vs ECE comparison");
    }

    // ============================================================
    // LIVE GEMINI INTEGRATION (WHEN GEMINI_API_KEY IS AVAILABLE)
    // ============================================================

    private String callGeminiLive(String prompt, List<Map<String, String>> history, Map<String, Object> context) throws Exception {
        String url = String.format(GEMINI_API_URL, geminiModel, geminiApiKey);

        String systemInstruction = "You are LWR AI, the official conversational educational assistant on 'Laughs With Ramesh Connecting' (LWR Connecting). "
                + "Your mission is to guide Intermediate students (Classes 11 & 12) in Andhra Pradesh and Telangana who want to conquer entrance exams (AP EAPCET, TG EAPCET, JEE Main) and choose the best B.Tech colleges. "
                + "Tone: Warm, motivating, mentor-like, educational, clear, and direct. "
                + "Grounding Rules: "
                + "1. Greet student warmly when they say 'Hi'. Ask if they are in Inter 1st or 2nd year, and target exam. "
                + "2. If student shares rank, predict colleges based on realistic historical cutoffs (AUCE, JNTUK, JNTUH, CBIT, etc.). Clearly state cutoffs are historical estimates, not guaranteed admissions. "
                + "3. Never invent fake official announcements. Guide students to platform tools: /mock-tests, /colleges, /cutoffs, /college-predictor. "
                + "4. Support friendly English and Telugu-English transliteration where appropriate.";

        List<Map<String, Object>> contents = new ArrayList<>();

        // Add history
        if (history != null) {
            for (Map<String, String> msg : history) {
                String role = "user".equalsIgnoreCase(msg.get("sender")) ? "user" : "model";
                String text = msg.getOrDefault("text", "");
                if (!text.isBlank()) {
                    contents.add(Map.of("role", role, "parts", List.of(Map.of("text", text))));
                }
            }
        }

        // Add current prompt
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", prompt))));

        Map<String, Object> requestPayload = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
                "contents", contents
        );

        String requestBodyJson = objectMapper.writeValueAsString(requestPayload);

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(timeoutSeconds))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        }
        return null;
    }
}
