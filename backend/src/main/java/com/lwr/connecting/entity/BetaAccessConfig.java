package com.lwr.connecting.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "beta_access_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BetaAccessConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    @Column(name = "registration_limit", nullable = false)
    private Integer registrationLimit = 100;

    @Builder.Default
    @Column(name = "registrations_paused", nullable = false)
    private Boolean registrationsPaused = false;

    @Builder.Default
    @Column(name = "beta_notice_message", columnDefinition = "TEXT")
    private String betaNoticeMessage = "Welcome to the LWR Connecting Beta for Intermediate Class 11 and Class 12 students. Registration is strictly limited to 100 students.";

    @Builder.Default
    @Column(name = "target_audience_notice", length = 200)
    private String targetAudienceNotice = "Class 11 & Class 12 Intermediate (MPC) Engineering Aspirants";

    @Builder.Default
    @Column(name = "guardian_consent_required", nullable = false)
    private Boolean guardianConsentRequired = true;

    @Builder.Default
    @Column(name = "invite_only_mode", nullable = false)
    private Boolean inviteOnlyMode = true;

    @Builder.Default
    @Column(name = "college_search_count")
    private Long collegeSearchCount = 0L;

    @Builder.Default
    @Column(name = "predictor_usage_count")
    private Long predictorUsageCount = 0L;

    @Builder.Default
    @Column(name = "failed_registration_count")
    private Long failedRegistrationCount = 0L;

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_by", length = 100)
    private String updatedBy = "SYSTEM";
}

