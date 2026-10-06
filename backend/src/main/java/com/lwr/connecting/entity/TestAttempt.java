package com.lwr.connecting.entity;

import com.lwr.connecting.enums.AttemptStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder.Default
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime = LocalDateTime.now();

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "total_time_spent_seconds")
    private Integer totalTimeSpentSeconds;

    @Column(name = "score")
    private Integer score;

    @Column(name = "total_correct")
    private Integer totalCorrect;

    @Column(name = "total_incorrect")
    private Integer totalIncorrect;

    @Column(name = "total_unattempted")
    private Integer totalUnattempted;

    @Column(name = "accuracy_percentage")
    private Double accuracyPercentage;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 30)
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;
}
