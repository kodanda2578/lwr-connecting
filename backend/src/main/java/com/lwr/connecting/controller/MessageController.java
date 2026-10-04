package com.lwr.connecting.controller;

import com.lwr.connecting.entity.Message;
import com.lwr.connecting.entity.Notification;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.MessageRepository;
import com.lwr.connecting.repository.NotificationRepository;
import com.lwr.connecting.repository.UserRepository;
import com.lwr.connecting.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getConversation(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();

        User current = userRepository.findByEmail(authentication.getName()).orElseThrow();
        User adminUser = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN")))
                .findFirst().orElse(current);

        List<Message> list = messageRepository.findConversation(current.getId(), adminUser.getId());
        List<Map<String, Object>> result = new ArrayList<>();

        for (Message m : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("senderId", m.getSender().getId());
            map.put("senderName", m.getSender().getFullName());
            map.put("receiverId", m.getReceiver().getId());
            map.put("messageText", m.getMessageText());
            map.put("isRead", m.getIsRead());
            map.put("timestamp", m.getCreatedAt().toString());
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> body, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();

        User sender = userRepository.findByEmail(authentication.getName()).orElseThrow();
        boolean isSenderAdmin = sender.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));

        User receiver;
        if (isSenderAdmin) {
            Long studentId = Long.parseLong(body.getOrDefault("studentId", "1"));
            receiver = userRepository.findById(studentId).orElse(sender);
        } else {
            receiver = userRepository.findAll().stream()
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN")))
                    .findFirst().orElse(sender);
        }

        String text = body.getOrDefault("messageText", "");

        Message msg = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .messageText(text)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        Message saved = messageRepository.save(msg);

        // If Ramesh/Admin replies to student -> Create in-app notification & send email
        if (isSenderAdmin && !receiver.getId().equals(sender.getId())) {
            Notification studentNotif = Notification.builder()
                    .user(receiver)
                    .title("💬 Ramesh Replied to your Message")
                    .message(text)
                    .link("/messages")
                    .type("MENTOR_REPLY")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(studentNotif);

            emailService.sendMentorReplyEmail(
                    receiver.getEmail(),
                    receiver.getFullName(),
                    text,
                    "MSG_REPLY_" + saved.getId()
            );
        }

        return ResponseEntity.status(201).body(saved);
    }
}
