package com.lwr.connecting.controller;

import com.lwr.connecting.entity.Question;
import com.lwr.connecting.enums.Difficulty;
import com.lwr.connecting.enums.QuestionType;
import com.lwr.connecting.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {

    @Autowired
    private QuestionRepository questionRepository;

    @GetMapping
    public ResponseEntity<List<Question>> getQuestions(
            @RequestParam(required = false) Long examId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String questionType,
            @RequestParam(required = false) String search) {

        Difficulty diffEnum = null;
        if (difficulty != null && !difficulty.isBlank()) {
            try {
                diffEnum = Difficulty.valueOf(difficulty.toUpperCase());
            } catch (Exception ignored) {}
        }

        QuestionType typeEnum = null;
        if (questionType != null && !questionType.isBlank()) {
            try {
                typeEnum = QuestionType.valueOf(questionType.toUpperCase());
            } catch (Exception ignored) {}
        }

        String searchPattern = (search != null && !search.isBlank()) ? search.trim() : null;

        List<Question> questions = questionRepository.filterQuestions(
                examId, subjectId, topicId, year, diffEnum, typeEnum, searchPattern
        );

        return ResponseEntity.ok(questions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestionById(@PathVariable Long id) {
        Question q = questionRepository.findById(id).orElse(null);
        if (q == null || !Boolean.TRUE.equals(q.getActive())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(q);
    }
}
