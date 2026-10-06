package com.lwr.connecting.entity;

import com.lwr.connecting.enums.Difficulty;
import com.lwr.connecting.enums.QuestionSourceType;
import com.lwr.connecting.enums.QuestionType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @Column(name = "exam_year")
    private Integer examYear;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subtopic_id")
    private SubTopic subTopic;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "option_a", length = 1000)
    private String optionA;

    @Column(name = "option_b", length = 1000)
    private String optionB;

    @Column(name = "option_c", length = 1000)
    private String optionC;

    @Column(name = "option_d", length = 1000)
    private String optionD;

    @Column(name = "correct_option", nullable = false, length = 100)
    private String correctOption;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 30)
    private QuestionType questionType;

    @Builder.Default
    @Column(nullable = false)
    private Integer marks = 4;

    @Builder.Default
    @Column(name = "negative_marks", nullable = false)
    private Integer negativeMarks = 1;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "source_reference", length = 300)
    private String sourceReference;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "source_type", nullable = false, length = 30)
    private QuestionSourceType sourceType = QuestionSourceType.PYQ;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;
}
