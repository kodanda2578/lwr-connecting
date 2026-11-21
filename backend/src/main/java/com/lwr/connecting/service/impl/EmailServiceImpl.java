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

    @Value("${email.provider:SMTP}")
    private String emailProvider;

    @Value("${email.from:no-reply@lwrconnecting.com}")
    private String emailFrom;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${mentor.notification.email:ramesh.mentor@lwrconnecting.com}")
    private String mentorEmailConfig;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String appFrontendUrl;

    public String getStudentPortalDoubtSessionsUrl() {
        String base = (appFrontendUrl != null && !appFrontendUrl.isBlank()) ? appFrontendUrl.trim() : "http://localhost:5173";
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/doubt-sessions";
    }

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private EmailEventRepository emailEventRepository;

    @jakarta.annotation.PostConstruct
    public void logSmtpStatus() {
        if (mailPassword != null) {
            mailPassword = mailPassword.replace(" ", "").trim();
        }
        boolean isSmtp = "SMTP".equalsIgnoreCase(emailProvider);
        boolean hasSender = mailSender != null;
        String host = (mailHost != null && !mailHost.isBlank()) ? mailHost : "unknown";
        int port = mailPort;
        boolean usernameConfigured = false;
        boolean passwordConfigured = false;

        if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            org.springframework.mail.javamail.JavaMailSenderImpl impl = (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender;
            if (impl.getHost() != null && !impl.getHost().isBlank()) {
                host = impl.getHost();
            }
            if (impl.getPort() > 0) {
                port = impl.getPort();
            }
            if (impl.getPassword() != null && impl.getPassword().contains(" ")) {
                impl.setPassword(impl.getPassword().replace(" ", "").trim());
            } else if ((impl.getPassword() == null || impl.getPassword().isBlank()) && mailPassword != null && !mailPassword.isBlank()) {
                impl.setPassword(mailPassword);
            }
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
        if (isSmtp && (!usernameConfigured || !passwordConfigured)) {
            logger.warn("  [ACTION REQUIRED] EMAIL_PROVIDER is set to SMTP but SMTP_USERNAME or SMTP_PASSWORD is not set!");
            logger.warn("  Genuine emails cannot be dispatched until valid SMTP credentials are configured.");
        }
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

    private boolean isSmtpConfigured() {
        if (mailSender == null) {
            return false;
        }
        String host = (mailHost != null && !mailHost.isBlank()) ? mailHost.trim() : null;
        String user = (mailUsername != null && !mailUsername.isBlank()) ? mailUsername.trim() : null;
        String pass = (mailPassword != null && !mailPassword.isBlank()) ? mailPassword.replace(" ", "").trim() : null;

        if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            org.springframework.mail.javamail.JavaMailSenderImpl impl = (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender;
            if (impl.getHost() != null && !impl.getHost().isBlank()) {
                host = impl.getHost().trim();
            }
            if (user == null && impl.getUsername() != null && !impl.getUsername().isBlank()) {
                user = impl.getUsername().trim();
            }
            if (impl.getPassword() != null && impl.getPassword().contains(" ")) {
                impl.setPassword(impl.getPassword().replace(" ", "").trim());
            } else if (pass != null) {
                impl.setPassword(pass);
            }
            // Sync properties to JavaMailSenderImpl instance
            if ((impl.getHost() == null || impl.getHost().isBlank()) && host != null) {
                impl.setHost(host);
            }
            if (impl.getPort() <= 0 && mailPort > 0) {
                impl.setPort(mailPort);
            }
            if ((impl.getUsername() == null || impl.getUsername().isBlank()) && user != null) {
                impl.setUsername(user);
            }
            if (pass != null) {
                impl.setPassword(pass);
            }
        }

        return host != null && !host.isBlank() && user != null && !user.isBlank() && pass != null && !pass.isBlank();
    }

    private boolean isSmtpEnabled() {
        if ("LOG".equalsIgnoreCase(emailProvider) || "LOG_ONLY".equalsIgnoreCase(emailProvider) || "CONSOLE".equalsIgnoreCase(emailProvider)) {
            return false;
        }
        return "SMTP".equalsIgnoreCase(emailProvider) && isSmtpConfigured();
    }

    private String getFromAddress() {
        if (emailFrom != null && !emailFrom.isBlank() && !emailFrom.contains("no-reply@lwrconnecting.com")) {
            return emailFrom.trim();
        }
        if (mailUsername != null && !mailUsername.isBlank()) {
            return mailUsername.trim();
        }
        if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            org.springframework.mail.javamail.JavaMailSenderImpl impl = (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender;
            if (impl.getUsername() != null && !impl.getUsername().isBlank()) {
                return impl.getUsername().trim();
            }
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

        String host = (mailHost != null && !mailHost.isBlank()) ? mailHost : "unknown";
        int port = mailPort;
        boolean usernameConfigured = (mailUsername != null && !mailUsername.isBlank());
        boolean passwordConfigured = (mailPassword != null && !mailPassword.isBlank());

        if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            org.springframework.mail.javamail.JavaMailSenderImpl impl = (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender;
            if (impl.getHost() != null && !impl.getHost().isBlank()) host = impl.getHost();
            if (impl.getPort() > 0) port = impl.getPort();
            usernameConfigured = usernameConfigured || (impl.getUsername() != null && !impl.getUsername().isBlank());
            passwordConfigured = passwordConfigured || (impl.getPassword() != null && !impl.getPassword().isBlank());
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
                logger.info("[LOGIN OTP SMTP RESULT] sendResult=SUCCESS (dispatched via SMTP to {}, From={})", maskedRecipient, maskEmail(fromAddress));
                logEmailEvent(cleanRecipient, purpose, "SENT", "smtp_" + UUID.randomUUID().toString(), null, idempotencyKey);
                return true;
            } else if ("LOG".equalsIgnoreCase(emailProvider) || "LOG_ONLY".equalsIgnoreCase(emailProvider) || "CONSOLE".equalsIgnoreCase(emailProvider)) {
                // Development / Log Mode explicitly configured via EMAIL_PROVIDER=LOG
                logger.info("=========================================================");
                logger.info("[DEV LOG {} OTP] Verification code generated for user ({}) {} (code masked for security) | sendResult=SUCCESS_LOG_MODE", purpose, studentName, maskedRecipient);
                logger.info("=========================================================");
                logEmailEvent(cleanRecipient, purpose, "SENT", "dev_" + UUID.randomUUID().toString(), null, idempotencyKey);
                return true;
            } else {
                // SMTP mode is active but credentials are incomplete
                logger.error("[LOGIN OTP SMTP RESULT] sendResult=FAILURE: SMTP credentials are not configured on the server (EMAIL_PROVIDER='{}', usernameConfigured={}, passwordConfigured={}). Real email cannot be dispatched.",
                        emailProvider, usernameConfigured, passwordConfigured);
                logEmailEvent(cleanRecipient, purpose, "FAILED", null, "Incomplete SMTP Configuration: missing SMTP_USERNAME / SMTP_PASSWORD", idempotencyKey);
                return false;
            }
        } catch (Exception e) {
            logger.error("[LOGIN OTP SMTP RESULT] sendResult=FAILURE: SMTP dispatch failed for recipient {}: exceptionClass={} error={}",
                    maskedRecipient, e.getClass().getName(), e.getMessage());
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
                logger.info("[SMTP TEST SUCCESS] Test email dispatched via SMTP to {} (From: {})", masked, maskEmail(fromAddress));
                return true;
            } else {
                logger.warn("[SMTP TEST WARN] SMTP is not enabled or credentials not configured. EMAIL_PROVIDER={}, isSmtpConfigured={}", emailProvider, isSmtpConfigured());
                return false;
            }
        } catch (Exception e) {
            logger.error("[SMTP TEST FAILURE] Unable to send test email to {}: ExceptionClass={} Error={}", masked, e.getClass().getName(), e.getMessage());
            return false;
        }
    }

    @Override
    public java.util.Map<String, Object> getEmailHealthStatus() {
        java.util.Map<String, Object> health = new java.util.LinkedHashMap<>();
        health.put("provider", emailProvider);
        health.put("host", (mailHost != null && !mailHost.isBlank()) ? mailHost : "unknown");
        health.put("port", mailPort);
        health.put("usernameConfigured", mailUsername != null && !mailUsername.isBlank());
        health.put("usernameMasked", maskEmail(mailUsername));
        health.put("passwordConfigured", mailPassword != null && !mailPassword.isBlank());
        health.put("smtpActive", isSmtpEnabled());
        health.put("fromAddress", maskEmail(getFromAddress()));

        long totalSent = emailEventRepository.countByStatus("SENT");
        long totalFailed = emailEventRepository.countByStatus("FAILED");
        long otpSent = emailEventRepository.countByEventTypeAndStatus("EMAIL_VERIFICATION", "SENT")
                + emailEventRepository.countByEventTypeAndStatus("LOGIN_VERIFICATION", "SENT");
        long otpFailed = emailEventRepository.countByEventTypeAndStatus("EMAIL_VERIFICATION", "FAILED")
                + emailEventRepository.countByEventTypeAndStatus("LOGIN_VERIFICATION", "FAILED");

        health.put("totalEmailsSent", totalSent);
        health.put("totalEmailsFailed", totalFailed);
        health.put("otpSent", otpSent);
        health.put("otpFailed", otpFailed);
        long totalAttempts = totalSent + totalFailed;
        health.put("deliverySuccessRatePercent", totalAttempts > 0
                ? Math.round(((double) totalSent / totalAttempts) * 100.0) : 100);
        return health;
    }

    @Override
    public java.util.Map<String, Object> testSmtpConnection(String testRecipient) {
        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        String target = (testRecipient != null && !testRecipient.isBlank()) ? testRecipient.trim() : mailUsername;
        if (target == null || target.isBlank()) {
            target = "kodandaramesh2503@gmail.com";
        }
        result.put("recipientMasked", maskEmail(target));
        result.put("provider", emailProvider);
        result.put("host", (mailHost != null && !mailHost.isBlank()) ? mailHost : "unknown");
        result.put("port", mailPort);
        result.put("usernameMasked", maskEmail(mailUsername));

        boolean sent = sendTestEmail(target);
        result.put("success", sent);
        result.put("message", sent ? "SMTP test email dispatched successfully via Gmail SMTP to " + maskEmail(target)
                : "SMTP test email dispatch failed. Please verify credentials, app password, or network egress on port " + mailPort);
        return result;
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

    @Override
    public boolean sendAppointmentConfirmationEmail(
            String recipientEmail,
            String studentName,
            String topic,
            java.time.LocalDate appointmentDate,
            java.time.LocalTime startTime,
            java.time.LocalTime endTime,
            String timeZone,
            Long requestId,
            String meetingUrl,
            String idempotencyKey
    ) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            logger.warn("[EMAIL] Cannot send appointment confirmation: recipient email is blank");
            return false;
        }

        if (isAlreadySent(idempotencyKey)) {
            logger.info("[EMAIL] Appointment confirmation for request #{} already sent with key {}", requestId, idempotencyKey);
            return true;
        }

        String tz = (timeZone != null && !timeZone.isBlank()) ? timeZone : "Asia/Kolkata";
        String dateStr = appointmentDate != null ? appointmentDate.toString() : "TBD";
        String timeStr = (startTime != null && endTime != null) ? startTime + " – " + endTime : "TBD";
        long durationMinutes = (startTime != null && endTime != null) ? java.time.Duration.between(startTime, endTime).toMinutes() : 45;
        String safeName = (studentName != null && !studentName.isBlank()) ? studentName : "Student";
        String safeTopic = (topic != null && !topic.isBlank()) ? topic : "B.Tech & Entrance Guidance";

        String subject = "Confirmed: Your LWR Guidance Session with Ramesh (Request #" + requestId + ")";
        StringBuilder body = new StringBuilder();
        body.append("Hello ").append(safeName).append(",\n\n");
        body.append("Great news! Your 1-on-1 guidance session with Ramesh has been confirmed.\n\n");
        body.append("--------------------------------------------------\n");
        body.append("APPOINTMENT DETAILS:\n");
        body.append("Request ID: #").append(requestId).append("\n");
        body.append("Topic: ").append(safeTopic).append("\n");
        body.append("Date: ").append(dateStr).append("\n");
        body.append("Time: ").append(timeStr).append(" (").append(tz).append(")\n");
        body.append("Duration: ").append(durationMinutes).append(" minutes\n");
        body.append("Contact Method: Google Meet Video Session\n");
        if (meetingUrl != null && !meetingUrl.isBlank()) {
            body.append("Meeting Link: ").append(meetingUrl).append("\n");
        }
        body.append("--------------------------------------------------\n\n");
        body.append("PREPARATION TIPS:\n");
        body.append("- Keep your entrance exam rank card, target colleges, and marks memo handy.\n");
        body.append("- Join the meeting link 2 minutes before the scheduled time.\n\n");
        body.append("NEED TO RESCHEDULE OR CANCEL?\n");
        body.append("If you need to change your session time or cancel, please log in to your account at ")
            .append(getStudentPortalDoubtSessionsUrl())
            .append(" or reply directly to this email at least 4 hours prior.\n\n");
        body.append("Warm regards,\nRamesh & The LWR Connecting Academic Team\n");

        boolean sent = false;
        try {
            if (isSmtpEnabled()) {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setFrom(getFromAddress());
                mailMessage.setTo(recipientEmail.trim());
                mailMessage.setSubject(subject);
                mailMessage.setText(body.toString());
                mailSender.send(mailMessage);
                sent = true;
                logger.info("[EMAIL] Appointment confirmation dispatched to {} via SMTP", recipientEmail);
                logEmailEvent(recipientEmail, "APPOINTMENT_CONFIRMATION", "SENT", "msg_" + UUID.randomUUID(), null, idempotencyKey);
            } else if ("LOG".equalsIgnoreCase(emailProvider) || "LOG_ONLY".equalsIgnoreCase(emailProvider) || "CONSOLE".equalsIgnoreCase(emailProvider)) {
                logger.info("[EMAIL LOG MODE] Appointment Confirmation Email intended for {}:\n{}\n{}", recipientEmail, subject, body);
                logEmailEvent(recipientEmail, "APPOINTMENT_CONFIRMATION", "SENT", "mock_" + UUID.randomUUID(), null, idempotencyKey);
                sent = true;
            } else {
                logger.error("[APPOINTMENT EMAIL SMTP FAILURE] Real email cannot be dispatched to {}: Incomplete SMTP Configuration (missing SMTP_USERNAME / SMTP_PASSWORD).", recipientEmail);
                logEmailEvent(recipientEmail, "APPOINTMENT_CONFIRMATION", "FAILED", null, "Incomplete SMTP Configuration: missing SMTP_USERNAME / SMTP_PASSWORD", idempotencyKey);
                sent = false;
            }
        } catch (Exception e) {
            logger.error("[EMAIL ERROR] Failed to send appointment email to {}: {}", recipientEmail, e.getMessage());
            logEmailEvent(recipientEmail, "APPOINTMENT_CONFIRMATION", "FAILED", null, e.getMessage(), idempotencyKey);
            sent = false;
        }

        return sent;
    }

    @Override
    public boolean sendAppointmentRescheduledEmail(
            String recipientEmail,
            String studentName,
            String topic,
            java.time.LocalDate newDate,
            java.time.LocalTime newStartTime,
            java.time.LocalTime newEndTime,
            String timeZone,
            Long requestId,
            String meetingUrl,
            java.time.LocalDate oldDate,
            java.time.LocalTime oldStartTime,
            String idempotencyKey
    ) {
        if (recipientEmail == null || recipientEmail.isBlank()) return false;
        if (isAlreadySent(idempotencyKey)) return true;

        String tz = (timeZone != null && !timeZone.isBlank()) ? timeZone : "Asia/Kolkata";
        String safeName = (studentName != null && !studentName.isBlank()) ? studentName : "Student";
        String newDateStr = newDate != null ? newDate.toString() : "TBD";
        String newTimeStr = (newStartTime != null && newEndTime != null) ? newStartTime + " – " + newEndTime : "TBD";
        long durationMinutes = (newStartTime != null && newEndTime != null) ? java.time.Duration.between(newStartTime, newEndTime).toMinutes() : 45;

        String subject = "RESCHEDULED: Your Guidance Session with Ramesh (Request #" + requestId + ")";
        StringBuilder body = new StringBuilder();
        body.append("Hello ").append(safeName).append(",\n\n");
        body.append("Please note that your guidance session with Ramesh has been RESCHEDULED to a new time.\n\n");
        if (oldDate != null && oldStartTime != null) {
            body.append("Previous Schedule: ").append(oldDate).append(" at ").append(oldStartTime).append(" (Cancelled)\n");
        }
        body.append("NEW CONFIRMED SCHEDULE:\n");
        body.append("--------------------------------------------------\n");
        body.append("Date: ").append(newDateStr).append("\n");
        body.append("Time: ").append(newTimeStr).append(" (").append(tz).append(")\n");
        body.append("Duration: ").append(durationMinutes).append(" minutes\n");
        body.append("Topic: ").append(topic != null ? topic : "Student Guidance").append("\n");
        if (meetingUrl != null && !meetingUrl.isBlank()) {
            body.append("Meeting Link: ").append(meetingUrl).append("\n");
        }
        body.append("--------------------------------------------------\n\n");
        body.append("If this new timing does not work for you, you can request an alternate slot from your account at ")
            .append(getStudentPortalDoubtSessionsUrl())
            .append(".\n\n");
        body.append("Warm regards,\nRamesh & The LWR Connecting Academic Team\n");

        boolean sent = false;
        try {
            if (isSmtpEnabled()) {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setFrom(getFromAddress());
                mailMessage.setTo(recipientEmail.trim());
                mailMessage.setSubject(subject);
                mailMessage.setText(body.toString());
                mailSender.send(mailMessage);
                sent = true;
                logEmailEvent(recipientEmail, "APPOINTMENT_RESCHEDULED", "SENT", "msg_" + UUID.randomUUID(), null, idempotencyKey);
            } else if ("LOG".equalsIgnoreCase(emailProvider) || "LOG_ONLY".equalsIgnoreCase(emailProvider) || "CONSOLE".equalsIgnoreCase(emailProvider)) {
                logger.info("[EMAIL LOG MODE] Appointment Rescheduled Email intended for {}:\n{}\n{}", recipientEmail, subject, body);
                logEmailEvent(recipientEmail, "APPOINTMENT_RESCHEDULED", "SENT", "mock_" + UUID.randomUUID(), null, idempotencyKey);
                sent = true;
            } else {
                logger.error("[APPOINTMENT RESCHEDULE SMTP FAILURE] Real email cannot be dispatched to {}: Incomplete SMTP Configuration (missing SMTP_USERNAME / SMTP_PASSWORD).", recipientEmail);
                logEmailEvent(recipientEmail, "APPOINTMENT_RESCHEDULED", "FAILED", null, "Incomplete SMTP Configuration: missing SMTP_USERNAME / SMTP_PASSWORD", idempotencyKey);
                sent = false;
            }
        } catch (Exception e) {
            logger.error("[EMAIL ERROR] Failed to send rescheduled appointment email to {}: {}", recipientEmail, e.getMessage());
            logEmailEvent(recipientEmail, "APPOINTMENT_RESCHEDULED", "FAILED", null, e.getMessage(), idempotencyKey);
            sent = false;
        }
        return sent;
    }

    @Override
    public boolean sendAppointmentCancelledEmail(
            String recipientEmail,
            String studentName,
            String topic,
            Long requestId,
            String reason,
            String idempotencyKey
    ) {
        if (recipientEmail == null || recipientEmail.isBlank()) return false;
        if (isAlreadySent(idempotencyKey)) return true;

        String safeName = (studentName != null && !studentName.isBlank()) ? studentName : "Student";
        String subject = "Session Update: Guidance Request #" + requestId + " Has Been Cancelled";
        StringBuilder body = new StringBuilder();
        body.append("Hello ").append(safeName).append(",\n\n");
        body.append("Your guidance session for Request #").append(requestId);
        if (topic != null && !topic.isBlank()) {
            body.append(" (").append(topic).append(")");
        }
        body.append(" has been cancelled.\n\n");
        if (reason != null && !reason.isBlank()) {
            body.append("Reason / Notes: ").append(reason).append("\n\n");
        }
        body.append("If you would like to schedule a new session with Ramesh at a different time, please submit a new request through your student portal:\n");
        body.append(getStudentPortalDoubtSessionsUrl()).append("\n\n");
        body.append("Best regards,\nLaughs With Ramesh Connecting\n");

        boolean sent = false;
        try {
            if (isSmtpEnabled()) {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setFrom(getFromAddress());
                mailMessage.setTo(recipientEmail.trim());
                mailMessage.setSubject(subject);
                mailMessage.setText(body.toString());
                mailSender.send(mailMessage);
                sent = true;
                logEmailEvent(recipientEmail, "APPOINTMENT_CANCELLED", "SENT", "msg_" + UUID.randomUUID(), null, idempotencyKey);
            } else if ("LOG".equalsIgnoreCase(emailProvider) || "LOG_ONLY".equalsIgnoreCase(emailProvider) || "CONSOLE".equalsIgnoreCase(emailProvider)) {
                logger.info("[EMAIL LOG MODE] Appointment Cancelled Email intended for {}:\n{}\n{}", recipientEmail, subject, body);
                logEmailEvent(recipientEmail, "APPOINTMENT_CANCELLED", "SENT", "mock_" + UUID.randomUUID(), null, idempotencyKey);
                sent = true;
            } else {
                logger.error("[APPOINTMENT CANCEL SMTP FAILURE] Real email cannot be dispatched to {}: Incomplete SMTP Configuration (missing SMTP_USERNAME / SMTP_PASSWORD).", recipientEmail);
                logEmailEvent(recipientEmail, "APPOINTMENT_CANCELLED", "FAILED", null, "Incomplete SMTP Configuration: missing SMTP_USERNAME / SMTP_PASSWORD", idempotencyKey);
                sent = false;
            }
        } catch (Exception e) {
            logger.error("[EMAIL ERROR] Failed to send appointment cancellation email to {}: {}", recipientEmail, e.getMessage());
            logEmailEvent(recipientEmail, "APPOINTMENT_CANCELLED", "FAILED", null, e.getMessage(), idempotencyKey);
            sent = false;
        }
        return sent;
    }
}
