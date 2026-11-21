package com.lwr.connecting.service;

import com.lwr.connecting.entity.BetaInvitation;

import java.util.List;
import java.util.Map;

public interface BetaInvitationService {
    BetaInvitation createInvitation(String studentName, String assignedEmail, String channel, String notes, Integer expiryDays, String issuedBy);
    List<BetaInvitation> batchGenerateInvitations(int count, String channel, Integer expiryDays, String notes, String issuedBy);
    Map<String, Object> validateInvitation(String code, String email);
    boolean redeemInvitation(String code, Long userId, String userEmail);
    boolean revokeInvitation(Long id, String adminEmail);
    Map<String, Object> getInvitationStats();
    List<Map<String, Object>> listInvitations(String statusFilter);
}

