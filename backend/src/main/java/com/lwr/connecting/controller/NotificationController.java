package com.lwr.connecting.controller;

import com.lwr.connecting.entity.EmailPreference;
import com.lwr.connecting.entity.Notification;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.EmailPreferenceRepository;
import com.lwr.connecting.repository.NotificationRepository;
import com.lwr.connecting.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailPreferenceRepository emailPreferenceRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getUserNotifications(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @PostMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        Notification notification = notificationRepository.findById(id).orElseThrow();
        notification.setIsRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/email-preferences")
    public ResponseEntity<EmailPreference> getEmailPreferences(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        EmailPreference pref = emailPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> emailPreferenceRepository.save(EmailPreference.builder().user(user).build()));
        return ResponseEntity.ok(pref);
    }

    @PutMapping("/email-preferences")
    public ResponseEntity<EmailPreference> updateEmailPreferences(@RequestBody Map<String, Boolean> body, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        EmailPreference pref = emailPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> EmailPreference.builder().user(user).build());

        if (body.containsKey("newMockTests")) pref.setNewMockTests(body.get("newMockTests"));
        if (body.containsKey("newStudyMaterials")) pref.setNewStudyMaterials(body.get("newStudyMaterials"));
        if (body.containsKey("newVideos")) pref.setNewVideos(body.get("newVideos"));
        if (body.containsKey("importantAnnouncements")) pref.setImportantAnnouncements(body.get("importantAnnouncements"));
        if (body.containsKey("mentorReplies")) pref.setMentorReplies(body.get("mentorReplies"));
        if (body.containsKey("doubtSessionUpdates")) pref.setDoubtSessionUpdates(body.get("doubtSessionUpdates"));

        return ResponseEntity.ok(emailPreferenceRepository.save(pref));
    }
}
