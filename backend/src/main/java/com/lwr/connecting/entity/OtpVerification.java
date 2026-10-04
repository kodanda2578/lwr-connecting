package com.lwr.connecting.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications")
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String purpose; // EMAIL_VERIFICATION, MOBILE_VERIFICATION

    @Column(nullable = false)
    private String otpHash;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private Integer attempts = 0;

    private Boolean verified = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime lastAttemptAt;

    public OtpVerification() {}

    public OtpVerification(Long id, Long userId, String purpose, String otpHash, LocalDateTime expiresAt, Integer attempts, Boolean verified, LocalDateTime createdAt, LocalDateTime lastAttemptAt) {
        this.id = id;
        this.userId = userId;
        this.purpose = purpose;
        this.otpHash = otpHash;
        this.expiresAt = expiresAt;
        this.attempts = attempts != null ? attempts : 0;
        this.verified = verified != null ? verified : false;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.lastAttemptAt = lastAttemptAt;
    }

    public static OtpVerificationBuilder builder() {
        return new OtpVerificationBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getOtpHash() { return otpHash; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public Integer getAttempts() { return attempts; }
    public void setAttempts(Integer attempts) { this.attempts = attempts; }

    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastAttemptAt() { return lastAttemptAt; }
    public void setLastAttemptAt(LocalDateTime lastAttemptAt) { this.lastAttemptAt = lastAttemptAt; }

    public static class OtpVerificationBuilder {
        private Long id;
        private Long userId;
        private String purpose;
        private String otpHash;
        private LocalDateTime expiresAt;
        private Integer attempts = 0;
        private Boolean verified = false;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime lastAttemptAt;

        public OtpVerificationBuilder id(Long id) { this.id = id; return this; }
        public OtpVerificationBuilder userId(Long userId) { this.userId = userId; return this; }
        public OtpVerificationBuilder purpose(String purpose) { this.purpose = purpose; return this; }
        public OtpVerificationBuilder otpHash(String otpHash) { this.otpHash = otpHash; return this; }
        public OtpVerificationBuilder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }
        public OtpVerificationBuilder attempts(Integer attempts) { this.attempts = attempts; return this; }
        public OtpVerificationBuilder verified(Boolean verified) { this.verified = verified; return this; }
        public OtpVerificationBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public OtpVerificationBuilder lastAttemptAt(LocalDateTime lastAttemptAt) { this.lastAttemptAt = lastAttemptAt; return this; }

        public OtpVerification build() {
            return new OtpVerification(id, userId, purpose, otpHash, expiresAt, attempts, verified, createdAt, lastAttemptAt);
        }
    }
}
