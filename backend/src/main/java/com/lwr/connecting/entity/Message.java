package com.lwr.connecting.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String messageText;

    private String attachmentUrl;

    private Boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Message() {}

    public Message(Long id, User sender, User receiver, String messageText, String attachmentUrl, Boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.sender = sender;
        this.receiver = receiver;
        this.messageText = messageText;
        this.attachmentUrl = attachmentUrl;
        this.isRead = isRead != null ? isRead : false;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public static MessageBuilder builder() {
        return new MessageBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static class MessageBuilder {
        private Long id;
        private User sender;
        private User receiver;
        private String messageText;
        private String attachmentUrl;
        private Boolean isRead = false;
        private LocalDateTime createdAt = LocalDateTime.now();

        public MessageBuilder id(Long id) { this.id = id; return this; }
        public MessageBuilder sender(User sender) { this.sender = sender; return this; }
        public MessageBuilder receiver(User receiver) { this.receiver = receiver; return this; }
        public MessageBuilder messageText(String messageText) { this.messageText = messageText; return this; }
        public MessageBuilder attachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; return this; }
        public MessageBuilder isRead(Boolean isRead) { this.isRead = isRead; return this; }
        public MessageBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Message build() {
            return new Message(id, sender, receiver, messageText, attachmentUrl, isRead, createdAt);
        }
    }
}
