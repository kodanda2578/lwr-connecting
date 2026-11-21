package com.lwr.connecting.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "guidance_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuidanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = true)
    private User student;

    @Column(name = "student_name", nullable = false, length = 150)
    private String studentName;

    @Column(name = "student_email", nullable = false, length = 150)
    private String studentEmail;

    @Column(length = 30)
    private String phone;

    @Column(name = "preferred_contact_method", length = 50)
    private String preferredContactMethod;

    @Column(name = "education_level", length = 100)
    private String educationLevel; // e.g. "Intermediate 2nd Year", "Intermediate 1st Year", "Class 12"

    @Column(name = "target_exam", length = 100)
    private String targetExam; // e.g. "AP_EAPCET", "TG_EAPCET", "JEE_MAIN"

    @Column(name = "subject_category", nullable = false, length = 100)
    private String subjectCategory; // e.g. "College Cutoffs", "Exam Strategy", "Doubt Solving", "Counselling"

    @Column(name = "doubt_description", columnDefinition = "TEXT", nullable = false)
    private String doubtDescription;

    @Column(name = "preferred_date")
    private LocalDate preferredDate;

    @Column(name = "preferred_time_slot", length = 100)
    private String preferredTimeSlot;

    // Status: PENDING, APPROVED, SCHEDULED, REJECTED, COMPLETED, CANCELLED
    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    @OneToOne(mappedBy = "guidanceRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Appointment appointment;

    @Builder.Default
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    public void onPrePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.updatedAt == null) this.updatedAt = LocalDateTime.now();
        if (this.status == null || this.status.isBlank()) this.status = "PENDING";
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
