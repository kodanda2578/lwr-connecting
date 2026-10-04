package com.lwr.connecting.service.impl;

import com.lwr.connecting.entity.EmailEvent;
import com.lwr.connecting.repository.EmailEventRepository;
import com.lwr.connecting.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Value("${email.provider:LOG}")
    private String emailProvider;

    @Value("${email.from:no-reply@lwrconnecting.com}")
    private String emailFrom;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${mentor.notification.email:ramesh.mentor@lwrconnecting.com}")
    private String mentorEmailConfig;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private EmailEventRepository emailEventRepository;

    @jakarta.annotation.PostConstruct
    public void logSmtpStatus() {
        boolean isSmtp = "SMTP".equalsIgnoreCase(emailProvider);
        boolean hasSender = mailSender != null;
        String host = "unknown";
        int port = -1;
        boolean usernameConfigured = false;
        boolean passwordConfigured = false;

        if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            org.springframework.mail.javamail.JavaMailSenderImpl impl = (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender;
            host = impl.getHost();
            port = impl.getPort();
            usernameConfigured = (impl.getUsername() != null && !impl.getUsername().isBlank()) || (mailUsername != null && !mailUsername.isBlank());
            passwordConfigured = (impl.getPassword() != null && !impl.getPassword().isBlank()) || (mailPassword != null && !mailPassword.isBlank());
        } else {
            usernameConfigured = mailUsername != null && !mailUsername.isBlank();
            passwordConfigured = mailPassword != null && !mailPassword.isBlank();
        }

        logger.info("=========================================================");
        logger.info("[SMTP CONFIG CHECK AT STARTUP]");
        logger.info("  EMAIL_PROVIDER setting: {}", emailProvider);
        logger.info("  JavaMailSender Bean present: {}", hasSender);
        logger.info("  SMTP Host: {}", host);
        logger.info("  SMTP Port: {}", port);
        logger.info("  SMTP Username configured: {}", usernameConfigured);
        logger.info("  SMTP Password configured: {}", passwordConfigured);
        logger.info("  SMTP Active Mode: {}", isSmtpEnabled());
        logger.info("=========================================================");
    }

    private boolean isAlreadySent(String idempotencyKey) {
        if (idempotencyKey == null) return false;
        return emailEventRepository.existsByIdempotencyKeyAndStatus(idempotencyKey, "SENT");
    }

    private void logEmailEvent(String recipient, String eventType, String status, String providerMsgId, String failure, String idempotencyKey) {
        try {
            EmailEvent event = EmailEvent.builder()
                    .recipient(recipient)
                    .eventType(eventType)
                    .status(status)
                    .providerMessageId(providerMsgId)
                    .failureReason(failure)
                    .idempotencyKey(idempotencyKey != null ? idempotencyKey : UUID.randomUUID().toString())
                    .createdAt(LocalDateTime.now())
                    .sentAt("SENT".equals(status) ? LocalDateTime.now() : null)
                    .build();
            emailEventRepository.save(event);
        } catch (Exception e) {
            logger.warn("Could not log email event to DB", e);
        }
    }

    private boolean isSmtpEnabled() {
        if (!"SMTP".equalsIgnoreCase(emailProvider) || mailSender == null) {
            return false;
        }
        if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            org.springframework.mail.javamail.JavaMailSenderImpl impl = (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender;
            String host = impl.getHost();
            String pass = impl.getPassword();
            String user = impl.getUsername();
            
            boolean hasHost = host != null && !host.isBlank();
            boolean hasPass = (pass != null && !pass.isBlank()) || (mailPassword != null && !mailPassword.isBlank());
            boolean hasUser = (user != null && !user.isBlank()) || (mailUsername != null && !mailUsername.isBlank());
            
            return hasHost && hasPass && hasUser;
        }
        return mailPassword != null && !mailPassword.isBlank();
    }

    private String getFromAddress() {
        if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            org.springframework.mail.javamail.JavaMailSenderImpl impl = (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender;
            if (impl.getUsername() != null && !impl.getUsername().isBlank()) {
                return impl.getUsername().trim();
            }
        }
        if (mailUsername != null && !mailUsername.isBlank()) {
            return mailUsername.trim();
        }
        if (emailFrom != null && !emailFrom.isBlank() && !emailFrom.contains("no-reply@lwrconnecting.com")) {
            return emailFrom.trim();
        }
        return "no-reply@lwrconnecting.com";
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 2) {
            return name.charAt(0) + "***@" + domain;
        }
        return name.charAt(0) + "***" + name.charAt(name.length() - 1) + "@" + domain;
    }

    private boolean sendOtpEmail(String recipientEmail, String studentName, String otp, String purpose, String idempotencyKey, String subject, String bodyTemplate) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            logger.error("[EMAIL ERROR] Cannot send OTP: recipient email is null or empty");
            return false;
        }

        String cleanRecipient = recipientEmail.trim();
        String maskedRecipient = maskEmail(cleanRecipient);

        String host = "unknown";
        int port = -1;
        boolean usernameConfigured = false;
        boolean passwordConfigured = false;

        if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            org.springframework.mail.javamail.JavaMailSenderImpl impl = (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender;
            host = impl.getHost();
            port = impl.getPort();
            usernameConfigured = (impl.getUsername() != null && !impl.getUsername().isBlank()) || (mailUsername != null && !mailUsername.isBlank());
            passwordConfigured = (impl.getPassword() != null && !impl.getPassword().isBlank()) || (mailPassword != null && !mailPassword.isBlank());
        }
        String fromAddress = getFromAddress();

        logger.info("[LOGIN OTP SMTP DEBUG] purpose={}, recipient={}, smtpHost={}, smtpPort={}, smtpUsernameConfigured={}, smtpPasswordConfigured={}, fromAddress={}",
                purpose, maskedRecipient, host, port, usernameConfigured, passwordConfigured, maskEmail(fromAddress));

        try {
            if (isSmtpEnabled()) {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setFrom(fromAddress);
                mailMessage.setTo(cleanRecipient);
                mailMessage.setSubject(subject);
                
                String body = String.format(bodyTemplate, studentName != null && !studentName.isBlank() ? studentName : "Student", otp);
                mailMessage.setText(body);

                mailSender.send(mailMessage);
                logger.info("[LOGIN OTP SMTP RESULT] sendResult=SUCCESS (dispatched via Gmail SMTP to {}, From={})", maskedRecipient, fromAddress);
                logEmailEvent(cleanRecipient, purpose, "SENT", "smtp_" + UUID.randomUUID().toString(), null, idempotencyKey);
                return true;
            } else if ("LOG".equalsIgnoreCase(emailProvider)) {
                // Development / Log Mode explicit configuration only
                logger.info("=========================================================");
                logger.info("[DEV LOG {} OTP] Verification code generated for user ({}) {}: [{}] | sendResult=SUCCESS_LOG_MODE", purpose, studentName, maskedRecipient, otp);
                logger.info("=========================================================");
                logEmailEvent(cleanRecipient, purpose, "SENT", "dev_" + UUID.randomUUID().toString(), null, idempotencyKey);
                return true;
            } else {
                logger.error("[LOGIN OTP SMTP RESULT] sendResult=FAILURE (EMAIL_PROVIDER='{}' but SMTP credentials incomplete: usernameConfigured={}, passwordConfigured={})",
                        emailProvider, usernameConfigured, passwordConfigured);
                logEmailEvent(cleanRecipient, purpose, "FAILED", null, "Incomplete SMTP Configuration", idempotencyKey);
                return false;
            }
        } catch (Exception e) {
            logger.error("[LOGIN OTP SMTP RESULT] sendResult=FAILURE exceptionClass={} safeMessage={}",
                    e.getClass().getName(), e.getMessage());
            logEmailEvent(cleanRecipient, purpose, "FAILED", null, e.getClass().getSimpleName() + ": " + e.getMessage(), idempotencyKey);
            return false;
        }
    }

    @Override
    public boolean sendEmailOtp(String recipientEmail, String studentName, String otp, String idempotencyKey) {
        String subject = "Verify your LWR Connecting Account";
        String bodyTemplate = "Hello %s,\n\n" +
                "Your LWR Connecting email verification code is:\n\n" +
                "%s\n\n" +
                "This code expires in 10 minutes.\n\n" +
                "If you did not create this account, please ignore this email.\n\n" +
                "Regards,\n" +
                "Laughs With Ramesh Connecting";
        return sendOtpEmail(recipientEmail, studentName, otp, "EMAIL_VERIFICATION", idempotencyKey, subject, bodyTemplate);
    }

    @Override
    public boolean sendLoginEmailOtp(String recipientEmail, String studentName, String otp, String idempotencyKey) {
        String subject = "LWR Connecting Login Verification Code";
        String bodyTemplate = "Hello %s,\n\n" +
                "Your LWR Connecting login verification code is:\n\n" +
                "%s\n\n" +
                "This code expires in 5 minutes.\n\n" +
                "If you did not request this login code, please secure your account immediately.\n\n" +
                "Regards,\n" +
                "Laughs With Ramesh Connecting";
        return sendOtpEmail(recipientEmail, studentName, otp, "LOGIN_VERIFICATION", idempotencyKey, subject, bodyTemplate);
    }

    @Override
    public boolean sendTestEmail(String recipientEmail) {
        if (recipientEmail == null || recipientEmail.isBlank()) return false;
        String cleanRecipient = recipientEmail.trim();
        String masked = maskEmail(cleanRecipient);
        try {
            if (isSmtpEnabled()) {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                String fromAddress = getFromAddress();
                mailMessage.setFrom(fromAddress);
                mailMessage.setTo(cleanRecipient);
                mailMessage.setSubject("LWR Connecting SMTP Test Email");
                mailMessage.setText("Hello,\n\nThis is a test email verifying Gmail SMTP connectivity for LWR Connecting.\n\nRegards,\nLaughs With Ramesh Connecting System");

                mailSender.send(mailMessage);
                logger.info("[SMTP TEST SUCCESS] Test email dispatched via Gmail SMTP to {} (From: {})", masked, fromAddress);
                return true;
            } else {
                logger.warn("[SMTP TEST WARN] SMTP is not enabled. EMAIL_PROVIDER={}, mailSenderPresent={}", emailProvider, mailSender != null);
                return false;
            }
        } catch (Exception e) {
            logger.error("[SMTP TEST FAILURE] Unable to send test email to {}: ExceptionClass={} Error={}", masked, e.getClass().getName(), e.getMessage());
            return false;
        }
    }

    @Override
    @Async
    public void sendWelcomeEmail(String recipientEmail, String recipientName) {
        String key = "WELCOME_" + recipientEmail;
        if (isAlreadySent(key)) return;

        logger.info("[EMAIL] Welcome Email dispatched to {} ({}) via provider {}", recipientName, recipientEmail, emailProvider);
        logEmailEvent(recipientEmail, "WELCOME", "SENT", "msg_" + UUID.randomUUID().toString(), null, key);
    }

    @Override
    @Async
    public void sendNewMockTestEmail(String recipientEmail, String studentName, String exam, String testName, String testLink, String idempotencyKey) {
        if (isAlreadySent(idempotencyKey)) return;
        logger.info("[EMAIL] New Mock Test Notification ({}) sent to {}", testName, recipientEmail);
        logEmailEvent(recipientEmail, "MOCK_TEST", "SENT", "msg_" + UUID.randomUUID().toString(), null, idempotencyKey);
    }

    @Override
    @Async
    public void sendNewMaterialEmail(String recipientEmail, String studentName, String exam, String materialTitle, String materialLink, String idempotencyKey) {
        if (isAlreadySent(idempotencyKey)) return;
        logger.info("[EMAIL] New Study Material ({}) sent to {}", materialTitle, recipientEmail);
        logEmailEvent(recipientEmail, "MATERIAL", "SENT", "msg_" + UUID.randomUUID().toString(), null, idempotencyKey);
    }

    @Override
    @Async
    public void sendNewVideoEmail(String recipientEmail, String studentName, String category, String videoTitle, String videoLink, String idempotencyKey) {
        if (isAlreadySent(idempotencyKey)) return;
        logger.info("[EMAIL] New Video ({}) sent to {}", videoTitle, recipientEmail);
        logEmailEvent(recipientEmail, "VIDEO", "SENT", "msg_" + UUID.randomUUID().toString(), null, idempotencyKey);
    }

    @Override
    @Async
    public void sendAnnouncementEmail(String recipientEmail, String studentName, String announcementTitle, String announcementMessage, String idempotencyKey) {
        if (isAlreadySent(idempotencyKey)) return;
        logger.info("[EMAIL] Announcement ({}) sent to {}", announcementTitle, recipientEmail);
        logEmailEvent(recipientEmail, "ANNOUNCEMENT", "SENT", "msg_" + UUID.randomUUID().toString(), null, idempotencyKey);
    }

    @Override
    @Async
    public void sendMentorReplyEmail(String recipientEmail, String studentName, String replyPreview, String idempotencyKey) {
        if (isAlreadySent(idempotencyKey)) return;
        logger.info("[EMAIL] Ramesh Reply Email sent to {} ({})", studentName, recipientEmail);
        logEmailEvent(recipientEmail, "MENTOR_REPLY", "SENT", "msg_" + UUID.randomUUID().toString(), null, idempotencyKey);
    }

    @Override
    @Async
    public void sendDoubtSessionEmail(String recipientEmail, String studentName, String topic, String date, String time, String status, String idempotencyKey) {
        if (isAlreadySent(idempotencyKey)) return;
        logger.info("[EMAIL] Doubt Session Update ({}) sent to {}", topic, recipientEmail);
        logEmailEvent(recipientEmail, "DOUBT_SESSION", "SENT", "msg_" + UUID.randomUUID().toString(), null, idempotencyKey);
    }

    @Override
    @Async
    public void sendMentorNotificationEmail(String mentorEmail, String studentName, String category, String studentQuestion, String aiSummary, Long requestId, String idempotencyKey) {
        String targetEmail = (mentorEmail != null && !mentorEmail.isBlank()) ? mentorEmail : mentorEmailConfig;
        if (isAlreadySent(idempotencyKey)) return;
        logger.info("[EMAIL] New Mentor Request Notification (#{}) sent to Ramesh ({})", requestId, targetEmail);
        logEmailEvent(targetEmail, "MENTOR_NOTIFICATION", "SENT", "msg_" + UUID.randomUUID().toString(), null, idempotencyKey);
    }
}
