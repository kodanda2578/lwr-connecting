package com.lwr.connecting.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "guidance_request_id", nullable = false, unique = true)
    private GuidanceRequest guidanceRequest;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Builder.Default
    @Column(name = "time_zone", nullable = false, length = 50)
    private String timeZone = "Asia/Kolkata";

    @Column(length = 200)
    private String topic;

    @Builder.Default
    @Column(name = "meeting_method", length = 50)
    private String meetingMethod = "Google Meet";

    @Column(name = "meeting_url", length = 500)
    private String meetingUrl;

    // Status: SCHEDULED, RESCHEDULED, CANCELLED, COMPLETED
    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "SCHEDULED";

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Email delivery status: SENT, FAILED, NOT_CONFIGURED
    @Builder.Default
    @Column(name = "email_delivery_status", length = 30)
    private String emailDeliveryStatus = "PENDING";

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
        if (this.timeZone == null || this.timeZone.isBlank()) this.timeZone = "Asia/Kolkata";
        if (this.status == null || this.status.isBlank()) this.status = "SCHEDULED";
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
