package com.lwr.connecting.controller;

import com.lwr.connecting.entity.Appointment;
import com.lwr.connecting.entity.GuidanceRequest;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.UserRepository;
import com.lwr.connecting.service.GuidanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping({"/guidance-requests", "/api/guidance-requests"})
@CrossOrigin(origins = "*")
public class GuidanceRequestController {

    @Autowired
    private GuidanceService guidanceService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> submitRequest(@RequestBody Map<String, Object> body, Authentication authentication) {
        User student = null;
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            student = userRepository.findByEmail(authentication.getName()).orElse(null);
        } else if (body.containsKey("email") && body.get("email") != null) {
            String guestEmail = body.get("email").toString().trim();
            student = userRepository.findByEmail(guestEmail).orElse(null);
        }

        if (student != null && student.getProfile() != null && Boolean.TRUE.equals(student.getProfile().getIsMinor())
                && !Boolean.TRUE.equals(student.getProfile().getGuardianConsentGiven())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Parent/Guardian consent is required before intermediate minor students can book mentorship guidance."));
        }

        try {
            GuidanceRequest request = guidanceService.createStudentRequest(student, body);
            Appointment appt = guidanceService.getAppointmentByRequestId(request.getId());

            Map<String, Object> response = formatRequestResponse(request, appt);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-requests")
    public ResponseEntity<?> getMyRequests(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        User student = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
        }

        List<GuidanceRequest> requests = guidanceService.getStudentRequests(student.getId());
        List<Map<String, Object>> response = new ArrayList<>();
        for (GuidanceRequest r : requests) {
            Appointment appt = guidanceService.getAppointmentByRequestId(r.getId());
            response.add(formatRequestResponse(r, appt));
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-requests/{id}")
    public ResponseEntity<?> getMyRequestById(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        User student = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
        }

        try {
            GuidanceRequest r = guidanceService.getStudentRequestById(id, student.getId());
            Appointment appt = guidanceService.getAppointmentByRequestId(r.getId());
            return ResponseEntity.ok(formatRequestResponse(r, appt));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> formatRequestResponse(GuidanceRequest r, Appointment appt) {
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
            Map<String, Object> apptMap = new LinkedHashMap<>();
            apptMap.put("appointmentId", appt.getId());
            apptMap.put("appointmentDate", appt.getAppointmentDate());
            apptMap.put("startTime", appt.getStartTime());
            apptMap.put("endTime", appt.getEndTime());
            apptMap.put("timeZone", appt.getTimeZone());
            apptMap.put("meetingMethod", appt.getMeetingMethod());
            apptMap.put("meetingUrl", appt.getMeetingUrl());
            apptMap.put("status", appt.getStatus());
            apptMap.put("notes", appt.getNotes());
            apptMap.put("emailDeliveryStatus", appt.getEmailDeliveryStatus());
            m.put("appointment", apptMap);
        } else {
            m.put("appointment", null);
        }

        return m;
    }
}
