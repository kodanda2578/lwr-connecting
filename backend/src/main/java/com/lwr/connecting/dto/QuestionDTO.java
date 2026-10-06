package com.lwr.connecting.dto;

import com.lwr.connecting.enums.Difficulty;
import com.lwr.connecting.enums.QuestionSourceType;
import com.lwr.connecting.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {
    private Long id;
    private Long examId;
    private String examName;
    private Long subjectId;
    private String subjectName;
    private Long topicId;
    private String topicName;
    private Long subTopicId;
    private String subTopicName;
    private String questionText;
    private String imageUrl;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctOption; // Hidden during active CBT test
    private Difficulty difficulty;
    private QuestionType questionType;
    private Integer marks;
    private Integer negativeMarks;
    private String explanation; // Hidden during active CBT test
    private String sourceReference;
    private QuestionSourceType sourceType;
}
