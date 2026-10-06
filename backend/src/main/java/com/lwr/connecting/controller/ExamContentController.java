package com.lwr.connecting.controller;

import com.lwr.connecting.entity.*;
import com.lwr.connecting.enums.ExamType;
import com.lwr.connecting.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ExamContentController {

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private SubTopicRepository subTopicRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @GetMapping("/states")
    public ResponseEntity<List<State>> getAllStates() {
        return ResponseEntity.ok(stateRepository.findByActiveTrueOrderByNameAsc());
    }

    @GetMapping("/exams")
    public ResponseEntity<List<Exam>> getAllExams(@RequestParam(required = false) String type) {
        if (type != null && !type.isBlank()) {
            try {
                ExamType examType = ExamType.valueOf(type.toUpperCase());
                return ResponseEntity.ok(examRepository.findByTypeAndActiveTrue(examType));
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(examRepository.findByActiveTrueOrderByNameAsc());
    }

    @GetMapping("/exams/{id}")
    public ResponseEntity<?> getExamById(@PathVariable Long id) {
        Exam exam = examRepository.findById(id).orElse(null);
        if (exam == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(exam);
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectRepository.findByActiveTrueOrderByNameAsc());
    }

    @GetMapping("/topics")
    public ResponseEntity<List<Topic>> getTopics(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long examId) {
        if (subjectId != null && examId != null) {
            return ResponseEntity.ok(topicRepository.findBySubjectIdAndExamIdAndActiveTrueOrderByNameAsc(subjectId, examId));
        } else if (subjectId != null) {
            return ResponseEntity.ok(topicRepository.findBySubjectIdAndActiveTrueOrderByNameAsc(subjectId));
        } else if (examId != null) {
            return ResponseEntity.ok(topicRepository.findByExamIdAndActiveTrueOrderByNameAsc(examId));
        }
        return ResponseEntity.ok(topicRepository.findByActiveTrueOrderByNameAsc());
    }

    @GetMapping("/subtopics")
    public ResponseEntity<List<SubTopic>> getSubTopics(@RequestParam(required = false) Long topicId) {
        if (topicId != null) {
            return ResponseEntity.ok(subTopicRepository.findByTopicIdAndActiveTrueOrderByNameAsc(topicId));
        }
        return ResponseEntity.ok(subTopicRepository.findByActiveTrueOrderByNameAsc());
    }

    @GetMapping("/exams/{examId}/years")
    public ResponseEntity<List<Integer>> getExamYears(@PathVariable Long examId) {
        return ResponseEntity.ok(questionRepository.findYearsByExamId(examId));
    }
}
