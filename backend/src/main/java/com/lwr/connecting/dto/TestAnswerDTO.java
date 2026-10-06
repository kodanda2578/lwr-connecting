package com.lwr.connecting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestAnswerDTO {
    private Long questionId;
    private String selectedOption;
    private Integer timeSpentSeconds;
    private Boolean markedForReview;
    private Boolean isCorrect;
}
