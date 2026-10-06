package com.lwr.connecting.controller;

import com.lwr.connecting.entity.*;
import com.lwr.connecting.enums.Difficulty;
import com.lwr.connecting.enums.ExamType;
import com.lwr.connecting.enums.QuestionType;
import com.lwr.connecting.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminExamContentController {

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

    // ============================================================
    // STATE CRUD
    // ============================================================

    @PostMapping("/states")
    public ResponseEntity<?> createState(@RequestBody State state) {
        if (state.getCode() == null || state.getName() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "State code and name are required."));
        }
        State saved = stateRepository.save(state);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/states/{id}")
    public ResponseEntity<?> updateState(@PathVariable Long id, @RequestBody State state) {
        State existing = stateRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        existing.setName(state.getName());
        existing.setCode(state.getCode());
        if (state.getActive() != null) existing.setActive(state.getActive());
        return ResponseEntity.ok(stateRepository.save(existing));
    }

    @DeleteMapping("/states/{id}")
    public ResponseEntity<?> deleteState(@PathVariable Long id) {
        State existing = stateRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        existing.setActive(false);
        stateRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "State deactivated successfully."));
    }

    // ============================================================
    // EXAM CRUD
    // ============================================================

    @PostMapping("/exams")
    public ResponseEntity<?> createExam(@RequestBody Map<String, Object> body) {
        try {
            String code = body.get("code").toString();
            String name = body.get("name").toString();
            String typeStr = body.get("type").toString();
            ExamType type = ExamType.valueOf(typeStr.toUpperCase());
            String description = body.getOrDefault("description", "").toString();

            State state = null;
            if (body.get("stateId") != null) {
                Long stateId = Long.parseLong(body.get("stateId").toString());
                state = stateRepository.findById(stateId).orElse(null);
            }

            Exam exam = Exam.builder()
                    .code(code)
                    .name(name)
                    .type(type)
                    .state(state)
                    .description(description)
                    .active(true)
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(examRepository.save(exam));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create exam: " + e.getMessage()));
        }
    }

    @PutMapping("/exams/{id}")
    public ResponseEntity<?> updateExam(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Exam existing = examRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();

        if (body.get("name") != null) existing.setName(body.get("name").toString());
        if (body.get("code") != null) existing.setCode(body.get("code").toString());
        if (body.get("description") != null) existing.setDescription(body.get("description").toString());
        if (body.get("type") != null) existing.setType(ExamType.valueOf(body.get("type").toString().toUpperCase()));
        if (body.get("active") != null) existing.setActive(Boolean.parseBoolean(body.get("active").toString()));

        if (body.get("stateId") != null) {
            Long stateId = Long.parseLong(body.get("stateId").toString());
            existing.setState(stateRepository.findById(stateId).orElse(null));
        }

        return ResponseEntity.ok(examRepository.save(existing));
    }

    @DeleteMapping("/exams/{id}")
    public ResponseEntity<?> deleteExam(@PathVariable Long id) {
        Exam existing = examRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        existing.setActive(false);
        examRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Exam deactivated successfully."));
    }

    // ============================================================
    // SUBJECT CRUD
    // ============================================================

    @PostMapping("/subjects")
    public ResponseEntity<?> createSubject(@RequestBody Subject subject) {
        Subject saved = subjectRepository.save(subject);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/subjects/{id}")
    public ResponseEntity<?> updateSubject(@PathVariable Long id, @RequestBody Subject subject) {
        Subject existing = subjectRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        existing.setName(subject.getName());
        existing.setCode(subject.getCode());
        if (subject.getActive() != null) existing.setActive(subject.getActive());
        return ResponseEntity.ok(subjectRepository.save(existing));
    }

    // ============================================================
    // TOPIC CRUD
    // ============================================================

    @PostMapping("/topics")
    public ResponseEntity<?> createTopic(@RequestBody Map<String, Object> body) {
        try {
            Long subjectId = Long.parseLong(body.get("subjectId").toString());
            Subject subject = subjectRepository.findById(subjectId).orElseThrow();

            Exam exam = null;
            if (body.get("examId") != null && !body.get("examId").toString().isBlank()) {
                Long examId = Long.parseLong(body.get("examId").toString());
                exam = examRepository.findById(examId).orElse(null);
            }

            String name = body.get("name").toString();
            Double weightage = body.get("weightagePercentage") != null ? Double.parseDouble(body.get("weightagePercentage").toString()) : null;
            String sourceRef = body.getOrDefault("sourceReference", "").toString();

            Topic topic = Topic.builder()
                    .subject(subject)
                    .exam(exam)
                    .name(name)
                    .weightagePercentage(weightage)
                    .sourceReference(sourceRef)
                    .active(true)
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(topicRepository.save(topic));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create topic: " + e.getMessage()));
        }
    }

    @PutMapping("/topics/{id}")
    public ResponseEntity<?> updateTopic(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Topic existing = topicRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();

        if (body.get("name") != null) existing.setName(body.get("name").toString());
        if (body.get("weightagePercentage") != null) {
            existing.setWeightagePercentage(Double.parseDouble(body.get("weightagePercentage").toString()));
        }
        if (body.get("sourceReference") != null) {
            existing.setSourceReference(body.get("sourceReference").toString());
        }
        if (body.get("active") != null) {
            existing.setActive(Boolean.parseBoolean(body.get("active").toString()));
        }
        return ResponseEntity.ok(topicRepository.save(existing));
    }

    @DeleteMapping("/topics/{id}")
    public ResponseEntity<?> deleteTopic(@PathVariable Long id) {
        Topic existing = topicRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        existing.setActive(false);
        topicRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Topic deactivated successfully."));
    }

    // ============================================================
    // SUBTOPIC CRUD
    // ============================================================

    @PostMapping("/subtopics")
    public ResponseEntity<?> createSubTopic(@RequestBody Map<String, Object> body) {
        try {
            Long topicId = Long.parseLong(body.get("topicId").toString());
            Topic topic = topicRepository.findById(topicId).orElseThrow();
            String name = body.get("name").toString();
            String description = body.getOrDefault("description", "").toString();

            SubTopic subTopic = SubTopic.builder()
                    .topic(topic)
                    .name(name)
                    .description(description)
                    .active(true)
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(subTopicRepository.save(subTopic));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create subtopic: " + e.getMessage()));
        }
    }

    // ============================================================
    // QUESTION CRUD (FULL ADMIN CONTROLS)
    // ============================================================

    @PostMapping("/questions")
    public ResponseEntity<?> createQuestion(@RequestBody Map<String, Object> body) {
        try {
            Long examId = Long.parseLong(body.get("examId").toString());
            Exam exam = examRepository.findById(examId).orElseThrow(() -> new RuntimeException("Exam not found"));

            Long subjectId = Long.parseLong(body.get("subjectId").toString());
            Subject subject = subjectRepository.findById(subjectId).orElseThrow(() -> new RuntimeException("Subject not found"));

            Topic topic = null;
            if (body.get("topicId") != null && !body.get("topicId").toString().isBlank()) {
                Long topicId = Long.parseLong(body.get("topicId").toString());
                topic = topicRepository.findById(topicId).orElse(null);
            }

            SubTopic subTopic = null;
            if (body.get("subtopicId") != null && !body.get("subtopicId").toString().isBlank()) {
                Long subTopicId = Long.parseLong(body.get("subtopicId").toString());
                subTopic = subTopicRepository.findById(subTopicId).orElse(null);
            }

            Integer examYear = body.get("examYear") != null ? Integer.parseInt(body.get("examYear").toString()) : 2024;
            String questionText = body.get("questionText").toString();
            String imageUrl = body.getOrDefault("imageUrl", "").toString();
            String optionA = body.getOrDefault("optionA", "").toString();
            String optionB = body.getOrDefault("optionB", "").toString();
            String optionC = body.getOrDefault("optionC", "").toString();
            String optionD = body.getOrDefault("optionD", "").toString();
            String correctOption = body.get("correctOption").toString();
            
            Difficulty difficulty = Difficulty.valueOf(body.getOrDefault("difficulty", "MEDIUM").toString().toUpperCase());
            QuestionType questionType = QuestionType.valueOf(body.getOrDefault("questionType", "SINGLE_CHOICE").toString().toUpperCase());
            Integer marks = body.get("marks") != null ? Integer.parseInt(body.get("marks").toString()) : 4;
            Integer negativeMarks = body.get("negativeMarks") != null ? Integer.parseInt(body.get("negativeMarks").toString()) : 1;
            String explanation = body.getOrDefault("explanation", "").toString();
            String sourceReference = body.getOrDefault("sourceReference", "").toString();

            Question question = Question.builder()
                    .exam(exam)
                    .examYear(examYear)
                    .subject(subject)
                    .topic(topic)
                    .subTopic(subTopic)
                    .questionText(questionText)
                    .imageUrl(imageUrl)
                    .optionA(optionA)
                    .optionB(optionB)
                    .optionC(optionC)
                    .optionD(optionD)
                    .correctOption(correctOption)
                    .difficulty(difficulty)
                    .questionType(questionType)
                    .marks(marks)
                    .negativeMarks(negativeMarks)
                    .explanation(explanation)
                    .sourceReference(sourceReference)
                    .active(true)
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(questionRepository.save(question));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create question: " + e.getMessage()));
        }
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Question existing = questionRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();

        try {
            if (body.get("examId") != null) {
                Long examId = Long.parseLong(body.get("examId").toString());
                existing.setExam(examRepository.findById(examId).orElse(existing.getExam()));
            }
            if (body.get("subjectId") != null) {
                Long subjectId = Long.parseLong(body.get("subjectId").toString());
                existing.setSubject(subjectRepository.findById(subjectId).orElse(existing.getSubject()));
            }
            if (body.get("topicId") != null) {
                Long topicId = Long.parseLong(body.get("topicId").toString());
                existing.setTopic(topicRepository.findById(topicId).orElse(null));
            }
            if (body.get("subtopicId") != null) {
                Long subTopicId = Long.parseLong(body.get("subtopicId").toString());
                existing.setSubTopic(subTopicRepository.findById(subTopicId).orElse(null));
            }
            if (body.get("examYear") != null) {
                existing.setExamYear(Integer.parseInt(body.get("examYear").toString()));
            }
            if (body.get("questionText") != null) {
                existing.setQuestionText(body.get("questionText").toString());
            }
            if (body.get("imageUrl") != null) existing.setImageUrl(body.get("imageUrl").toString());
            if (body.get("optionA") != null) existing.setOptionA(body.get("optionA").toString());
            if (body.get("optionB") != null) existing.setOptionB(body.get("optionB").toString());
            if (body.get("optionC") != null) existing.setOptionC(body.get("optionC").toString());
            if (body.get("optionD") != null) existing.setOptionD(body.get("optionD").toString());
            if (body.get("correctOption") != null) existing.setCorrectOption(body.get("correctOption").toString());
            if (body.get("difficulty") != null) {
                existing.setDifficulty(Difficulty.valueOf(body.get("difficulty").toString().toUpperCase()));
            }
            if (body.get("questionType") != null) {
                existing.setQuestionType(QuestionType.valueOf(body.get("questionType").toString().toUpperCase()));
            }
            if (body.get("marks") != null) existing.setMarks(Integer.parseInt(body.get("marks").toString()));
            if (body.get("negativeMarks") != null) existing.setNegativeMarks(Integer.parseInt(body.get("negativeMarks").toString()));
            if (body.get("explanation") != null) existing.setExplanation(body.get("explanation").toString());
            if (body.get("sourceReference") != null) existing.setSourceReference(body.get("sourceReference").toString());
            if (body.get("active") != null) existing.setActive(Boolean.parseBoolean(body.get("active").toString()));

            return ResponseEntity.ok(questionRepository.save(existing));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update question: " + e.getMessage()));
        }
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        Question existing = questionRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        existing.setActive(false);
        questionRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Question deactivated successfully."));
    }
}
