package com.lwr.connecting.service.impl;

import com.lwr.connecting.entity.BetaAccessConfig;
import com.lwr.connecting.entity.BetaInvitation;
import com.lwr.connecting.repository.BetaAccessConfigRepository;
import com.lwr.connecting.repository.BetaInvitationRepository;
import com.lwr.connecting.repository.UserRepository;
import com.lwr.connecting.service.BetaInvitationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BetaInvitationServiceImpl implements BetaInvitationService {

    private static final Logger logger = LoggerFactory.getLogger(BetaInvitationServiceImpl.class);
    private static final String CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final BetaInvitationRepository betaInvitationRepository;
    private final BetaAccessConfigRepository betaAccessConfigRepository;
    private final UserRepository userRepository;

    private String generateUniqueCode() {
        for (int i = 0; i < 50; i++) {
            StringBuilder sb = new StringBuilder("LWR-W1-");
            for (int c = 0; c < 6; c++) {
                sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            }
            String code = sb.toString();
            if (!betaInvitationRepository.existsByCodeIgnoreCase(code)) {
                return code;
            }
        }
        return "LWR-W1-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    @Override
    @Transactional
    public BetaInvitation createInvitation(String studentName, String assignedEmail, String channel, String notes, Integer expiryDays, String issuedBy) {
        int days = (expiryDays != null && expiryDays > 0) ? expiryDays : 14;
        String cleanChannel = (channel != null && !channel.isBlank()) ? channel.trim().toUpperCase() : "DIRECT";

        BetaInvitation invitation = BetaInvitation.builder()
                .code(generateUniqueCode())
                .studentName(studentName != null ? studentName.trim() : null)
                .assignedEmail(assignedEmail != null ? assignedEmail.trim().toLowerCase() : null)
                .channel(cleanChannel)
                .status("PENDING")
                .issuedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(days))
                .issuedBy(issuedBy != null ? issuedBy : "ADMIN")
                .notes(notes)
                .build();

        BetaInvitation saved = betaInvitationRepository.save(invitation);
        logger.info("[INVITATION ISSUED] Code {} created for {} via channel {}", saved.getCode(), saved.getAssignedEmail(), saved.getChannel());
        return saved;
    }

    @Override
    @Transactional
    public List<BetaInvitation> batchGenerateInvitations(int count, String channel, Integer expiryDays, String notes, String issuedBy) {
        int target = Math.min(Math.max(count, 1), 50);
        int days = (expiryDays != null && expiryDays > 0) ? expiryDays : 14;
        String cleanChannel = (channel != null && !channel.isBlank()) ? channel.trim().toUpperCase() : "BATCH";

        List<BetaInvitation> created = new ArrayList<>();
        for (int i = 0; i < target; i++) {
            BetaInvitation invitation = BetaInvitation.builder()
                    .code(generateUniqueCode())
                    .channel(cleanChannel)
                    .status("PENDING")
                    .issuedAt(LocalDateTime.now())
                    .expiresAt(LocalDateTime.now().plusDays(days))
                    .issuedBy(issuedBy != null ? issuedBy : "ADMIN")
                    .notes(notes != null ? notes + " (Batch #" + (i + 1) + ")" : "Batch Generated #" + (i + 1))
                    .build();
            created.add(betaInvitationRepository.save(invitation));
        }

        logger.info("[INVITATION BATCH] Generated {} invitation codes for channel {}", created.size(), cleanChannel);
        return created;
    }

    @Override
    @Transactional
    public Map<String, Object> validateInvitation(String code, String email) {
        Map<String, Object> result = new LinkedHashMap<>();

        if (code == null || code.isBlank()) {
            result.put("valid", false);
            result.put("reason", "Invitation code is required.");
            return result;
        }

        String cleanCode = code.trim().toUpperCase();
        Optional<BetaInvitation> opt = betaInvitationRepository.findByCodeIgnoreCase(cleanCode);

        if (opt.isEmpty()) {
            result.put("valid", false);
            result.put("reason", "Invalid invitation code. Please check for typos.");
            return result;
        }

        BetaInvitation inv = opt.get();
        LocalDateTime now = LocalDateTime.now();

        if ("ACCEPTED".equalsIgnoreCase(inv.getStatus())) {
            result.put("valid", false);
            result.put("reason", "This invitation code has already been used.");
            return result;
        }

        if ("REVOKED".equalsIgnoreCase(inv.getStatus())) {
            result.put("valid", false);
            result.put("reason", "This invitation code has been revoked by platform administrators.");
            return result;
        }

        if (inv.getExpiresAt().isBefore(now)) {
            inv.setStatus("EXPIRED");
            betaInvitationRepository.save(inv);
            result.put("valid", false);
            result.put("reason", "This invitation code expired on " + inv.getExpiresAt().toLocalDate() + ".");
            return result;
        }

        if (inv.getAssignedEmail() != null && !inv.getAssignedEmail().isBlank()) {
            if (email == null || !inv.getAssignedEmail().equalsIgnoreCase(email.trim())) {
                result.put("valid", false);
                result.put("reason", "This invitation code is assigned specifically to " + maskEmail(inv.getAssignedEmail()) + ".");
                return result;
            }
        }

        result.put("valid", true);
        result.put("code", inv.getCode());
        result.put("channel", inv.getChannel());
        result.put("studentName", inv.getStudentName());
        result.put("expiresAt", inv.getExpiresAt());
        result.put("message", "Valid Wave 1 Beta invitation.");
        return result;
    }

    @Override
    @Transactional
    public boolean redeemInvitation(String code, Long userId, String userEmail) {
        if (code == null || code.isBlank()) return false;
        String cleanCode = code.trim().toUpperCase();

        Optional<BetaInvitation> opt = betaInvitationRepository.findByCodeIgnoreCase(cleanCode);
        if (opt.isEmpty()) return false;

        BetaInvitation inv = opt.get();
        if (!"PENDING".equalsIgnoreCase(inv.getStatus())) {
            return false;
        }

        inv.setStatus("ACCEPTED");
        inv.setAcceptedAt(LocalDateTime.now());
        inv.setAcceptedByUserId(userId);
        inv.setAcceptedByEmail(userEmail != null ? userEmail.trim().toLowerCase() : null);

        betaInvitationRepository.save(inv);
        logger.info("[INVITATION REDEEMED] Code {} redeemed by student #{} ({})", cleanCode, userId, userEmail);
        return true;
    }

    @Override
    @Transactional
    public boolean revokeInvitation(Long id, String adminEmail) {
        Optional<BetaInvitation> opt = betaInvitationRepository.findById(id);
        if (opt.isEmpty()) return false;

        BetaInvitation inv = opt.get();
        if ("ACCEPTED".equalsIgnoreCase(inv.getStatus())) {
            throw new IllegalStateException("Cannot revoke an invitation that has already been accepted.");
        }

        inv.setStatus("REVOKED");
        inv.setNotes((inv.getNotes() != null ? inv.getNotes() + " | " : "") + "Revoked by " + (adminEmail != null ? adminEmail : "ADMIN") + " on " + LocalDateTime.now());
        betaInvitationRepository.save(inv);
        logger.info("[INVITATION REVOKED] Invitation #{} ({}) revoked by {}", id, inv.getCode(), adminEmail);
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getInvitationStats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        long totalIssued = betaInvitationRepository.count();
        long accepted = betaInvitationRepository.countByStatus("ACCEPTED");
        long pending = betaInvitationRepository.countByStatus("PENDING");
        long expired = betaInvitationRepository.countByStatus("EXPIRED");
        long revoked = betaInvitationRepository.countByStatus("REVOKED");

        BetaAccessConfig config = betaAccessConfigRepository.findTopByOrderByIdAsc().orElse(null);
        int limit = (config != null && config.getRegistrationLimit() != null) ? config.getRegistrationLimit() : 50;
        long registeredStudents = userRepository.countByRoles_Name("ROLE_STUDENT");
        long remainingCapacity = Math.max(0, limit - registeredStudents);

        stats.put("totalIssued", totalIssued);
        stats.put("accepted", accepted);
        stats.put("pending", pending);
        stats.put("expired", expired);
        stats.put("revoked", revoked);
        stats.put("registeredStudents", registeredStudents);
        stats.put("registrationLimit", limit);
        stats.put("remainingCapacity", remainingCapacity);
        stats.put("inviteOnlyMode", config != null ? Boolean.TRUE.equals(config.getInviteOnlyMode()) : true);

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listInvitations(String statusFilter) {
        List<BetaInvitation> list;
        if (statusFilter != null && !statusFilter.isBlank() && !"ALL".equalsIgnoreCase(statusFilter)) {
            list = betaInvitationRepository.findByStatusOrderByIssuedAtDesc(statusFilter.trim().toUpperCase());
        } else {
            list = betaInvitationRepository.findAllByOrderByIssuedAtDesc();
        }

        List<Map<String, Object>> mapped = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (BetaInvitation inv : list) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", inv.getId());
            item.put("code", inv.getCode());
            item.put("studentName", inv.getStudentName());
            item.put("assignedEmail", inv.getAssignedEmail());
            item.put("channel", inv.getChannel());

            String status = inv.getStatus();
            if ("PENDING".equals(status) && inv.getExpiresAt().isBefore(now)) {
                status = "EXPIRED";
            }
            item.put("status", status);
            item.put("issuedAt", inv.getIssuedAt());
            item.put("expiresAt", inv.getExpiresAt());
            item.put("acceptedAt", inv.getAcceptedAt());
            item.put("acceptedByUserId", inv.getAcceptedByUserId());
            item.put("acceptedByEmail", inv.getAcceptedByEmail() != null ? maskEmail(inv.getAcceptedByEmail()) : null);
            item.put("issuedBy", inv.getIssuedBy());
            item.put("notes", inv.getNotes());
            mapped.add(item);
        }

        return mapped;
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 2) {
            return name.charAt(0) + "***@" + domain;
        }
        return name.charAt(0) + "***" + name.charAt(name.length() - 1) + "@" + domain;
    }
}

