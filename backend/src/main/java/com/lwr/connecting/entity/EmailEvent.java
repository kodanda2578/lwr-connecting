package com.lwr.connecting.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_events")
public class EmailEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipient;

    @Column(nullable = false)
    private String eventType;

    @Column(nullable = false)
    private String status;

    private String providerMessageId;

    @Column(columnDefinition = "TEXT")
    private String failureReason;

    @Column(unique = true)
    private String idempotencyKey;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime sentAt;

    public EmailEvent() {}

    public EmailEvent(Long id, String recipient, String eventType, String status, String providerMessageId, String failureReason, String idempotencyKey, LocalDateTime createdAt, LocalDateTime sentAt) {
        this.id = id;
        this.recipient = recipient;
        this.eventType = eventType;
        this.status = status;
        this.providerMessageId = providerMessageId;
        this.failureReason = failureReason;
        this.idempotencyKey = idempotencyKey;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.sentAt = sentAt;
    }

    public static EmailEventBuilder builder() {
        return new EmailEventBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getProviderMessageId() { return providerMessageId; }
    public void setProviderMessageId(String providerMessageId) { this.providerMessageId = providerMessageId; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public static class EmailEventBuilder {
        private Long id;
        private String recipient;
        private String eventType;
        private String status;
        private String providerMessageId;
        private String failureReason;
        private String idempotencyKey;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime sentAt;

        public EmailEventBuilder id(Long id) { this.id = id; return this; }
        public EmailEventBuilder recipient(String recipient) { this.recipient = recipient; return this; }
        public EmailEventBuilder eventType(String eventType) { this.eventType = eventType; return this; }
        public EmailEventBuilder status(String status) { this.status = status; return this; }
        public EmailEventBuilder providerMessageId(String providerMessageId) { this.providerMessageId = providerMessageId; return this; }
        public EmailEventBuilder failureReason(String failureReason) { this.failureReason = failureReason; return this; }
        public EmailEventBuilder idempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; return this; }
        public EmailEventBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public EmailEventBuilder sentAt(LocalDateTime sentAt) { this.sentAt = sentAt; return this; }

        public EmailEvent build() {
            return new EmailEvent(id, recipient, eventType, status, providerMessageId, failureReason, idempotencyKey, createdAt, sentAt);
        }
    }
}
