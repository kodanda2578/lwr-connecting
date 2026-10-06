package com.lwr.connecting.dto;

import com.lwr.connecting.enums.Difficulty;
import com.lwr.connecting.enums.TestType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTestRequestDTO {
    private Long examId;
    private TestType testType; // TOPIC_MOCK, SUBJECT_MOCK, FULL_SYLLABUS_MOCK, GRAND_TEST
    private String title;
    private String instructions;
    private Integer durationMinutes;
    private Integer totalQuestions;
    private Integer totalMarks;
    private Boolean negativeMarking;
    private Long subjectId;
    private Long topicId;
    private Difficulty difficulty;
    private List<Long> questionIds; // Specific questions if manually picked by admin
    private Boolean useAiGeneration; // Auto generate missing questions via AI provider
    private String aiProvider; // GEMINI or MOCK_AI
}
