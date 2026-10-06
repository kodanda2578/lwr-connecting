package com.lwr.connecting.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "colleges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class College {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "state_id")
    private State state;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String district;

    @Column(length = 300)
    private String website;

    @Column(name = "admission_authority", length = 200)
    private String admissionAuthority;

    @Column(name = "government_status", length = 100)
    private String governmentStatus; // Government, Private, Govt-Aided

    @Column(name = "college_type", length = 100)
    private String collegeType; // Autonomous College, State University, Deemed University

    @Builder.Default
    @Column(name = "is_autonomous")
    private Boolean isAutonomous = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "source_reference", length = 500)
    private String sourceReference;
}
