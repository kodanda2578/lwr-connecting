package com.lwr.connecting.controller;

import com.lwr.connecting.entity.Appointment;
import com.lwr.connecting.entity.GuidanceRequest;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.UserRepository;
import com.lwr.connecting.service.GuidanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@RestController
@RequestMapping({"/admin/guidance-requests", "/api/admin/guidance-requests"})
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminGuidanceController {

    @Autowired
    private GuidanceService guidanceService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllRequests(@RequestParam(required = false) String status) {
        List<GuidanceRequest> requests = guidanceService.getAdminRequests(status);
        List<Map<String, Object>> response = new ArrayList<>();
        for (GuidanceRequest r : requests) {
            Appointment appt = guidanceService.getAppointmentByRequestId(r.getId());
            response.add(formatAdminRequest(r, appt));
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getRequestStats() {
        return ResponseEntity.ok(guidanceService.getRequestStats());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String newStatus = body.get("status");
        String adminResponse = body.get("adminResponse");

        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status field is required"));
        }

        try {
            GuidanceRequest updated = guidanceService.updateRequestStatus(id, newStatus, adminResponse);
            Appointment appt = guidanceService.getAppointmentByRequestId(id);
            return ResponseEntity.ok(formatAdminRequest(updated, appt));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<?> scheduleAppointment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        User admin = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Admin account not found"));
        }

        try {
            String dateStr = body.get("date");
            String startStr = body.get("startTime");
            String endStr = body.get("endTime");
            String timeZone = body.getOrDefault("timeZone", "Asia/Kolkata");
            String meetingMethod = body.getOrDefault("meetingMethod", "Google Meet");
            String meetingUrl = body.get("meetingUrl");
            String notes = body.get("notes");

            if (dateStr == null || startStr == null || endStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "date, startTime, and endTime are required"));
            }

            LocalDate date = LocalDate.parse(dateStr);
            LocalTime startTime = LocalTime.parse(startStr);
            LocalTime endTime = LocalTime.parse(endStr);

            Appointment appt = guidanceService.scheduleAppointment(
                    id, admin, date, startTime, endTime, timeZone, meetingMethod, meetingUrl, notes
            );

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("success", true);
            resp.put("message", "Appointment scheduled successfully");
            resp.put("appointmentId", appt.getId());
            resp.put("appointmentDate", appt.getAppointmentDate());
            resp.put("startTime", appt.getStartTime());
            resp.put("endTime", appt.getEndTime());
            resp.put("timeZone", appt.getTimeZone());
            resp.put("meetingUrl", appt.getMeetingUrl());
            resp.put("status", appt.getStatus());
            resp.put("emailDeliveryStatus", appt.getEmailDeliveryStatus());

            return ResponseEntity.ok(resp);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to schedule appointment: " + e.getMessage()));
        }
    }

    @PostMapping("/appointments/{appointmentId}/reschedule")
    public ResponseEntity<?> reschedule(
            @PathVariable Long appointmentId,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        User admin = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Admin account not found"));
        }

        try {
            LocalDate newDate = LocalDate.parse(body.get("date"));
            LocalTime newStartTime = LocalTime.parse(body.get("startTime"));
            LocalTime newEndTime = LocalTime.parse(body.get("endTime"));
            String timeZone = body.getOrDefault("timeZone", "Asia/Kolkata");
            String meetingUrl = body.get("meetingUrl");
            String notes = body.get("notes");

            Appointment appt = guidanceService.rescheduleAppointment(
                    appointmentId, admin, newDate, newStartTime, newEndTime, timeZone, meetingUrl, notes
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Appointment rescheduled successfully",
                    "appointmentId", appt.getId(),
                    "date", appt.getAppointmentDate(),
                    "startTime", appt.getStartTime(),
                    "endTime", appt.getEndTime(),
                    "emailDeliveryStatus", appt.getEmailDeliveryStatus()
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/appointments/{appointmentId}/cancel")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable Long appointmentId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String reason = body != null ? body.get("reason") : "Cancelled by administrator";
        try {
            Appointment appt = guidanceService.cancelAppointment(appointmentId, reason);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Appointment cancelled successfully",
                    "status", appt.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/appointments/{appointmentId}/retry-email")
    public ResponseEntity<?> retryEmail(@PathVariable Long appointmentId) {
        try {
            boolean sent = guidanceService.retryAppointmentEmail(appointmentId);
            return ResponseEntity.ok(Map.of(
                    "success", sent,
                    "message", sent ? "Appointment email sent successfully" : "Appointment email dispatch failed",
                    "appointmentId", appointmentId,
                    "emailDeliveryStatus", sent ? "SENT" : "FAILED"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> formatAdminRequest(GuidanceRequest r, Appointment appt) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("requestId", r.getId());
        m.put("studentId", r.getStudent() != null ? r.getStudent().getId() : null);
        m.put("studentName", r.getStudentName());
        m.put("studentEmail", r.getStudentEmail());
        m.put("phone", r.getPhone());
        m.put("educationLevel", r.getEducationLevel());
        m.put("targetExam", r.getTargetExam());
        m.put("subjectCategory", r.getSubjectCategory());
        m.put("doubtDescription", r.getDoubtDescription());
        m.put("preferredContactMethod", r.getPreferredContactMethod());
        m.put("preferredDate", r.getPreferredDate());
        m.put("preferredTimeSlot", r.getPreferredTimeSlot());
        m.put("status", r.getStatus());
        m.put("adminResponse", r.getAdminResponse());
        m.put("createdAt", r.getCreatedAt());
        m.put("updatedAt", r.getUpdatedAt());

        if (appt != null) {
            Map<String, Object> a = new LinkedHashMap<>();
            a.put("appointmentId", appt.getId());
            a.put("date", appt.getAppointmentDate());
            a.put("startTime", appt.getStartTime());
            a.put("endTime", appt.getEndTime());
            a.put("timeZone", appt.getTimeZone());
            a.put("meetingMethod", appt.getMeetingMethod());
            a.put("meetingUrl", appt.getMeetingUrl());
            a.put("status", appt.getStatus());
            a.put("notes", appt.getNotes());
            a.put("emailDeliveryStatus", appt.getEmailDeliveryStatus());
            m.put("appointment", a);
        } else {
            m.put("appointment", null);
        }

        return m;
    }
}
