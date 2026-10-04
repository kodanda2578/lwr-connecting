package com.lwr.connecting.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mentor_requests")
public class MentorRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String studentMessage;

    @Column(columnDefinition = "TEXT")
    private String aiConversationSummary;

    private String priority = "MEDIUM";

    private String status = "OPEN";

    private Long assignedMentorId;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    private LocalDateTime resolvedAt;

    public MentorRequest() {}

    public MentorRequest(Long id, User student, String category, String studentMessage, String aiConversationSummary, String priority, String status, Long assignedMentorId, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime resolvedAt) {
        this.id = id;
        this.student = student;
        this.category = category;
        this.studentMessage = studentMessage;
        this.aiConversationSummary = aiConversationSummary;
        this.priority = priority != null ? priority : "MEDIUM";
        this.status = status != null ? status : "OPEN";
        this.assignedMentorId = assignedMentorId;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.updatedAt = updatedAt != null ? updatedAt : LocalDateTime.now();
        this.resolvedAt = resolvedAt;
    }

    public static MentorRequestBuilder builder() {
        return new MentorRequestBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStudentMessage() { return studentMessage; }
    public void setStudentMessage(String studentMessage) { this.studentMessage = studentMessage; }

    public String getAiConversationSummary() { return aiConversationSummary; }
    public void setAiConversationSummary(String aiConversationSummary) { this.aiConversationSummary = aiConversationSummary; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getAssignedMentorId() { return assignedMentorId; }
    public void setAssignedMentorId(Long assignedMentorId) { this.assignedMentorId = assignedMentorId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public static class MentorRequestBuilder {
        private Long id;
        private User student;
        private String category;
        private String studentMessage;
        private String aiConversationSummary;
        private String priority = "MEDIUM";
        private String status = "OPEN";
        private Long assignedMentorId;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt = LocalDateTime.now();
        private LocalDateTime resolvedAt;

        public MentorRequestBuilder id(Long id) { this.id = id; return this; }
        public MentorRequestBuilder student(User student) { this.student = student; return this; }
        public MentorRequestBuilder category(String category) { this.category = category; return this; }
        public MentorRequestBuilder studentMessage(String studentMessage) { this.studentMessage = studentMessage; return this; }
        public MentorRequestBuilder aiConversationSummary(String aiConversationSummary) { this.aiConversationSummary = aiConversationSummary; return this; }
        public MentorRequestBuilder priority(String priority) { this.priority = priority; return this; }
        public MentorRequestBuilder status(String status) { this.status = status; return this; }
        public MentorRequestBuilder assignedMentorId(Long assignedMentorId) { this.assignedMentorId = assignedMentorId; return this; }
        public MentorRequestBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public MentorRequestBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public MentorRequestBuilder resolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; return this; }

        public MentorRequest build() {
            return new MentorRequest(id, student, category, studentMessage, aiConversationSummary, priority, status, assignedMentorId, createdAt, updatedAt, resolvedAt);
        }
    }
}
