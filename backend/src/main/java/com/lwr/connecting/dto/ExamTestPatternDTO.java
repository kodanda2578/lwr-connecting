package com.lwr.connecting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamTestPatternDTO {
    private Long id;
    private Long examId;
    private String examName;
    private Long subjectId;
    private String subjectName;
    private Integer questionCount;
    private Integer marksPerQuestion;
    private Integer negativeMarks;
    private Integer durationMinutes;
}
