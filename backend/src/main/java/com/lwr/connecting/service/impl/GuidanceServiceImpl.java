package com.lwr.connecting.service.impl;

import com.lwr.connecting.entity.*;
import com.lwr.connecting.repository.*;
import com.lwr.connecting.service.EmailService;
import com.lwr.connecting.service.GuidanceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class GuidanceServiceImpl implements GuidanceService {

    private static final Logger logger = LoggerFactory.getLogger(GuidanceServiceImpl.class);

    @Autowired
    private GuidanceRequestRepository guidanceRequestRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private static final Set<String> VALID_STATUSES = Set.of(
            "PENDING", "APPROVED", "SCHEDULED", "RESCHEDULE_REQUESTED", "RESCHEDULED", "REJECTED", "COMPLETED", "CANCELLED"
    );

    @Override
    @Transactional
    public GuidanceRequest createStudentRequest(User student, Map<String, Object> requestData) {
        String studentName = requestData.containsKey("studentName") && requestData.get("studentName") != null && !requestData.get("studentName").toString().isBlank()
                ? requestData.get("studentName").toString().trim()
                : (student != null && student.getFullName() != null && !student.getFullName().isBlank() ? student.getFullName() : "Student");
        String email = requestData.containsKey("email") && requestData.get("email") != null && !requestData.get("email").toString().isBlank()
                ? requestData.get("email").toString().trim()
                : (student != null && student.getEmail() != null ? student.getEmail() : "student@lwrconnecting.com");
        String phone = requestData.containsKey("phone") && requestData.get("phone") != null ? requestData.get("phone").toString().trim() : null;
        String educationLevel = requestData.getOrDefault("educationLevel", "Intermediate 2nd Year").toString();
        String targetExam = requestData.getOrDefault("targetExam", "AP_EAPCET").toString();
        String subjectCategory = requestData.getOrDefault("subjectCategory", "College Cutoffs & Predictor").toString();
        String doubtDescription = requestData.getOrDefault("doubtDescription", "").toString().trim();
        String preferredContactMethod = requestData.getOrDefault("preferredContactMethod", "Google Meet").toString();

        if (student == null) {
            student = userRepository.findByEmail(email).orElse(null);
            if (student == null) {
                student = userRepository.findByEmail("student.demo@lwrconnecting.com")
                        .orElseGet(() -> userRepository.findAll().stream()
                                .filter(u -> u.getRoles().stream().anyMatch(r -> "ROLE_STUDENT".equals(r.getName())))
                                .findFirst().orElse(null));
            }
        }

        if (doubtDescription.isBlank()) {
            throw new IllegalArgumentException("Doubt description cannot be empty");
        }

        // Duplicate prevention: check for duplicate pending or recent identical submission within 15 minutes
        LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);
        List<GuidanceRequest> existingRecent = guidanceRequestRepository.findByStudentIdOrderByCreatedAtDesc(student != null ? student.getId() : -1L);
        for (GuidanceRequest er : existingRecent) {
            if (er.getStudentEmail().equalsIgnoreCase(email) &&
                er.getDoubtDescription().equalsIgnoreCase(doubtDescription) &&
                er.getCreatedAt().isAfter(fifteenMinutesAgo)) {
                throw new IllegalArgumentException("Duplicate request detected: You have already submitted an identical guidance request recently. Please await admin review.");
            }
        }

        LocalDate preferredDate = null;
        if (requestData.containsKey("preferredDate") && requestData.get("preferredDate") != null && !requestData.get("preferredDate").toString().isBlank()) {
            try {
                preferredDate = LocalDate.parse(requestData.get("preferredDate").toString().trim());
            } catch (Exception ignored) {}
        }
        String preferredTimeSlot = requestData.containsKey("preferredTimeSlot") && requestData.get("preferredTimeSlot") != null
                ? requestData.get("preferredTimeSlot").toString() : null;

        GuidanceRequest request = GuidanceRequest.builder()
                .student(student)
                .studentName(studentName)
                .studentEmail(email)
                .phone(phone)
                .educationLevel(educationLevel)
                .targetExam(targetExam)
                .subjectCategory(subjectCategory)
                .doubtDescription(doubtDescription)
                .preferredContactMethod(preferredContactMethod)
                .preferredDate(preferredDate)
                .preferredTimeSlot(preferredTimeSlot)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        GuidanceRequest saved = guidanceRequestRepository.save(request);

        // Notify Admins in-app
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName())))
                .toList();

        for (User admin : admins) {
            Notification adminNotif = Notification.builder()
                    .user(admin)
                    .title("🔔 New Guidance Request #" + saved.getId())
                    .message("Student " + saved.getStudentName() + " submitted a guidance request for " + saved.getTargetExam() + " (" + saved.getSubjectCategory() + ")")
                    .link("/admin")
                    .type("GUIDANCE_REQUEST")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(adminNotif);
        }

        logger.info("[GUIDANCE] Request #{} created for student {} ({})", saved.getId(), saved.getStudentName(), saved.getStudentEmail());
        return saved;
    }

    @Override
    public List<GuidanceRequest> getStudentRequests(Long studentId) {
        return guidanceRequestRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    @Override
    public GuidanceRequest getStudentRequestById(Long requestId, Long studentId) {
        GuidanceRequest req = guidanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new NoSuchElementException("Guidance request #" + requestId + " not found"));
        if (req.getStudent() == null || !req.getStudent().getId().equals(studentId)) {
            throw new SecurityException("Access denied: You can only view your own guidance requests");
        }
        return req;
    }

    @Override
    public List<GuidanceRequest> getAdminRequests(String status) {
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            return guidanceRequestRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        }
        return guidanceRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public Map<String, Long> getRequestStats() {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("total", guidanceRequestRepository.count());
        stats.put("pending", guidanceRequestRepository.countByStatus("PENDING"));
        stats.put("approved", guidanceRequestRepository.countByStatus("APPROVED"));
        stats.put("scheduled", guidanceRequestRepository.countByStatus("SCHEDULED"));
        stats.put("completed", guidanceRequestRepository.countByStatus("COMPLETED"));
        stats.put("rejected", guidanceRequestRepository.countByStatus("REJECTED"));
        stats.put("cancelled", guidanceRequestRepository.countByStatus("CANCELLED"));
        return stats;
    }

    @Override
    @Transactional
    public GuidanceRequest updateRequestStatus(Long requestId, String newStatus, String adminResponse) {
        GuidanceRequest req = guidanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new NoSuchElementException("Guidance request #" + requestId + " not found"));

        String currentStatus = req.getStatus();
        String upperNew = newStatus.toUpperCase();

        if (!VALID_STATUSES.contains(upperNew)) {
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        }

        // Validate state transitions
        if ("REJECTED".equals(currentStatus) || "COMPLETED".equals(currentStatus) || "CANCELLED".equals(currentStatus)) {
            throw new IllegalStateException("Cannot change status from terminal state: " + currentStatus);
        }

        req.setStatus(upperNew);
        if (adminResponse != null && !adminResponse.isBlank()) {
            req.setAdminResponse(adminResponse.trim());
        }
        req.setUpdatedAt(LocalDateTime.now());
        GuidanceRequest updated = guidanceRequestRepository.save(req);

        // Notify student of status update
        String notifTitle = "Guidance Request #" + req.getId() + " Updated: " + upperNew;
        String notifMsg = (adminResponse != null && !adminResponse.isBlank())
                ? "Admin Response: " + adminResponse
                : "Your guidance request status is now " + upperNew;

        Notification studentNotif = Notification.builder()
                .user(req.getStudent())
                .title(notifTitle)
                .message(notifMsg)
                .link("/doubt-sessions")
                .type("GUIDANCE_STATUS")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(studentNotif);

        logger.info("[GUIDANCE] Request #{} transitioned from {} to {}", req.getId(), currentStatus, upperNew);
        return updated;
    }

    @Override
    @Transactional
    public Appointment scheduleAppointment(
            Long requestId,
            User admin,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String timeZone,
            String meetingMethod,
            String meetingUrl,
            String notes
    ) {
        GuidanceRequest request = guidanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new NoSuchElementException("Guidance request #" + requestId + " not found"));

        if ("REJECTED".equals(request.getStatus()) || "COMPLETED".equals(request.getStatus()) || "CANCELLED".equals(request.getStatus())) {
            throw new IllegalStateException("Cannot schedule appointment for a request with status: " + request.getStatus());
        }

        // Validate times
        if (date == null || startTime == null || endTime == null) {
            throw new IllegalArgumentException("Date, start time, and end time are required");
        }
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time (" + startTime + ") must be before end time (" + endTime + ")");
        }

        String tz = (timeZone != null && !timeZone.isBlank()) ? timeZone.trim() : "Asia/Kolkata";

        // Prevent overlapping appointments for this admin on the same date
        List<Appointment> overlaps = appointmentRepository.findOverlappingAppointments(admin.getId(), date, startTime, endTime, null);
        if (!overlaps.isEmpty()) {
            Appointment clash = overlaps.get(0);
            throw new IllegalStateException("Scheduling Conflict: Ramesh already has an active appointment scheduled on " +
                    clash.getAppointmentDate() + " from " + clash.getStartTime() + " to " + clash.getEndTime() + " (" + clash.getTopic() + ")");
        }

        // Check if an appointment already exists for this request (update it instead of creating duplicate)
        Appointment appointment = appointmentRepository.findByGuidanceRequestId(requestId).orElseGet(Appointment::new);
        appointment.setGuidanceRequest(request);
        appointment.setStudent(request.getStudent());
        appointment.setAdmin(admin);
        appointment.setAppointmentDate(date);
        appointment.setStartTime(startTime);
        appointment.setEndTime(endTime);
        appointment.setTimeZone(tz);
        appointment.setTopic(request.getSubjectCategory() + ": " + (request.getDoubtDescription().length() > 60 ? request.getDoubtDescription().substring(0, 57) + "..." : request.getDoubtDescription()));
        appointment.setMeetingMethod(meetingMethod != null && !meetingMethod.isBlank() ? meetingMethod : "Google Meet");
        appointment.setMeetingUrl(meetingUrl != null && !meetingUrl.isBlank() ? meetingUrl.trim() : null);
        appointment.setStatus("SCHEDULED");
        appointment.setNotes(notes);
        appointment.setUpdatedAt(LocalDateTime.now());

        // Update Request Status to SCHEDULED
        request.setStatus("SCHEDULED");
        request.setUpdatedAt(LocalDateTime.now());
        if (notes != null && !notes.isBlank()) {
            request.setAdminResponse(notes);
        }
        guidanceRequestRepository.save(request);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Create In-App Notification for Student
        Notification notif = Notification.builder()
                .user(request.getStudent())
                .title("📅 Guidance Session Scheduled with Ramesh")
                .message("Your guidance session on " + savedAppointment.getTopic() + " is confirmed for " + date + " from " + startTime + " to " + endTime + " (" + tz + ").")
                .link("/doubt-sessions")
                .type("APPOINTMENT_SCHEDULED")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notif);

        // Send Email Confirmation
        String idempotencyKey = "APPT_CONFIRM_" + savedAppointment.getId() + "_" + date + "_" + startTime;
        boolean emailSuccess = false;
        try {
            emailSuccess = emailService.sendAppointmentConfirmationEmail(
                    request.getStudentEmail(),
                    request.getStudentName(),
                    savedAppointment.getTopic(),
                    date,
                    startTime,
                    endTime,
                    tz,
                    request.getId(),
                    savedAppointment.getMeetingUrl(),
                    idempotencyKey
            );
            savedAppointment.setEmailDeliveryStatus(emailSuccess ? "SENT" : "FAILED");
        } catch (Exception e) {
            logger.warn("[APPOINTMENT] Email sending error: {}. Preserving appointment in database.", e.getMessage());
            savedAppointment.setEmailDeliveryStatus("FAILED");
        }
        appointmentRepository.save(savedAppointment);

        logger.info("[APPOINTMENT] Scheduled #{} on {} {}-{} for student {}. Email Status: {}",
                savedAppointment.getId(), date, startTime, endTime, request.getStudentEmail(), savedAppointment.getEmailDeliveryStatus());

        return savedAppointment;
    }

    @Override
    @Transactional
    public Appointment rescheduleAppointment(
            Long appointmentId,
            User admin,
            LocalDate newDate,
            LocalTime newStartTime,
            LocalTime newEndTime,
            String timeZone,
            String meetingUrl,
            String notes
    ) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NoSuchElementException("Appointment #" + appointmentId + " not found"));

        if ("CANCELLED".equals(appointment.getStatus()) || "COMPLETED".equals(appointment.getStatus())) {
            throw new IllegalStateException("Cannot reschedule an appointment in status: " + appointment.getStatus());
        }

        if (newDate == null || newStartTime == null || newEndTime == null) {
            throw new IllegalArgumentException("New date, start time, and end time are required");
        }
        if (!newStartTime.isBefore(newEndTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // Check for overlaps (excluding current appointment id)
        List<Appointment> overlaps = appointmentRepository.findOverlappingAppointments(admin.getId(), newDate, newStartTime, newEndTime, appointmentId);
        if (!overlaps.isEmpty()) {
            Appointment clash = overlaps.get(0);
            throw new IllegalStateException("Scheduling Conflict: Overlaps with appointment #" + clash.getId() + " on " +
                    clash.getAppointmentDate() + " from " + clash.getStartTime() + " to " + clash.getEndTime());
        }

        LocalDate oldDate = appointment.getAppointmentDate();
        LocalTime oldStartTime = appointment.getStartTime();

        appointment.setAppointmentDate(newDate);
        appointment.setStartTime(newStartTime);
        appointment.setEndTime(newEndTime);
        if (timeZone != null && !timeZone.isBlank()) appointment.setTimeZone(timeZone.trim());
        if (meetingUrl != null && !meetingUrl.isBlank()) appointment.setMeetingUrl(meetingUrl.trim());
        if (notes != null && !notes.isBlank()) appointment.setNotes(notes);
        appointment.setStatus("RESCHEDULED");
        appointment.setUpdatedAt(LocalDateTime.now());

        Appointment saved = appointmentRepository.save(appointment);

        // Notify student of rescheduling in-app
        if (saved.getStudent() != null) {
            Notification notif = Notification.builder()
                    .user(saved.getStudent())
                    .title("📅 Guidance Session Rescheduled")
                    .message("Your session with Ramesh has been rescheduled to " + newDate + " from " + newStartTime + " to " + newEndTime + " (" + saved.getTimeZone() + ").")
                    .link("/doubt-sessions")
                    .type("APPOINTMENT_RESCHEDULED")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(notif);
        }

        // Send Email Notification
        String idempotencyKey = "APPT_RESCHED_" + saved.getId() + "_" + newDate + "_" + newStartTime;
        try {
            String recipientEmail = saved.getStudent() != null ? saved.getStudent().getEmail() : (saved.getGuidanceRequest() != null ? saved.getGuidanceRequest().getStudentEmail() : null);
            String recipientName = saved.getStudent() != null ? saved.getStudent().getFullName() : (saved.getGuidanceRequest() != null ? saved.getGuidanceRequest().getStudentName() : "Student");
            Long reqId = saved.getGuidanceRequest() != null ? saved.getGuidanceRequest().getId() : saved.getId();

            boolean sent = emailService.sendAppointmentRescheduledEmail(
                    recipientEmail,
                    recipientName,
                    saved.getTopic(),
                    newDate,
                    newStartTime,
                    newEndTime,
                    saved.getTimeZone(),
                    reqId,
                    saved.getMeetingUrl(),
                    oldDate,
                    oldStartTime,
                    idempotencyKey
            );
            saved.setEmailDeliveryStatus(sent ? "SENT" : "FAILED");
            appointmentRepository.save(saved);
        } catch (Exception e) {
            logger.warn("[APPOINTMENT] Rescheduled email failed: {}", e.getMessage());
            saved.setEmailDeliveryStatus("FAILED");
            appointmentRepository.save(saved);
        }

        logger.info("[APPOINTMENT] Rescheduled #{} to {} {}-{}", saved.getId(), newDate, newStartTime, newEndTime);
        return saved;
    }

    @Override
    @Transactional
    public Appointment cancelAppointment(Long appointmentId, String cancelReason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NoSuchElementException("Appointment #" + appointmentId + " not found"));

        appointment.setStatus("CANCELLED");
        if (cancelReason != null && !cancelReason.isBlank()) {
            appointment.setNotes((appointment.getNotes() != null ? appointment.getNotes() + " | Cancellation Reason: " : "Cancellation Reason: ") + cancelReason);
        }
        appointment.setUpdatedAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appointment);

        // Also update the associated request
        GuidanceRequest req = appointment.getGuidanceRequest();
        if (req != null) {
            req.setStatus("CANCELLED");
            if (cancelReason != null && !cancelReason.isBlank()) {
                req.setAdminResponse("Session cancelled: " + cancelReason);
            }
            req.setUpdatedAt(LocalDateTime.now());
            guidanceRequestRepository.save(req);
        }

        // Notify student in-app
        if (saved.getStudent() != null) {
            Notification notif = Notification.builder()
                    .user(saved.getStudent())
                    .title("❌ Guidance Session Cancelled")
                    .message("Your session scheduled for " + saved.getAppointmentDate() + " was cancelled" + (cancelReason != null ? ": " + cancelReason : "."))
                    .link("/doubt-sessions")
                    .type("APPOINTMENT_CANCELLED")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(notif);
        }

        // Send Email Cancellation Notice
        String idempotencyKey = "APPT_CANCEL_" + saved.getId() + "_" + System.currentTimeMillis();
        try {
            String studentEmail = saved.getStudent() != null ? saved.getStudent().getEmail() : (saved.getGuidanceRequest() != null ? saved.getGuidanceRequest().getStudentEmail() : null);
            String studentName = saved.getStudent() != null ? saved.getStudent().getFullName() : (saved.getGuidanceRequest() != null ? saved.getGuidanceRequest().getStudentName() : "Student");
            Long reqId = saved.getGuidanceRequest() != null ? saved.getGuidanceRequest().getId() : saved.getId();
            if (studentEmail != null && !studentEmail.isBlank()) {
                emailService.sendAppointmentCancelledEmail(studentEmail, studentName, saved.getTopic(), reqId, cancelReason, idempotencyKey);
            }
        } catch (Exception e) {
            logger.warn("[APPOINTMENT] Cancellation email failed: {}", e.getMessage());
        }

        logger.info("[APPOINTMENT] Cancelled #{}", saved.getId());
        return saved;
    }

    @Override
    public Appointment getAppointmentByRequestId(Long requestId) {
        return appointmentRepository.findByGuidanceRequestId(requestId).orElse(null);
    }

    @Override
    @Transactional
    public boolean retryAppointmentEmail(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NoSuchElementException("Appointment #" + appointmentId + " not found"));

        GuidanceRequest req = appointment.getGuidanceRequest();
        String studentEmail = req != null ? req.getStudentEmail() : (appointment.getStudent() != null ? appointment.getStudent().getEmail() : null);
        String studentName = req != null ? req.getStudentName() : (appointment.getStudent() != null ? appointment.getStudent().getFullName() : "Student");
        Long requestId = req != null ? req.getId() : appointment.getId();

        if (studentEmail == null || studentEmail.isBlank()) {
            throw new IllegalArgumentException("Student email is not available for appointment #" + appointmentId);
        }

        String idempotencyKey = "RETRY_APPT_EMAIL_" + appointment.getId() + "_" + System.currentTimeMillis();
        boolean sent = emailService.sendAppointmentConfirmationEmail(
                studentEmail,
                studentName,
                appointment.getTopic(),
                appointment.getAppointmentDate(),
                appointment.getStartTime(),
                appointment.getEndTime(),
                appointment.getTimeZone(),
                requestId,
                appointment.getMeetingUrl(),
                idempotencyKey
        );

        appointment.setEmailDeliveryStatus(sent ? "SENT" : "FAILED");
        appointment.setUpdatedAt(LocalDateTime.now());
        appointmentRepository.save(appointment);
        logger.info("[APPOINTMENT] Retried email dispatch for appointment #{}: result={}", appointmentId, appointment.getEmailDeliveryStatus());
        return sent;
    }
}
