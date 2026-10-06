package com.lwr.connecting.service;

import com.lwr.connecting.entity.Question;
import com.lwr.connecting.entity.QuestionValidation;
import com.lwr.connecting.enums.QuestionSourceType;
import com.lwr.connecting.enums.QuestionType;
import com.lwr.connecting.repository.QuestionRepository;
import com.lwr.connecting.repository.QuestionValidationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionValidationService {

    private final QuestionRepository questionRepository;
    private final QuestionValidationRepository questionValidationRepository;

    @Transactional
    public QuestionValidation validateQuestion(Question q) {
        List<String> errors = new ArrayList<>();

        if (q.getQuestionText() == null || q.getQuestionText().trim().isEmpty()) {
            errors.add("Question text cannot be empty");
        }

        if (q.getExam() == null) {
            errors.add("Exam must be assigned");
        }

        if (q.getSubject() == null) {
            errors.add("Subject must be assigned");
        }

        if (q.getTopic() == null) {
            errors.add("Topic must be assigned");
        }

        if (q.getDifficulty() == null) {
            errors.add("Difficulty must be assigned");
        }

        if (q.getExplanation() == null || q.getExplanation().trim().isEmpty()) {
            errors.add("Explanation must be provided");
        }

        if (q.getMarks() == null || q.getMarks() <= 0) {
            errors.add("Marks must be greater than 0");
        }

        if (q.getNegativeMarks() == null || q.getNegativeMarks() < 0) {
            errors.add("Negative marks must be non-negative");
        }

        // Single Choice Validation
        if (q.getQuestionType() == null || q.getQuestionType() == QuestionType.SINGLE_CHOICE) {
            if (q.getOptionA() == null || q.getOptionA().trim().isEmpty() ||
                q.getOptionB() == null || q.getOptionB().trim().isEmpty() ||
                q.getOptionC() == null || q.getOptionC().trim().isEmpty() ||
                q.getOptionD() == null || q.getOptionD().trim().isEmpty()) {
                errors.add("Single choice questions must have options A, B, C, and D");
            }

            if (q.getCorrectOption() == null || !List.of("A", "B", "C", "D", "a", "b", "c", "d").contains(q.getCorrectOption().trim())) {
                errors.add("Correct option for SINGLE_CHOICE must be A, B, C, or D");
            }
        }

        // Source Mislabeling check
        if (q.getSourceType() == QuestionSourceType.AI_GENERATED) {
            if (q.getExamYear() != null) {
                errors.add("AI-generated questions cannot have a historical PYQ exam year");
            }
            if (q.getSourceReference() != null && q.getSourceReference().toLowerCase().contains("official pyq")) {
                errors.add("AI-generated question cannot be mislabeled as Official PYQ");
            }
        }

        // Duplicate question check
        if (q.getQuestionText() != null && !q.getQuestionText().trim().isEmpty()) {
            List<Question> existing = questionRepository.findByExamIdAndActiveTrue(q.getExam() != null ? q.getExam().getId() : 0L);
            boolean isDuplicate = existing.stream()
                .anyMatch(ex -> !ex.getId().equals(q.getId() != null ? q.getId() : -1L) &&
                                ex.getQuestionText().equalsIgnoreCase(q.getQuestionText().trim()));
            if (isDuplicate) {
                errors.add("Duplicate question text already exists in database");
            }
        }

        boolean isValid = errors.isEmpty();
        String errorMsg = isValid ? "VALID" : String.join("; ", errors);

        QuestionValidation validation = QuestionValidation.builder()
                .question(q)
                .isValid(isValid)
                .validationErrors(errorMsg)
                .validatedAt(LocalDateTime.now())
                .build();

        return questionValidationRepository.save(validation);
    }
}
