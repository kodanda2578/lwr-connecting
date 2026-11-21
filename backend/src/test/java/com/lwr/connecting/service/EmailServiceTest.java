package com.lwr.connecting.service;

import com.lwr.connecting.entity.EmailEvent;
import com.lwr.connecting.repository.EmailEventRepository;
import com.lwr.connecting.service.impl.EmailServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSenderImpl mailSender;

    @Mock
    private EmailEventRepository emailEventRepository;

    @InjectMocks
    private EmailServiceImpl emailService;

    @BeforeEach
    void setUp() {
        when(emailEventRepository.save(any(EmailEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void testSmtpModeWithoutCredentialsFailsHonestly() {
        // Given EMAIL_PROVIDER is SMTP, but username/password are empty
        ReflectionTestUtils.setField(emailService, "emailProvider", "SMTP");
        ReflectionTestUtils.setField(emailService, "mailHost", "smtp.gmail.com");
        ReflectionTestUtils.setField(emailService, "mailPort", 587);
        ReflectionTestUtils.setField(emailService, "mailUsername", "");
        ReflectionTestUtils.setField(emailService, "mailPassword", "");
        when(mailSender.getHost()).thenReturn("smtp.gmail.com");
        when(mailSender.getUsername()).thenReturn(null);
        when(mailSender.getPassword()).thenReturn(null);

        // When sending OTP
        boolean sent = emailService.sendLoginEmailOtp("student@example.com", "Student", "123456", "KEY_1");

        // Then it must return false (not claim fake success)
        assertFalse(sent, "When SMTP credentials are missing, email delivery must return false");
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void testSmtpModeWithTransmissionErrorReturnsFalse() {
        // Given SMTP is configured with credentials
        ReflectionTestUtils.setField(emailService, "emailProvider", "SMTP");
        ReflectionTestUtils.setField(emailService, "mailHost", "smtp.gmail.com");
        ReflectionTestUtils.setField(emailService, "mailPort", 587);
        ReflectionTestUtils.setField(emailService, "mailUsername", "sender@gmail.com");
        ReflectionTestUtils.setField(emailService, "mailPassword", "app-password");
        when(mailSender.getHost()).thenReturn("smtp.gmail.com");
        when(mailSender.getUsername()).thenReturn("sender@gmail.com");
        when(mailSender.getPassword()).thenReturn("app-password");

        // And mailSender throws MailSendException (network or auth failure)
        doThrow(new MailSendException("SMTP Authentication failed"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        // When sending OTP
        boolean sent = emailService.sendLoginEmailOtp("student@example.com", "Student", "123456", "KEY_2");

        // Then it must NOT swallow the error and return true
        assertFalse(sent, "When SMTP server rejects the email, sendLoginEmailOtp must return false");
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testSmtpModeSuccess() {
        // Given valid credentials and mailSender accepts message
        ReflectionTestUtils.setField(emailService, "emailProvider", "SMTP");
        ReflectionTestUtils.setField(emailService, "mailHost", "smtp.gmail.com");
        ReflectionTestUtils.setField(emailService, "mailPort", 587);
        ReflectionTestUtils.setField(emailService, "mailUsername", "sender@gmail.com");
        ReflectionTestUtils.setField(emailService, "mailPassword", "app-password");
        when(mailSender.getHost()).thenReturn("smtp.gmail.com");
        when(mailSender.getUsername()).thenReturn("sender@gmail.com");
        when(mailSender.getPassword()).thenReturn("app-password");

        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // When sending OTP
        boolean sent = emailService.sendLoginEmailOtp("student@example.com", "Student", "123456", "KEY_3");

        // Then it must return true
        assertTrue(sent, "When SMTP server accepts the email, sendLoginEmailOtp must return true");
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testExplicitLogModeReturnsTrue() {
        // Given EMAIL_PROVIDER is explicitly set to LOG
        ReflectionTestUtils.setField(emailService, "emailProvider", "LOG");

        boolean sent = emailService.sendLoginEmailOtp("student@example.com", "Student", "123456", "KEY_4");

        assertTrue(sent, "In explicit LOG mode, it returns true for local dev testing");
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }
}
