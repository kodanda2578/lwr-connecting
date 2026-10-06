package com.lwr.connecting.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exam_test_patterns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamTestPattern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "question_count", nullable = false)
    private Integer questionCount;

    @Column(name = "marks_per_question", nullable = false)
    private Integer marksPerQuestion;

    @Column(name = "negative_marks", nullable = false)
    private Integer negativeMarks;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;
}
