package com.lwr.connecting.service;

import com.lwr.connecting.entity.*;
import com.lwr.connecting.repository.*;
import com.lwr.connecting.service.impl.GuidanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GuidanceWorkflowIntegrationTest {

    @Mock
    private GuidanceRequestRepository guidanceRequestRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private GuidanceServiceImpl guidanceService;

    private User studentA;
    private User studentB;
    private User adminUser;

    @BeforeEach
    void setUp() {
        Role studentRole = Role.builder().id(1).name("ROLE_STUDENT").build();
        Role adminRole = Role.builder().id(2).name("ROLE_ADMIN").build();

        studentA = User.builder()
                .id(101L)
                .email("studentA@lwrconnecting.com")
                .fullName("Student Alpha")
                .roles(Set.of(studentRole))
                .build();

        studentB = User.builder()
                .id(102L)
                .email("studentB@lwrconnecting.com")
                .fullName("Student Beta")
                .roles(Set.of(studentRole))
                .build();

        adminUser = User.builder()
                .id(1L)
                .email("admin@lwrconnecting.com")
                .fullName("Ramesh Admin")
                .roles(Set.of(adminRole))
                .build();
    }

    @Test
    void testStudentRequestCreationSuccess() {
        Map<String, Object> reqData = new HashMap<>();
        reqData.put("subjectCategory", "AP EAPCET Strategy");
        reqData.put("doubtDescription", "Need help choosing between AUCE and JNTUK for CSE.");
        reqData.put("educationLevel", "Intermediate 2nd Year");
        reqData.put("targetExam", "AP_EAPCET");

        when(guidanceRequestRepository.findByStudentIdOrderByCreatedAtDesc(studentA.getId()))
                .thenReturn(Collections.emptyList());

        when(guidanceRequestRepository.save(any(GuidanceRequest.class)))
                .thenAnswer(inv -> {
                    GuidanceRequest gr = inv.getArgument(0);
                    gr.setId(201L);
                    return gr;
                });

        GuidanceRequest created = guidanceService.createStudentRequest(studentA, reqData);

        assertNotNull(created);
        assertEquals("PENDING", created.getStatus());
        assertEquals("studentA@lwrconnecting.com", created.getStudentEmail());
        assertEquals(201L, created.getId());
        verify(guidanceRequestRepository, times(1)).save(any(GuidanceRequest.class));
    }

    @Test
    void testDuplicateRequestWithin15MinutesIsRejected() {
        Map<String, Object> reqData = new HashMap<>();
        reqData.put("subjectCategory", "College Cutoffs");
        reqData.put("doubtDescription", "Repeated query within 5 minutes.");

        GuidanceRequest prior = GuidanceRequest.builder()
                .id(202L)
                .student(studentA)
                .studentEmail(studentA.getEmail())
                .doubtDescription("Repeated query within 5 minutes.")
                .createdAt(LocalDateTime.now().minusMinutes(3))
                .build();

        when(guidanceRequestRepository.findByStudentIdOrderByCreatedAtDesc(studentA.getId()))
                .thenReturn(List.of(prior));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            guidanceService.createStudentRequest(studentA, reqData);
        });

        assertTrue(ex.getMessage().contains("Duplicate request detected"));
        verify(guidanceRequestRepository, never()).save(any(GuidanceRequest.class));
    }

    @Test
    void testAdminSchedulingCreatesAppointmentNotificationAndEmail() {
        GuidanceRequest req = GuidanceRequest.builder()
                .id(205L)
                .student(studentA)
                .studentEmail(studentA.getEmail())
                .studentName(studentA.getFullName())
                .subjectCategory("Web Options Counselling")
                .doubtDescription("Need help finalizing college choice list for EAPCET.")
                .status("PENDING")
                .build();

        when(guidanceRequestRepository.findById(205L)).thenReturn(Optional.of(req));
        when(appointmentRepository.findByGuidanceRequestId(205L)).thenReturn(Optional.empty());
        when(appointmentRepository.findOverlappingAppointments(any(), any(), any(), any(), any())).thenReturn(Collections.emptyList());
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> {
            Appointment a = inv.getArgument(0);
            a.setId(501L);
            return a;
        });
        when(guidanceRequestRepository.save(any(GuidanceRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        Appointment appt = guidanceService.scheduleAppointment(
                205L,
                adminUser,
                LocalDate.parse("2026-11-05"),
                LocalTime.parse("15:30"),
                LocalTime.parse("16:00"),
                "Asia/Kolkata",
                "Google Meet",
                "https://meet.google.com/xyz-abc-def",
                "Confirmed session"
        );

        assertNotNull(appt);
        assertEquals(LocalDate.parse("2026-11-05"), appt.getAppointmentDate());
        assertEquals("SCHEDULED", req.getStatus());
        assertEquals("SCHEDULED", appt.getStatus());

        // In-app notification creation verified
        verify(notificationRepository, times(1)).save(any(Notification.class));

        // Transactional email notification verified
        verify(emailService, times(1)).sendAppointmentConfirmationEmail(
                eq(studentA.getEmail()),
                eq(studentA.getFullName()),
                anyString(),
                eq(LocalDate.parse("2026-11-05")),
                eq(LocalTime.parse("15:30")),
                eq(LocalTime.parse("16:00")),
                eq("Asia/Kolkata"),
                eq(205L),
                eq("https://meet.google.com/xyz-abc-def"),
                anyString()
        );
    }

    @Test
    void testDoubleBookingConflictThrowsException() {
        GuidanceRequest req = GuidanceRequest.builder()
                .id(206L)
                .student(studentA)
                .studentEmail(studentA.getEmail())
                .subjectCategory("Cutoff Analysis")
                .doubtDescription("Query about AUCE CSE cutoff.")
                .status("PENDING")
                .build();

        Appointment existingClash = Appointment.builder()
                .id(888L)
                .appointmentDate(LocalDate.parse("2026-11-05"))
                .startTime(LocalTime.parse("15:30"))
                .endTime(LocalTime.parse("16:00"))
                .topic("Existing Booking")
                .build();

        when(guidanceRequestRepository.findById(206L)).thenReturn(Optional.of(req));
        // Simulate existing clashing appointment on that date and time slot
        when(appointmentRepository.findOverlappingAppointments(eq(adminUser.getId()), any(), any(), any(), any()))
                .thenReturn(List.of(existingClash));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            guidanceService.scheduleAppointment(
                    206L,
                    adminUser,
                    LocalDate.parse("2026-11-05"),
                    LocalTime.parse("15:30"),
                    LocalTime.parse("16:00"),
                    "Asia/Kolkata",
                    "Google Meet",
                    null,
                    null
            );
        });

        assertTrue(ex.getMessage().contains("Scheduling Conflict: Ramesh already has an active appointment"));
        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    void testReschedulingAndCancellationNotifiesStudent() {
        GuidanceRequest req = GuidanceRequest.builder()
                .id(207L)
                .student(studentA)
                .studentEmail(studentA.getEmail())
                .studentName(studentA.getFullName())
                .subjectCategory("College Choice")
                .status("SCHEDULED")
                .build();

        Appointment appt = Appointment.builder()
                .id(301L)
                .guidanceRequest(req)
                .student(studentA)
                .admin(adminUser)
                .appointmentDate(LocalDate.parse("2026-11-05"))
                .startTime(LocalTime.parse("14:00"))
                .endTime(LocalTime.parse("14:45"))
                .timeZone("Asia/Kolkata")
                .topic("College Choice Consultation")
                .meetingMethod("Google Meet")
                .meetingUrl("https://meet.google.com/old-meet")
                .status("SCHEDULED")
                .build();

        when(appointmentRepository.findById(301L)).thenReturn(Optional.of(appt));
        when(appointmentRepository.findOverlappingAppointments(any(), any(), any(), any(), eq(301L))).thenReturn(Collections.emptyList());
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

        // Reschedule
        Appointment updated = guidanceService.rescheduleAppointment(
                301L,
                adminUser,
                LocalDate.parse("2026-11-06"),
                LocalTime.parse("16:00"),
                LocalTime.parse("16:45"),
                "Asia/Kolkata",
                "https://meet.google.com/new-meet",
                "Shifted slot"
        );

        assertEquals(LocalDate.parse("2026-11-06"), updated.getAppointmentDate());
        assertEquals("RESCHEDULED", updated.getStatus());
        verify(emailService, times(1)).sendAppointmentRescheduledEmail(
                eq(studentA.getEmail()),
                eq(studentA.getFullName()),
                anyString(),
                eq(LocalDate.parse("2026-11-06")),
                eq(LocalTime.parse("16:00")),
                eq(LocalTime.parse("16:45")),
                eq("Asia/Kolkata"),
                eq(207L),
                eq("https://meet.google.com/new-meet"),
                eq(LocalDate.parse("2026-11-05")),
                eq(LocalTime.parse("14:00")),
                anyString()
        );

        // Cancel
        when(guidanceRequestRepository.save(any(GuidanceRequest.class))).thenAnswer(inv -> inv.getArgument(0));
        Appointment cancelled = guidanceService.cancelAppointment(301L, "Schedule conflict with JEE Grand Test");

        assertEquals("CANCELLED", cancelled.getStatus());
        verify(emailService, times(1)).sendAppointmentCancelledEmail(
                eq(studentA.getEmail()),
                eq(studentA.getFullName()),
                anyString(),
                eq(207L),
                eq("Schedule conflict with JEE Grand Test"),
                anyString()
        );
    }
}
