package com.lwr.connecting.controller;

import com.lwr.connecting.entity.MentorRequest;
import com.lwr.connecting.entity.Notification;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.MentorRequestRepository;
import com.lwr.connecting.repository.NotificationRepository;
import com.lwr.connecting.repository.UserRepository;
import com.lwr.connecting.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/mentor-requests")
public class MentorRequestController {

    @Autowired
    private MentorRequestRepository mentorRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping
    public ResponseEntity<?> createMentorRequest(@RequestBody Map<String, Object> body, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User student = userRepository.findByEmail(authentication.getName()).orElseThrow();
        String category = body.getOrDefault("category", "General Doubt").toString();
        String studentMessage = body.getOrDefault("studentMessage", "").toString();
        String exam = body.getOrDefault("exam", "AP_EAPCET").toString();
        String rank = body.getOrDefault("rank", "").toString();
        String branch = body.getOrDefault("targetBranch", "CSE").toString();
        String location = body.getOrDefault("preferredLocation", "Visakhapatnam").toString();

        // AI Summary Generation
        String aiSummary = String.format("Student %s has an exam context of %s%s, seeking guidance for %s in %s. Latest Question: \"%s\"",
                student.getFullName(),
                exam,
                (rank != null && !rank.isBlank() ? " (Rank ~" + rank + ")" : ""),
                branch,
                location,
                studentMessage
        );

        MentorRequest request = MentorRequest.builder()
                .student(student)
                .category(category)
                .studentMessage(studentMessage)
                .aiConversationSummary(aiSummary)
                .priority("HIGH")
                .status("OPEN")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        MentorRequest saved = mentorRequestRepository.save(request);

        // 1. Create In-App Admin Notification
        User adminUser = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN")))
                .findFirst().orElse(null);

        if (adminUser != null) {
            Notification adminNotif = Notification.builder()
                    .user(adminUser)
                    .title("🔔 New Student Guidance Request")
                    .message("New request from " + student.getFullName() + " for category " + category)
                    .link("/admin")
                    .type("MENTOR_REQUEST")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(adminNotif);
        }

        // 2. Trigger Ramesh Notification Email
        String idempotencyKey = "MENTOR_REQ_" + saved.getId();
        emailService.sendMentorNotificationEmail(
                null,
                student.getFullName(),
                category,
                studentMessage,
                aiSummary,
                saved.getId(),
                idempotencyKey
        );

        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("status", saved.getStatus());
        response.put("category", saved.getCategory());
        response.put("aiSummary", saved.getAiConversationSummary());
        response.put("createdAt", saved.getCreatedAt());
        response.put("disclaimer", "AI-generated summary — verify before relying on it.");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getMentorRequests(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));

        List<MentorRequest> list;
        if (isAdmin) {
            list = mentorRequestRepository.findAll();
        } else {
            list = mentorRequestRepository.findByStudentId(user.getId());
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (MentorRequest r : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("studentId", r.getStudent().getId());
            map.put("studentName", r.getStudent().getFullName());
            map.put("studentEmail", r.getStudent().getEmail());
            map.put("category", r.getCategory());
            map.put("studentMessage", r.getStudentMessage());
            map.put("aiSummary", r.getAiConversationSummary());
            map.put("priority", r.getPriority());
            map.put("status", r.getStatus());
            map.put("createdAt", r.getCreatedAt());
            map.put("updatedAt", r.getUpdatedAt());
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateRequestStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        MentorRequest request = mentorRequestRepository.findById(id).orElseThrow();
        String newStatus = body.getOrDefault("status", request.getStatus());
        request.setStatus(newStatus);
        request.setUpdatedAt(LocalDateTime.now());
        if ("RESOLVED".equals(newStatus)) {
            request.setResolvedAt(LocalDateTime.now());
        }

        mentorRequestRepository.save(request);

        // If admin replies directly
        if (body.containsKey("replyText")) {
            String replyText = body.get("replyText");
            
            // In-app student notification
            Notification studentNotif = Notification.builder()
                    .user(request.getStudent())
                    .title("💬 Ramesh Replied to your Doubt")
                    .message(replyText)
                    .link("/messages")
                    .type("MENTOR_REPLY")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(studentNotif);

            // Trigger Email Notification
            emailService.sendMentorReplyEmail(
                    request.getStudent().getEmail(),
                    request.getStudent().getFullName(),
                    replyText,
                    "REPLY_" + request.getId() + "_" + System.currentTimeMillis()
            );
        }

        return ResponseEntity.ok(request);
    }
}
