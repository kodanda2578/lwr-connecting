package com.lwr.connecting.controller;

import com.lwr.connecting.entity.BetaAccessConfig;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.UserRepository;
import com.lwr.connecting.service.BetaAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping({"/beta", "/api/beta"})
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BetaAccessController {

    private final BetaAccessService betaAccessService;
    private final UserRepository userRepository;
    private final com.lwr.connecting.service.DatabaseBackupService databaseBackupService;
    private final com.lwr.connecting.service.EmailService emailService;
    private final com.lwr.connecting.service.ai.AiAssistantService aiAssistantService;
    private final com.lwr.connecting.service.BetaInvitationService betaInvitationService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getBetaStatus() {
        return ResponseEntity.ok(betaAccessService.getBetaStatus());
    }

    @PostMapping("/request-deletion")
    public ResponseEntity<Map<String, Object>> requestDataDeletion(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String reason = body.getOrDefault("reason", "Student / Guardian privacy request");
        Map<String, Object> result = betaAccessService.requestAccountDeletion(user.getId(), reason, "STUDENT");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/admin/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BetaAccessConfig> getAdminBetaConfig() {
        return ResponseEntity.ok(betaAccessService.getOrCreateConfig());
    }

    @PatchMapping("/admin/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BetaAccessConfig> updateAdminBetaConfig(
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        String adminEmail = authentication != null ? authentication.getName() : "ADMIN";
        return ResponseEntity.ok(betaAccessService.updateBetaConfig(updates, adminEmail));
    }

    @GetMapping("/admin/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminBetaAnalytics() {
        return ResponseEntity.ok(betaAccessService.getBetaAnalytics());
    }

    @GetMapping("/admin/deletion-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<Map<String, Object>>> getPendingDeletionRequests() {
        return ResponseEntity.ok(betaAccessService.getPendingDeletionRequests());
    }

    @PostMapping("/admin/deletion-requests/{userId}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> processAccountDeletion(
            @PathVariable Long userId,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {
        String adminEmail = authentication != null ? authentication.getName() : "ADMIN";
        String notes = body != null ? body.getOrDefault("notes", "Processed by Admin") : "Processed by Admin";
        return ResponseEntity.ok(betaAccessService.processAccountDeletion(userId, notes, adminEmail));
    }

    @GetMapping("/admin/health")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getConfigurationHealth() {
        return ResponseEntity.ok(betaAccessService.getConfigurationHealth());
    }

    @GetMapping("/admin/launch-overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getLaunchOverview() {
        return ResponseEntity.ok(betaAccessService.getLaunchOverview());
    }

    @PostMapping("/admin/health/test-smtp")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> testSmtpConnection(@RequestBody(required = false) Map<String, String> body) {
        String recipient = body != null ? body.get("recipient") : null;
        return ResponseEntity.ok(emailService.testSmtpConnection(recipient));
    }

    @PostMapping("/admin/health/test-gemini")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> testGeminiConnection() {
        return ResponseEntity.ok(aiAssistantService.testGeminiConnection());
    }

    @PostMapping("/admin/backup/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createDatabaseBackup() {
        return ResponseEntity.ok(databaseBackupService.createBackup());
    }

    @GetMapping("/admin/backup/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<Map<String, Object>>> listDatabaseBackups() {
        return ResponseEntity.ok(databaseBackupService.listBackups());
    }

    @PostMapping("/admin/backup/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> verifyDatabaseBackup(@RequestBody Map<String, String> body) {
        String fileName = body != null ? body.get("fileName") : null;
        return ResponseEntity.ok(databaseBackupService.verifyBackup(fileName));
    }

    @GetMapping("/validate-invite")
    public ResponseEntity<Map<String, Object>> validateInvitationCode(
            @RequestParam String code,
            @RequestParam(required = false) String email) {
        return ResponseEntity.ok(betaInvitationService.validateInvitation(code, email));
    }

    @GetMapping("/admin/invitations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<Map<String, Object>>> listInvitations(
            @RequestParam(required = false, defaultValue = "ALL") String status) {
        return ResponseEntity.ok(betaInvitationService.listInvitations(status));
    }

    @GetMapping("/admin/invitations/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getInvitationStats() {
        return ResponseEntity.ok(betaInvitationService.getInvitationStats());
    }

    @PostMapping("/admin/invitations/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.lwr.connecting.entity.BetaInvitation> createInvitation(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        String adminEmail = authentication != null ? authentication.getName() : "ADMIN";
        String studentName = body.get("studentName") != null ? body.get("studentName").toString() : null;
        String assignedEmail = body.get("assignedEmail") != null ? body.get("assignedEmail").toString() : null;
        String channel = body.get("channel") != null ? body.get("channel").toString() : "DIRECT";
        String notes = body.get("notes") != null ? body.get("notes").toString() : null;
        Integer expiryDays = body.get("expiryDays") != null ? Integer.parseInt(body.get("expiryDays").toString()) : 14;

        return ResponseEntity.ok(betaInvitationService.createInvitation(studentName, assignedEmail, channel, notes, expiryDays, adminEmail));
    }

    @PostMapping("/admin/invitations/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<com.lwr.connecting.entity.BetaInvitation>> batchGenerateInvitations(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        String adminEmail = authentication != null ? authentication.getName() : "ADMIN";
        int count = body.get("count") != null ? Integer.parseInt(body.get("count").toString()) : 10;
        String channel = body.get("channel") != null ? body.get("channel").toString() : "BATCH";
        String notes = body.get("notes") != null ? body.get("notes").toString() : null;
        Integer expiryDays = body.get("expiryDays") != null ? Integer.parseInt(body.get("expiryDays").toString()) : 14;

        return ResponseEntity.ok(betaInvitationService.batchGenerateInvitations(count, channel, expiryDays, notes, adminEmail));
    }

    @PostMapping("/admin/invitations/{id}/revoke")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> revokeInvitation(
            @PathVariable Long id,
            Authentication authentication) {
        String adminEmail = authentication != null ? authentication.getName() : "ADMIN";
        boolean revoked = betaInvitationService.revokeInvitation(id, adminEmail);
        return ResponseEntity.ok(Map.of("success", revoked, "message", "Invitation successfully revoked."));
    }
}

