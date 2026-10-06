package com.lwr.connecting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestResultDTO {
    private TestAttemptDTO attempt;
    private TestDTO test;
    private Map<String, SubjectPerformance> subjectPerformance;
    private Map<String, TopicPerformance> topicPerformance;
    private Map<String, DifficultyPerformance> difficultyPerformance;
    private List<DetailedSolutionDTO> solutions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectPerformance {
        private String subjectName;
        private int totalQuestions;
        private int correct;
        private int incorrect;
        private int unattempted;
        private int score;
        private double accuracy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicPerformance {
        private String topicName;
        private int totalQuestions;
        private int correct;
        private int incorrect;
        private int unattempted;
        private double accuracy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DifficultyPerformance {
        private String difficulty;
        private int totalQuestions;
        private int correct;
        private int incorrect;
        private int unattempted;
        private double accuracy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetailedSolutionDTO {
        private Long questionId;
        private String questionText;
        private String imageUrl;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String selectedOption;
        private String correctOption;
        private Boolean isCorrect;
        private Integer marks;
        private Integer negativeMarks;
        private String explanation;
        private String subjectName;
        private String topicName;
        private String subTopicName;
        private String difficulty;
        private String sourceType;
        private String sourceReference;
    }
}
