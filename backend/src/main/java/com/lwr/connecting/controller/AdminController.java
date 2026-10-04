package com.lwr.connecting.controller;

import com.lwr.connecting.entity.College;
import com.lwr.connecting.entity.Role;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.CollegeRepository;
import com.lwr.connecting.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboardMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalStudents", userRepository.count());
        metrics.put("totalColleges", collegeRepository.count());
        metrics.put("status", "ACTIVE");
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getAllStudents() {
        List<Map<String, Object>> students = userRepository.findAll().stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("fullName", user.getFullName());
            map.put("email", user.getEmail());
            map.put("mobileNumber", user.getMobileNumber());
            map.put("accountStatus", user.getAccountStatus());
            map.put("emailVerified", user.getEmailVerified());
            map.put("mobileVerified", user.getMobileVerified());
            map.put("createdAt", user.getCreatedAt());
            map.put("roles", user.getRoles().stream().map(Role::getName).toList());
            if (user.getProfile() != null) {
                Map<String, Object> prof = new HashMap<>();
                prof.put("collegeName", user.getProfile().getCollegeName());
                prof.put("board", user.getProfile().getBoard());
                prof.put("targetExam", user.getProfile().getTargetExam());
                prof.put("targetBranch", user.getProfile().getTargetBranch());
                map.put("profile", prof);
            }
            return map;
        }).toList();

        return ResponseEntity.ok(students);
    }

    @PostMapping("/colleges")
    public ResponseEntity<College> createCollege(@Valid @RequestBody College college) {
        if (college.getLastUpdated() == null) {
            college.setLastUpdated(LocalDate.now());
        }
        College saved = collegeRepository.save(college);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/announcements/send")
    public ResponseEntity<Map<String, Object>> sendAnnouncementNotification(@RequestBody Map<String, Object> body) {
        String title = body.getOrDefault("title", "Important Announcement").toString();
        String message = body.getOrDefault("message", "").toString();
        String targetAudience = body.getOrDefault("targetAudience", "ALL").toString();
        Boolean sendEmail = (Boolean) body.getOrDefault("sendEmail", true);
        Boolean sendInApp = (Boolean) body.getOrDefault("sendInApp", true);

        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("title", title);
        result.put("targetAudience", targetAudience);
        result.put("sendEmail", sendEmail);
        result.put("sendInApp", sendInApp);
        result.put("recipientsCount", userRepository.count());
        return ResponseEntity.ok(result);
    }
}
