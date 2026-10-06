package com.lwr.connecting.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cutoffs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cutoff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false, length = 50)
    private String category; // e.g. OC, BC_A, SC, ST, GM, OPEN, EWS

    @Column(length = 50)
    private String gender; // e.g. ALL, FEMALE, MALE

    @Column(length = 100)
    private String quota; // e.g. STATE_QUOTA, ALL_INDIA_QUOTA, HOME_STATE, OTHER_STATE

    @Builder.Default
    @Column(nullable = false)
    private Integer round = 1;

    @Column(name = "opening_rank")
    private Integer openingRank;

    @Column(name = "closing_rank")
    private Integer closingRank;

    @Column(name = "score_or_percentile")
    private Double scoreOrPercentile;

    @Column(name = "source_reference", length = 500)
    private String sourceReference;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;
}
