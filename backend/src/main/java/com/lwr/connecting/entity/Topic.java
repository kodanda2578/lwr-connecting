package com.lwr.connecting.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "topics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exam_id")
    private Exam exam;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "weightage_percentage")
    private Double weightagePercentage;

    @Column(name = "source_reference", length = 300)
    private String sourceReference;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;
}
