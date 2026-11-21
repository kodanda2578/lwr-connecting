package com.lwr.connecting.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "beta_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BetaFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User student;

    @Column(name = "student_name", nullable = false, length = 150)
    private String studentName;

    @Column(name = "student_email", nullable = false, length = 150)
    private String studentEmail;

    // Overall experience rating (1 to 5)
    @Column(name = "overall_rating", nullable = false)
    private Integer overallRating;

    // Feature-specific ratings (1 to 5)
    @Column(name = "mock_tests_rating")
    private Integer mockTestsRating;

    @Column(name = "predictor_rating")
    private Integer predictorRating;

    @Column(name = "cutoffs_rating")
    private Integer cutoffsRating;

    @Column(name = "ai_guidance_rating")
    private Integer aiGuidanceRating;

    @Column(name = "mentorship_rating")
    private Integer mentorshipRating;

    // Bug report & severity: LOW, MEDIUM, HIGH, CRITICAL
    @Column(name = "bug_severity", length = 30)
    private String bugSeverity;

    // Overall experience narrative
    @Column(name = "overall_experience", columnDefinition = "TEXT", nullable = false)
    private String overallExperience;

    // Difficulties faced while navigating or using the platform
    @Column(name = "difficulties_faced", columnDefinition = "TEXT")
    private String difficultiesFaced;

    // Incorrect or missing college information reported
    @Column(name = "college_info_issues", columnDefinition = "TEXT")
    private String collegeInfoIssues;

    // Missing information report
    @Column(name = "missing_info_report", columnDefinition = "TEXT")
    private String missingInfoReport;

    // Features students found useful
    @Column(name = "useful_features", columnDefinition = "TEXT")
    private String usefulFeatures;

    // Suggestions for improvement
    @Column(name = "suggestions", columnDefinition = "TEXT")
    private String suggestions;

    // Optional category tag: e.g. "GENERAL", "COLLEGE_DATA", "MOCK_TEST", "AI_ASSISTANT", "COUNSELLING", "BUG"
    @Builder.Default
    @Column(name = "category", length = 50)
    private String category = "GENERAL";

    // Status: NEW, IN_REVIEW, RESOLVED
    @Builder.Default
    @Column(name = "status", length = 30)
    private String status = "NEW";

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onPrePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (status == null) status = "NEW";
        if (category == null) category = "GENERAL";
    }

    @PreUpdate
    public void onPreUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
