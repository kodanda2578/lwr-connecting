package com.lwr.connecting.dto;

import com.lwr.connecting.enums.AttemptStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestAttemptDTO {
    private Long id;
    private Long testId;
    private String testTitle;
    private String examName;
    private Integer durationMinutes;
    private Integer totalQuestions;
    private Integer totalMarks;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer totalTimeSpentSeconds;
    private Integer score;
    private Integer totalCorrect;
    private Integer totalIncorrect;
    private Integer totalUnattempted;
    private Double accuracyPercentage;
    private AttemptStatus status;
}
