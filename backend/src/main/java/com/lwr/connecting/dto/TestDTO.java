package com.lwr.connecting.dto;

import com.lwr.connecting.enums.TestType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestDTO {
    private Long id;
    private Long examId;
    private String examName;
    private TestType testType;
    private String title;
    private String instructions;
    private Integer durationMinutes;
    private Integer totalQuestions;
    private Integer totalMarks;
    private Boolean negativeMarking;
    private Boolean active;
    private LocalDateTime createdDate;
    private List<QuestionDTO> questions;
}
