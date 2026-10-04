package com.lwr.connecting.service;

public interface EmailService {
    boolean sendEmailOtp(String recipientEmail, String studentName, String otp, String idempotencyKey);
    boolean sendLoginEmailOtp(String recipientEmail, String studentName, String otp, String idempotencyKey);
    boolean sendTestEmail(String recipientEmail);
    void sendWelcomeEmail(String recipientEmail, String recipientName);
    void sendNewMockTestEmail(String recipientEmail, String studentName, String exam, String testName, String testLink, String idempotencyKey);
    void sendNewMaterialEmail(String recipientEmail, String studentName, String exam, String materialTitle, String materialLink, String idempotencyKey);
    void sendNewVideoEmail(String recipientEmail, String studentName, String category, String videoTitle, String videoLink, String idempotencyKey);
    void sendAnnouncementEmail(String recipientEmail, String studentName, String announcementTitle, String announcementMessage, String idempotencyKey);
    void sendMentorReplyEmail(String recipientEmail, String studentName, String replyPreview, String idempotencyKey);
    void sendDoubtSessionEmail(String recipientEmail, String studentName, String topic, String date, String time, String status, String idempotencyKey);
    void sendMentorNotificationEmail(String mentorEmail, String studentName, String category, String studentQuestion, String aiSummary, Long requestId, String idempotencyKey);
}
