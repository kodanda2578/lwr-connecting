package com.lwr.connecting.service;

import com.lwr.connecting.entity.*;
import com.lwr.connecting.enums.Difficulty;
import com.lwr.connecting.repository.*;
import com.lwr.connecting.service.ai.AIQuestionProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AIQuestionService {

    private final Map<String, AIQuestionProvider> aiProviders;
    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final SubTopicRepository subTopicRepository;
    private final QuestionRepository questionRepository;
    private final QuestionGenerationRequestRepository requestRepository;
    private final QuestionValidationService validationService;

    @Transactional
    public List<Question> generateAndValidateQuestions(Long examId, Long subjectId, Long topicId, Long subTopicId,
                                                       Difficulty difficulty, int count, String providerName) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found: " + examId));

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + subjectId));

        Topic topic = topicId != null ? topicRepository.findById(topicId).orElse(null) : null;
        SubTopic subTopic = subTopicId != null ? subTopicRepository.findById(subTopicId).orElse(null) : null;

        String selectedProvider = (providerName != null && !providerName.isEmpty()) ? providerName.toUpperCase() : "MOCK_AI";

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

        List<Question> rawQuestions = provider.generateQuestions(exam, subject, topic, subTopic, difficulty, count);
        List<Question> validatedQuestions = new ArrayList<>();

        for (Question raw : rawQuestions) {
            // Save initial question to get ID for validation mapping
            Question saved = questionRepository.save(raw);
            QuestionValidation val = validationService.validateQuestion(saved);

            if (Boolean.TRUE.equals(val.getIsValid())) {
                validatedQuestions.add(saved);
            } else {
                saved.setActive(false);
                questionRepository.save(saved);
            }
        }

        req.setStatus("VALIDATED");
        requestRepository.save(req);

        return validatedQuestions;
    }

    private AIQuestionProvider getProvider(String providerName) {
        if ("GEMINI".equalsIgnoreCase(providerName)) {
            AIQuestionProvider p = aiProviders.get("geminiQuestionProvider");
            if (p != null) return p;
        }
        return aiProviders.getOrDefault("mockAIQuestionProvider", aiProviders.values().iterator().next());
    }
}
