package com.lwr.connecting.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "question_validations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionValidation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "is_valid", nullable = false)
    private Boolean isValid;

    @Column(name = "validation_errors", columnDefinition = "TEXT")
    private String validationErrors;

    @Builder.Default
    @Column(name = "validated_at", nullable = false)
    private LocalDateTime validatedAt = LocalDateTime.now();
}
