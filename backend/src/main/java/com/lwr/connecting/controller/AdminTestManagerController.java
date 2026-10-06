package com.lwr.connecting.controller;

import com.lwr.connecting.dto.*;
import com.lwr.connecting.entity.Question;
import com.lwr.connecting.enums.Difficulty;
import com.lwr.connecting.repository.QuestionValidationRepository;
import com.lwr.connecting.service.AIQuestionService;
import com.lwr.connecting.service.MockTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/tests")
@RequiredArgsConstructor
public class AdminTestManagerController {

    private final MockTestService mockTestService;
    private final AIQuestionService aiQuestionService;
    private final QuestionValidationRepository validationRepository;

    @GetMapping
    public ResponseEntity<List<TestDTO>> getAllTests() {
        return ResponseEntity.ok(mockTestService.getAllTests());
    }

    @PostMapping("/create")
    public ResponseEntity<TestDTO> createTest(@RequestBody CreateTestRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mockTestService.createTest(request));
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<TestDTO> toggleTestStatus(@PathVariable Long id) {
        return ResponseEntity.ok(mockTestService.toggleTestStatus(id));
    }

    @PostMapping("/generate-ai-questions")
    public ResponseEntity<List<Question>> generateAIQuestions(
            @RequestParam Long examId,
            @RequestParam Long subjectId,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Long subTopicId,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(defaultValue = "5") int count,
            @RequestParam(defaultValue = "MOCK_AI") String provider) {
        List<Question> questions = aiQuestionService.generateAndValidateQuestions(
                examId, subjectId, topicId, subTopicId, difficulty, count, provider
        );
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/patterns/{examId}")
    public ResponseEntity<List<ExamTestPatternDTO>> getPatterns(@PathVariable Long examId) {
        return ResponseEntity.ok(mockTestService.getExamTestPatterns(examId));
    }

    @PostMapping("/patterns")
    public ResponseEntity<ExamTestPatternDTO> savePattern(@RequestBody ExamTestPatternDTO patternDTO) {
        return ResponseEntity.ok(mockTestService.saveExamTestPattern(patternDTO));
    }

    @GetMapping("/validations")
    public ResponseEntity<List<Map<String, Object>>> getValidationLogs() {
        List<Map<String, Object>> result = new ArrayList<>();
        validationRepository.findAll().forEach(v -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", v.getId());
            map.put("questionId", v.getQuestion().getId());
            map.put("questionText", v.getQuestion().getQuestionText());
            map.put("sourceType", v.getQuestion().getSourceType());
            map.put("isValid", v.getIsValid());
            map.put("errors", v.getValidationErrors());
            map.put("validatedAt", v.getValidatedAt());
            result.add(map);
        });
        return ResponseEntity.ok(result);
    }
}
