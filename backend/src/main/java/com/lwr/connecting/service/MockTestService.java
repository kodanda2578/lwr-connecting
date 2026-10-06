package com.lwr.connecting.service;

import com.lwr.connecting.dto.*;
import com.lwr.connecting.entity.*;
import com.lwr.connecting.enums.*;
import com.lwr.connecting.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MockTestService {

    private final TestRepository testRepository;
    private final TestQuestionRepository testQuestionRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final TestAnswerRepository testAnswerRepository;
    private final QuestionRepository questionRepository;
    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final ExamTestPatternRepository examTestPatternRepository;
    private final AIQuestionService aiQuestionService;

    @Transactional
    public TestDTO createTest(CreateTestRequestDTO req) {
        Exam exam = examRepository.findById(req.getExamId())
                .orElseThrow(() -> new IllegalArgumentException("Exam not found: " + req.getExamId()));

        TestType testType = req.getTestType() != null ? req.getTestType() : TestType.TOPIC_MOCK;
        int targetCount = (req.getTotalQuestions() != null && req.getTotalQuestions() > 0) ? req.getTotalQuestions() : 10;
        int duration = (req.getDurationMinutes() != null && req.getDurationMinutes() > 0) ? req.getDurationMinutes() : 30;

        String title = (req.getTitle() != null && !req.getTitle().isBlank())
                ? req.getTitle()
                : String.format("%s %s (%d Qs)", exam.getName(), testType.name().replace('_', ' '), targetCount);

        List<Question> selectedQuestions = new ArrayList<>();

        // 1. Fetch available matching questions from bank
        List<Question> availableInBank = questionRepository.filterQuestions(
                exam.getId(),
                req.getSubjectId(),
                req.getTopicId(),
                null,
                req.getDifficulty(),
                null,
                null
        );

        selectedQuestions.addAll(availableInBank);

        // 2. If questions in bank are insufficient and AI generation is enabled, generate via AI
        if (selectedQuestions.size() < targetCount && Boolean.TRUE.equals(req.getUseAiGeneration())) {
            int missingCount = targetCount - selectedQuestions.size();
            Subject subject = (req.getSubjectId() != null)
                    ? subjectRepository.findById(req.getSubjectId()).orElse(null)
                    : subjectRepository.findByExamId(exam.getId()).stream().findFirst().orElse(null);

            if (subject != null) {
                List<Question> aiGenerated = aiQuestionService.generateAndValidateQuestions(
                        exam.getId(),
                        subject.getId(),
                        req.getTopicId(),
                        null,
                        req.getDifficulty() != null ? req.getDifficulty() : Difficulty.MEDIUM,
                        missingCount,
                        req.getAiProvider() != null ? req.getAiProvider() : "MOCK_AI"
                );
                selectedQuestions.addAll(aiGenerated);
            }
        }

        // Limit to requested target count
        if (selectedQuestions.size() > targetCount) {
            selectedQuestions = selectedQuestions.subList(0, targetCount);
        }

        int totalQuestions = selectedQuestions.size();
        int totalMarks = selectedQuestions.stream().mapToInt(q -> q.getMarks() != null ? q.getMarks() : 4).sum();

        Test test = Test.builder()
                .exam(exam)
                .testType(testType)
                .title(title)
                .instructions(req.getInstructions() != null ? req.getInstructions() : "Read all questions carefully. Standard negative marking applies.")
                .durationMinutes(duration)
                .totalQuestions(totalQuestions)
                .totalMarks(totalMarks)
                .negativeMarking(req.getNegativeMarking() != null ? req.getNegativeMarking() : true)
                .active(true)
                .createdDate(LocalDateTime.now())
                .build();

        Test savedTest = testRepository.save(test);

        int order = 1;
        for (Question q : selectedQuestions) {
            TestQuestion tq = TestQuestion.builder()
                    .test(savedTest)
                    .question(q)
                    .orderIndex(order++)
                    .marks(q.getMarks() != null ? q.getMarks() : 4)
                    .negativeMarks(q.getNegativeMarks() != null ? q.getNegativeMarks() : 1)
                    .build();
            testQuestionRepository.save(tq);
        }

        return mapToTestDTO(savedTest, true);
    }

    @Transactional
    public TestDTO createGrandTest(Long examId, String title) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found: " + examId));

        List<ExamTestPattern> patterns = examTestPatternRepository.findByExamId(examId);

        // Fallback default patterns if none configured for exam
        if (patterns.isEmpty()) {
            List<Subject> subjects = subjectRepository.findByExamId(examId);
            patterns = new ArrayList<>();
            int countPerSubject = exam.getCategory() == com.lwr.connecting.enums.ExamCategory.STATE ? 40 : 25;
            for (Subject sub : subjects) {
                patterns.add(ExamTestPattern.builder()
                        .exam(exam)
                        .subject(sub)
                        .questionCount(countPerSubject)
                        .marksPerQuestion(exam.getCategory() == com.lwr.connecting.enums.ExamCategory.STATE ? 1 : 4)
                        .negativeMarks(exam.getCategory() == com.lwr.connecting.enums.ExamCategory.STATE ? 0 : 1)
                        .durationMinutes(60)
                        .build());
            }
        }

        List<Question> testQuestions = new ArrayList<>();
        int totalDuration = patterns.stream().mapToInt(p -> p.getDurationMinutes() != null ? p.getDurationMinutes() : 60).findFirst().orElse(180);
        if (totalDuration < 180 && patterns.size() >= 3) totalDuration = 180;

        for (ExamTestPattern p : patterns) {
            List<Question> bank = questionRepository.findByExamIdAndSubjectIdAndActiveTrue(examId, p.getSubject().getId());
            if (bank.size() < p.getQuestionCount()) {
                int need = p.getQuestionCount() - bank.size();
                List<Question> aiQs = aiQuestionService.generateAndValidateQuestions(
                        examId, p.getSubject().getId(), null, null, Difficulty.MEDIUM, need, "MOCK_AI"
                );
                bank.addAll(aiQs);
            }
            if (bank.size() > p.getQuestionCount()) {
                bank = bank.subList(0, p.getQuestionCount());
            }
            testQuestions.addAll(bank);
        }

        int totalQuestions = testQuestions.size();
        int totalMarks = testQuestions.stream().mapToInt(q -> q.getMarks() != null ? q.getMarks() : 4).sum();

        String testTitle = (title != null && !title.isBlank())
                ? title
                : String.format("%s Official Pattern Grand Test", exam.getName());

        Test test = Test.builder()
                .exam(exam)
                .testType(TestType.GRAND_TEST)
                .title(testTitle)
                .instructions("Official Exam Pattern Grand Test. Anti-cheating timer active. Auto-submits on completion.")
                .durationMinutes(totalDuration)
                .totalQuestions(totalQuestions)
                .totalMarks(totalMarks)
                .negativeMarking(true)
                .active(true)
                .createdDate(LocalDateTime.now())
                .build();

        Test saved = testRepository.save(test);

        int orderIndex = 1;
        for (Question q : testQuestions) {
            TestQuestion tq = TestQuestion.builder()
                    .test(saved)
                    .question(q)
                    .orderIndex(orderIndex++)
                    .marks(q.getMarks() != null ? q.getMarks() : 4)
                    .negativeMarks(q.getNegativeMarks() != null ? q.getNegativeMarks() : 1)
                    .build();
            testQuestionRepository.save(tq);
        }

        return mapToTestDTO(saved, true);
    }

    @Transactional
    public TestAttemptDTO startAttempt(Long testId, User user) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Test not found: " + testId));

        Optional<TestAttempt> existing = testAttemptRepository.findFirstByUserIdAndTestIdAndStatus(
                user.getId(), testId, AttemptStatus.IN_PROGRESS
        );

        if (existing.isPresent()) {
            return mapToAttemptDTO(existing.get());
        }

        TestAttempt attempt = TestAttempt.builder()
                .test(test)
                .user(user)
                .startTime(LocalDateTime.now())
                .status(AttemptStatus.IN_PROGRESS)
                .build();

        TestAttempt saved = testAttemptRepository.save(attempt);

        List<TestQuestion> tqs = testQuestionRepository.findByTestIdOrderByOrderIndexAsc(testId);
        for (TestQuestion tq : tqs) {
            TestAnswer ans = TestAnswer.builder()
                    .testAttempt(saved)
                    .question(tq.getQuestion())
                    .markedForReview(false)
                    .build();
            testAnswerRepository.save(ans);
        }

        return mapToAttemptDTO(saved);
    }

    @Transactional
    public TestResultDTO submitAttempt(SubmitTestDTO dto, User user) {
        TestAttempt attempt = testAttemptRepository.findById(dto.getAttemptId())
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + dto.getAttemptId()));

        if (!attempt.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new IllegalStateException("Unauthorized to submit attempt");
        }

        Test test = attempt.getTest();
        List<TestQuestion> tqs = testQuestionRepository.findByTestIdOrderByOrderIndexAsc(test.getId());
        List<TestAnswer> existingAnswers = testAnswerRepository.findByTestAttemptId(attempt.getId());

        Map<Long, TestAnswer> answerMap = existingAnswers.stream()
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a));

        int totalScore = 0;
        int correctCount = 0;
        int incorrectCount = 0;
        int unattemptedCount = 0;

        if (dto.getAnswers() != null) {
            for (TestAnswerDTO inputAns : dto.getAnswers()) {
                TestAnswer ans = answerMap.get(inputAns.getQuestionId());
                if (ans != null) {
                    ans.setSelectedOption(inputAns.getSelectedOption());
                    ans.setTimeSpentSeconds(inputAns.getTimeSpentSeconds());
                    ans.setMarkedForReview(Boolean.TRUE.equals(inputAns.getMarkedForReview()));
                }
            }
        }

        for (TestQuestion tq : tqs) {
            Question q = tq.getQuestion();
            TestAnswer ans = answerMap.get(q.getId());

            String selected = (ans != null) ? ans.getSelectedOption() : null;
            if (selected != null && !selected.isBlank()) {
                boolean correct = selected.trim().equalsIgnoreCase(q.getCorrectOption().trim());
                ans.setIsCorrect(correct);
                if (correct) {
                    totalScore += tq.getMarks();
                    correctCount++;
                } else {
                    if (Boolean.TRUE.equals(test.getNegativeMarking())) {
                        totalScore -= tq.getNegativeMarks();
                    }
                    incorrectCount++;
                }
            } else {
                if (ans != null) ans.setIsCorrect(null);
                unattemptedCount++;
            }
            if (ans != null) {
                testAnswerRepository.save(ans);
            }
        }

        double accuracy = (correctCount + incorrectCount > 0)
                ? ((double) correctCount / (correctCount + incorrectCount)) * 100.0
                : 0.0;

        attempt.setEndTime(LocalDateTime.now());
        attempt.setTotalTimeSpentSeconds(dto.getTotalTimeSpentSeconds() != null ? dto.getTotalTimeSpentSeconds() : 0);
        attempt.setScore(totalScore);
        attempt.setTotalCorrect(correctCount);
        attempt.setTotalIncorrect(incorrectCount);
        attempt.setTotalUnattempted(unattemptedCount);
        attempt.setAccuracyPercentage(Math.round(accuracy * 100.0) / 100.0);
        attempt.setStatus(AttemptStatus.SUBMITTED);

        TestAttempt savedAttempt = testAttemptRepository.save(attempt);

        return getTestResult(savedAttempt.getId(), user);
    }

    @Transactional(readOnly = true)
    public TestResultDTO getTestResult(Long attemptId, User user) {
        TestAttempt attempt = testAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId));

        if (!attempt.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new IllegalStateException("Unauthorized view");
        }

        Test test = attempt.getTest();
        List<TestQuestion> tqs = testQuestionRepository.findByTestIdOrderByOrderIndexAsc(test.getId());
        List<TestAnswer> answers = testAnswerRepository.findByTestAttemptId(attemptId);
        Map<Long, TestAnswer> answerMap = answers.stream().collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a));

        Map<String, TestResultDTO.SubjectPerformance> subjectMap = new HashMap<>();
        Map<String, TestResultDTO.TopicPerformance> topicMap = new HashMap<>();
        Map<String, TestResultDTO.DifficultyPerformance> diffMap = new HashMap<>();
        List<TestResultDTO.DetailedSolutionDTO> solutions = new ArrayList<>();

        for (TestQuestion tq : tqs) {
            Question q = tq.getQuestion();
            TestAnswer ans = answerMap.get(q.getId());
            String selected = ans != null ? ans.getSelectedOption() : null;
            Boolean isCorrect = ans != null ? ans.getIsCorrect() : null;

            String subjectName = q.getSubject() != null ? q.getSubject().getName() : "General";
            String topicName = q.getTopic() != null ? q.getTopic().getName() : "General";
            String diff = q.getDifficulty() != null ? q.getDifficulty().name() : "MEDIUM";

            // Subject breakdown
            TestResultDTO.SubjectPerformance sp = subjectMap.computeIfAbsent(subjectName, k ->
                    TestResultDTO.SubjectPerformance.builder().subjectName(k).build());
            sp.setTotalQuestions(sp.getTotalQuestions() + 1);

            // Topic breakdown
            TestResultDTO.TopicPerformance tp = topicMap.computeIfAbsent(topicName, k ->
                    TestResultDTO.TopicPerformance.builder().topicName(k).build());
            tp.setTotalQuestions(tp.getTotalQuestions() + 1);

            // Difficulty breakdown
            TestResultDTO.DifficultyPerformance dp = diffMap.computeIfAbsent(diff, k ->
                    TestResultDTO.DifficultyPerformance.builder().difficulty(k).build());
            dp.setTotalQuestions(dp.getTotalQuestions() + 1);

            if (Boolean.TRUE.equals(isCorrect)) {
                sp.setCorrect(sp.getCorrect() + 1);
                sp.setScore(sp.getScore() + tq.getMarks());
                tp.setCorrect(tp.getCorrect() + 1);
                dp.setCorrect(dp.getCorrect() + 1);
            } else if (Boolean.FALSE.equals(isCorrect)) {
                sp.setIncorrect(sp.getIncorrect() + 1);
                if (Boolean.TRUE.equals(test.getNegativeMarking())) sp.setScore(sp.getScore() - tq.getNegativeMarks());
                tp.setIncorrect(tp.getIncorrect() + 1);
                dp.setIncorrect(dp.getIncorrect() + 1);
            } else {
                sp.setUnattempted(sp.getUnattempted() + 1);
                tp.setUnattempted(tp.getUnattempted() + 1);
                dp.setUnattempted(dp.getUnattempted() + 1);
            }

            // Solution DTO
            solutions.add(TestResultDTO.DetailedSolutionDTO.builder()
                    .questionId(q.getId())
                    .questionText(q.getQuestionText())
                    .imageUrl(q.getImageUrl())
                    .optionA(q.getOptionA())
                    .optionB(q.getOptionB())
                    .optionC(q.getOptionC())
                    .optionD(q.getOptionD())
                    .selectedOption(selected)
                    .correctOption(q.getCorrectOption())
                    .isCorrect(isCorrect)
                    .marks(tq.getMarks())
                    .negativeMarks(tq.getNegativeMarks())
                    .explanation(q.getExplanation() != null ? q.getExplanation() : "Step-by-step concept analysis provided by LWR Engine.")
                    .subjectName(subjectName)
                    .topicName(topicName)
                    .subTopicName(q.getSubTopic() != null ? q.getSubTopic().getName() : "")
                    .difficulty(diff)
                    .sourceType(q.getSourceType() != null ? q.getSourceType().name() : "PYQ")
                    .sourceReference(q.getSourceReference())
                    .build());
        }

        // Compute accuracies
        subjectMap.values().forEach(sp -> sp.setAccuracy(sp.getCorrect() + sp.getIncorrect() > 0 ? Math.round(((double) sp.getCorrect() / (sp.getCorrect() + sp.getIncorrect())) * 10000.0) / 100.0 : 0.0));
        topicMap.values().forEach(tp -> tp.setAccuracy(tp.getCorrect() + tp.getIncorrect() > 0 ? Math.round(((double) tp.getCorrect() / (tp.getCorrect() + tp.getIncorrect())) * 10000.0) / 100.0 : 0.0));
        diffMap.values().forEach(dp -> dp.setAccuracy(dp.getCorrect() + dp.getIncorrect() > 0 ? Math.round(((double) dp.getCorrect() / (dp.getCorrect() + dp.getIncorrect())) * 10000.0) / 100.0 : 0.0));

        return TestResultDTO.builder()
                .attempt(mapToAttemptDTO(attempt))
                .test(mapToTestDTO(test, false))
                .subjectPerformance(subjectMap)
                .topicPerformance(topicMap)
                .difficultyPerformance(diffMap)
                .solutions(solutions)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TestDTO> getAvailableTests(Long examId, TestType testType) {
        List<Test> tests;
        if (examId != null && testType != null) {
            tests = testRepository.findByExamIdAndActiveTrue(examId).stream()
                    .filter(t -> t.getTestType() == testType)
                    .collect(Collectors.toList());
        } else if (examId != null) {
            tests = testRepository.findByExamIdAndActiveTrue(examId);
        } else if (testType != null) {
            tests = testRepository.findByTestTypeAndActiveTrue(testType);
        } else {
            tests = testRepository.findByActiveTrueOrderByCreatedDateDesc();
        }
        return tests.stream().map(t -> mapToTestDTO(t, false)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TestDTO getTestById(Long testId, boolean sanitizeAnswers) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Test not found: " + testId));
        return mapToTestDTO(test, sanitizeAnswers);
    }

    @Transactional(readOnly = true)
    public List<TestAttemptDTO> getStudentAttempts(User user) {
        return testAttemptRepository.findByUserIdOrderByStartTimeDesc(user.getId())
                .stream().map(this::mapToAttemptDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestDTO> getAllTests() {
        return testRepository.findAll().stream()
                .map(t -> mapToTestDTO(t, false))
                .collect(Collectors.toList());
    }

    @Transactional
    public TestDTO toggleTestStatus(Long testId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Test not found: " + testId));
        test.setActive(!Boolean.TRUE.equals(test.getActive()));
        return mapToTestDTO(testRepository.save(test), false);
    }

    @Transactional(readOnly = true)
    public List<ExamTestPatternDTO> getExamTestPatterns(Long examId) {
        return examTestPatternRepository.findByExamId(examId).stream()
                .map(p -> ExamTestPatternDTO.builder()
                        .id(p.getId())
                        .examId(p.getExam().getId())
                        .examName(p.getExam().getName())
                        .subjectId(p.getSubject().getId())
                        .subjectName(p.getSubject().getName())
                        .questionCount(p.getQuestionCount())
                        .marksPerQuestion(p.getMarksPerQuestion())
                        .negativeMarks(p.getNegativeMarks())
                        .durationMinutes(p.getDurationMinutes())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public ExamTestPatternDTO saveExamTestPattern(ExamTestPatternDTO dto) {
        Exam exam = examRepository.findById(dto.getExamId())
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));

        ExamTestPattern pattern = ExamTestPattern.builder()
                .id(dto.getId())
                .exam(exam)
                .subject(subject)
                .questionCount(dto.getQuestionCount())
                .marksPerQuestion(dto.getMarksPerQuestion())
                .negativeMarks(dto.getNegativeMarks())
                .durationMinutes(dto.getDurationMinutes())
                .build();

        ExamTestPattern saved = examTestPatternRepository.save(pattern);
        return ExamTestPatternDTO.builder()
                .id(saved.getId())
                .examId(saved.getExam().getId())
                .examName(saved.getExam().getName())
                .subjectId(saved.getSubject().getId())
                .subjectName(saved.getSubject().getName())
                .questionCount(saved.getQuestionCount())
                .marksPerQuestion(saved.getMarksPerQuestion())
                .negativeMarks(saved.getNegativeMarks())
                .durationMinutes(saved.getDurationMinutes())
                .build();
    }

    private TestDTO mapToTestDTO(Test test, boolean sanitizeAnswers) {
        List<TestQuestion> tqs = testQuestionRepository.findByTestIdOrderByOrderIndexAsc(test.getId());
        List<QuestionDTO> questionDTOs = tqs.stream().map(tq -> {
            Question q = tq.getQuestion();
            return QuestionDTO.builder()
                    .id(q.getId())
                    .examId(q.getExam() != null ? q.getExam().getId() : null)
                    .examName(q.getExam() != null ? q.getExam().getName() : "")
                    .subjectId(q.getSubject() != null ? q.getSubject().getId() : null)
                    .subjectName(q.getSubject() != null ? q.getSubject().getName() : "")
                    .topicId(q.getTopic() != null ? q.getTopic().getId() : null)
                    .topicName(q.getTopic() != null ? q.getTopic().getName() : "")
                    .subTopicId(q.getSubTopic() != null ? q.getSubTopic().getId() : null)
                    .subTopicName(q.getSubTopic() != null ? q.getSubTopic().getName() : "")
                    .questionText(q.getQuestionText())
                    .imageUrl(q.getImageUrl())
                    .optionA(q.getOptionA())
                    .optionB(q.getOptionB())
                    .optionC(q.getOptionC())
                    .optionD(q.getOptionD())
                    .correctOption(sanitizeAnswers ? null : q.getCorrectOption())
                    .difficulty(q.getDifficulty())
                    .questionType(q.getQuestionType())
                    .marks(tq.getMarks())
                    .negativeMarks(tq.getNegativeMarks())
                    .explanation(sanitizeAnswers ? null : q.getExplanation())
                    .sourceReference(q.getSourceReference())
                    .sourceType(q.getSourceType())
                    .build();
        }).collect(Collectors.toList());

        return TestDTO.builder()
                .id(test.getId())
                .examId(test.getExam().getId())
                .examName(test.getExam().getName())
                .testType(test.getTestType())
                .title(test.getTitle())
                .instructions(test.getInstructions())
                .durationMinutes(test.getDurationMinutes())
                .totalQuestions(test.getTotalQuestions())
                .totalMarks(test.getTotalMarks())
                .negativeMarking(test.getNegativeMarking())
                .active(test.getActive())
                .createdDate(test.getCreatedDate())
                .questions(questionDTOs)
                .build();
    }

    private TestAttemptDTO mapToAttemptDTO(TestAttempt attempt) {
        return TestAttemptDTO.builder()
                .id(attempt.getId())
                .testId(attempt.getTest().getId())
                .testTitle(attempt.getTest().getTitle())
                .examName(attempt.getTest().getExam().getName())
                .durationMinutes(attempt.getTest().getDurationMinutes())
                .totalQuestions(attempt.getTest().getTotalQuestions())
                .totalMarks(attempt.getTest().getTotalMarks())
                .startTime(attempt.getStartTime())
                .endTime(attempt.getEndTime())
                .totalTimeSpentSeconds(attempt.getTotalTimeSpentSeconds())
                .score(attempt.getScore())
                .totalCorrect(attempt.getTotalCorrect())
                .totalIncorrect(attempt.getTotalIncorrect())
                .totalUnattempted(attempt.getTotalUnattempted())
                .accuracyPercentage(attempt.getAccuracyPercentage())
                .status(attempt.getStatus())
                .build();
    }
}
