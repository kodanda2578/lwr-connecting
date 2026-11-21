package com.lwr.connecting.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "beta_invitations", indexes = {
    @Index(name = "idx_beta_invitation_code", columnList = "code", unique = true),
    @Index(name = "idx_beta_invitation_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BetaInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(length = 150)
    private String assignedEmail;

    @Column(length = 150)
    private String studentName;

    @Column(length = 100)
    private String channel; // e.g. COLLEGE_NETWORK, LECTURER, WHATSAPP, INSTAGRAM_YOUTUBE

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, ACCEPTED, EXPIRED, REVOKED

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime issuedAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime acceptedAt;

    private Long acceptedByUserId;

    @Column(length = 150)
    private String acceptedByEmail;

    @Builder.Default
    @Column(length = 100)
    private String issuedBy = "ADMIN";

    @Column(columnDefinition = "TEXT")
    private String notes;
}

