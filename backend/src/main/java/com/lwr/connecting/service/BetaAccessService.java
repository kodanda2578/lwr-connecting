package com.lwr.connecting.service;

import com.lwr.connecting.entity.BetaAccessConfig;

import java.util.List;
import java.util.Map;

public interface BetaAccessService {
    Map<String, Object> getBetaStatus();
    void assertBetaRegistrationAllowed();
    BetaAccessConfig getOrCreateConfig();
    BetaAccessConfig updateBetaConfig(Map<String, Object> updates, String adminEmail);
    Map<String, Object> getBetaAnalytics();
    Map<String, Object> requestAccountDeletion(Long userId, String reason, String requesterRole);
    List<Map<String, Object>> getPendingDeletionRequests();
    Map<String, Object> processAccountDeletion(Long userId, String adminNotes, String processedBy);
    void recordCollegeSearch();
    void recordPredictorUsage();
    void recordFailedRegistration();
    Map<String, Object> getConfigurationHealth();
    Map<String, Object> getLaunchOverview();
}

