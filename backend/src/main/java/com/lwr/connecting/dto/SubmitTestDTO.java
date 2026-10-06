package com.lwr.connecting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitTestDTO {
    private Long attemptId;
    private Integer totalTimeSpentSeconds;
    private List<TestAnswerDTO> answers;
}
