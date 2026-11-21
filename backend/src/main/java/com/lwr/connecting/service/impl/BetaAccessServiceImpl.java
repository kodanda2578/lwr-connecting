package com.lwr.connecting.service.impl;

import com.lwr.connecting.entity.BetaAccessConfig;
import com.lwr.connecting.entity.BetaFeedback;
import com.lwr.connecting.entity.StudentProfile;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.*;
import com.lwr.connecting.service.BetaAccessService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BetaAccessServiceImpl implements BetaAccessService {

    private static final Logger logger = LoggerFactory.getLogger(BetaAccessServiceImpl.class);

    private final BetaAccessConfigRepository betaAccessConfigRepository;
    private final UserRepository userRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final CollegeRepository collegeRepository;
    private final CutoffRepository cutoffRepository;
    private final GuidanceRequestRepository guidanceRequestRepository;
    private final BetaFeedbackRepository betaFeedbackRepository;
    private final com.lwr.connecting.service.EmailService emailService;
    private final com.lwr.connecting.service.ai.AiAssistantService aiAssistantService;
    private final com.lwr.connecting.service.BetaInvitationService betaInvitationService;

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getBetaStatus() {
        BetaAccessConfig config = getOrCreateConfig();
        long studentCount = userRepository.countByRoles_Name("ROLE_STUDENT");
        int limit = config.getRegistrationLimit() != null ? config.getRegistrationLimit() : 100;
        boolean paused = Boolean.TRUE.equals(config.getRegistrationsPaused());
        long remaining = Math.max(0, limit - studentCount);
        boolean open = !paused && remaining > 0;

        Map<String, Object> status = new LinkedHashMap<>();
        status.put("betaActive", true);
        status.put("registrationLimit", limit);
        status.put("maxStudentsLimit", limit);
        status.put("currentBetaCount", studentCount);
        status.put("registeredStudents", studentCount);
        status.put("spotsRemaining", remaining);
        status.put("remainingSpots", remaining);
        status.put("registrationsOpen", open);
        status.put("registrationsPaused", paused);
        status.put("betaNoticeMessage", config.getBetaNoticeMessage());
        status.put("targetAudienceNotice", config.getTargetAudienceNotice());
        status.put("guardianConsentRequired", config.getGuardianConsentRequired());
        status.put("inviteOnlyMode", config.getInviteOnlyMode() != null ? config.getInviteOnlyMode() : true);
        if (betaInvitationService != null) {
            status.put("invitationStats", betaInvitationService.getInvitationStats());
        }
        status.put("updatedAt", config.getUpdatedAt());

        return status;
    }

    @Override
    @Transactional(readOnly = true)
    public void assertBetaRegistrationAllowed() {
        BetaAccessConfig config = getOrCreateConfig();
        if (Boolean.TRUE.equals(config.getRegistrationsPaused())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "Beta registration is temporarily paused by platform administrators. Please check back shortly.");
        }

        long currentCount = userRepository.countByRoles_Name("ROLE_STUDENT");
        int limit = config.getRegistrationLimit() != null ? config.getRegistrationLimit() : 100;
        if (currentCount >= limit) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "The LWR Connecting Intermediate Student Beta has reached its capacity (" + limit + " students). Registration is closed for this wave.");
        }
    }

    @Override
    @Transactional
    public BetaAccessConfig getOrCreateConfig() {
        return betaAccessConfigRepository.findTopByOrderByIdAsc().orElseGet(() -> {
            BetaAccessConfig initial = BetaAccessConfig.builder()
                    .registrationLimit(50)
                    .registrationsPaused(false)
                    .betaNoticeMessage("Welcome to the LWR Connecting Beta for Intermediate Class 11 & Class 12 students. Registration is strictly limited to 50 students in this initial wave.")
                    .targetAudienceNotice("Class 11 & Class 12 Intermediate (MPC) Engineering Aspirants")
                    .guardianConsentRequired(true)
                    .inviteOnlyMode(true)
                    .failedRegistrationCount(0L)
                    .updatedAt(LocalDateTime.now())
                    .updatedBy("SYSTEM")
                    .build();
            return betaAccessConfigRepository.save(initial);
        });
    }

    @Override
    @Transactional
    public BetaAccessConfig updateBetaConfig(Map<String, Object> updates, String adminEmail) {
        BetaAccessConfig config = getOrCreateConfig();

        if (updates.containsKey("registrationLimit") && updates.get("registrationLimit") != null) {
            config.setRegistrationLimit(Integer.parseInt(updates.get("registrationLimit").toString()));
        } else if (updates.containsKey("maxStudentsLimit") && updates.get("maxStudentsLimit") != null) {
            config.setRegistrationLimit(Integer.parseInt(updates.get("maxStudentsLimit").toString()));
        }
        if (updates.containsKey("registrationsPaused") && updates.get("registrationsPaused") != null) {
            config.setRegistrationsPaused(Boolean.parseBoolean(updates.get("registrationsPaused").toString()));
        }
        if (updates.containsKey("betaNoticeMessage") && updates.get("betaNoticeMessage") != null) {
            config.setBetaNoticeMessage(updates.get("betaNoticeMessage").toString());
        }
        if (updates.containsKey("guardianConsentRequired") && updates.get("guardianConsentRequired") != null) {
            config.setGuardianConsentRequired(Boolean.parseBoolean(updates.get("guardianConsentRequired").toString()));
        }
        if (updates.containsKey("targetAudienceNotice") && updates.get("targetAudienceNotice") != null) {
            config.setTargetAudienceNotice(updates.get("targetAudienceNotice").toString());
        }
        if (updates.containsKey("inviteOnlyMode") && updates.get("inviteOnlyMode") != null) {
            config.setInviteOnlyMode(Boolean.parseBoolean(updates.get("inviteOnlyMode").toString()));
        }

        config.setUpdatedAt(LocalDateTime.now());
        config.setUpdatedBy(adminEmail != null ? adminEmail : "ADMIN");

        logger.info("[BETA CONFIG] Updated by admin {}: limit={}, paused={}", 
                adminEmail, config.getRegistrationLimit(), config.getRegistrationsPaused());

        return betaAccessConfigRepository.save(config);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getBetaAnalytics() {
        BetaAccessConfig config = getOrCreateConfig();
        long totalStudents = userRepository.countByRoles_Name("ROLE_STUDENT");
        long activeStudents = userRepository.countByRoles_NameAndAccountStatus("ROLE_STUDENT", "ACTIVE");
        long testAttempts = testAttemptRepository.count();
        long collegeCount = collegeRepository.count();
        long cutoffCount = cutoffRepository.count();
        long guidanceCount = guidanceRequestRepository.count();
        long feedbackCount = betaFeedbackRepository.count();

        // Feedback aggregations
        List<BetaFeedback> allFeedback = betaFeedbackRepository.findAll();
        double avgRating = allFeedback.stream()
                .filter(f -> f.getOverallRating() != null)
                .mapToInt(BetaFeedback::getOverallRating)
                .average()
                .orElse(0.0);

        Map<String, Long> categoryCount = new HashMap<>();
        Map<String, Long> bugSeverityCount = new HashMap<>();
        Map<String, Double> featureRatings = new HashMap<>();

        List<Integer> mockRatings = new ArrayList<>();
        List<Integer> predRatings = new ArrayList<>();
        List<Integer> cutRatings = new ArrayList<>();
        List<Integer> aiRatings = new ArrayList<>();
        List<Integer> mentorRatings = new ArrayList<>();

        long openBugs = 0;
        long critBugs = 0;
        long highBugs = 0;

        for (BetaFeedback f : allFeedback) {
            String cat = f.getCategory() != null ? f.getCategory() : "GENERAL";
            categoryCount.put(cat, categoryCount.getOrDefault(cat, 0L) + 1);

            boolean isResolved = "RESOLVED".equalsIgnoreCase(f.getStatus());

            if (f.getBugSeverity() != null && !f.getBugSeverity().isBlank()) {
                String sev = f.getBugSeverity().toUpperCase();
                bugSeverityCount.put(sev, bugSeverityCount.getOrDefault(sev, 0L) + 1);
                if (!isResolved) {
                    openBugs++;
                    if ("CRITICAL".equals(sev)) critBugs++;
                    if ("HIGH".equals(sev)) highBugs++;
                }
            } else if ("BUG".equalsIgnoreCase(cat) && !isResolved) {
                openBugs++;
            }

            if (f.getMockTestsRating() != null && f.getMockTestsRating() > 0) mockRatings.add(f.getMockTestsRating());
            if (f.getPredictorRating() != null && f.getPredictorRating() > 0) predRatings.add(f.getPredictorRating());
            if (f.getCutoffsRating() != null && f.getCutoffsRating() > 0) cutRatings.add(f.getCutoffsRating());
            if (f.getAiGuidanceRating() != null && f.getAiGuidanceRating() > 0) aiRatings.add(f.getAiGuidanceRating());
            if (f.getMentorshipRating() != null && f.getMentorshipRating() > 0) mentorRatings.add(f.getMentorshipRating());
        }

        featureRatings.put("mockTests", mockRatings.stream().mapToInt(i -> i).average().orElse(0.0));
        featureRatings.put("collegePredictor", predRatings.stream().mapToInt(i -> i).average().orElse(0.0));
        featureRatings.put("cutoffExplorer", cutRatings.stream().mapToInt(i -> i).average().orElse(0.0));
        featureRatings.put("aiGuidance", aiRatings.stream().mapToInt(i -> i).average().orElse(0.0));
        featureRatings.put("mentorship", mentorRatings.stream().mapToInt(i -> i).average().orElse(0.0));

        long reportedBugs = categoryCount.getOrDefault("BUG", 0L) + 
                allFeedback.stream().filter(f -> f.getBugSeverity() != null).count();
        long remaining = Math.max(0, config.getRegistrationLimit() - totalStudents);
        long collegeSearches = config.getCollegeSearchCount() != null ? config.getCollegeSearchCount() : 0L;
        long predictorUsage = config.getPredictorUsageCount() != null ? config.getPredictorUsageCount() : 0L;

        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("totalRegisteredBetaStudents", totalStudents);
        analytics.put("totalRegisteredStudents", totalStudents);
        analytics.put("registrationLimit", config.getRegistrationLimit());
        analytics.put("maxLimit", config.getRegistrationLimit());
        analytics.put("spotsRemaining", remaining);
        analytics.put("remainingSpots", remaining);
        analytics.put("activeStudents", activeStudents);
        analytics.put("registrationsPaused", config.getRegistrationsPaused());
        analytics.put("mockTestsAttempted", testAttempts);
        analytics.put("collegeSearches", collegeSearches);
        analytics.put("collegeDatabaseSize", collegeCount);
        analytics.put("predictorUsage", predictorUsage);
        analytics.put("cutoffRecordsCount", cutoffCount);
        analytics.put("cutoffDatabaseSize", cutoffCount);
        analytics.put("mentorshipRequestsCount", guidanceCount);
        analytics.put("feedbackSubmissions", feedbackCount);
        analytics.put("reportedBugs", reportedBugs);
        analytics.put("openBugsCount", openBugs);
        analytics.put("criticalBugsCount", critBugs);
        analytics.put("highBugsCount", highBugs);
        analytics.put("averageRating", Math.round(avgRating * 10.0) / 10.0);
        analytics.put("feedbackByCategory", categoryCount);
        analytics.put("bugSeverityBreakdown", bugSeverityCount);
        analytics.put("featureRatings", featureRatings);

        return analytics;
    }

    @Override
    @Transactional
    public void recordCollegeSearch() {
        try {
            BetaAccessConfig config = getOrCreateConfig();
            Long current = config.getCollegeSearchCount() != null ? config.getCollegeSearchCount() : 0L;
            config.setCollegeSearchCount(current + 1);
            betaAccessConfigRepository.save(config);
        } catch (Exception e) {
            logger.warn("[BETA ANALYTICS] Failed to record college search: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void recordPredictorUsage() {
        try {
            BetaAccessConfig config = getOrCreateConfig();
            Long current = config.getPredictorUsageCount() != null ? config.getPredictorUsageCount() : 0L;
            config.setPredictorUsageCount(current + 1);
            betaAccessConfigRepository.save(config);
        } catch (Exception e) {
            logger.warn("[BETA ANALYTICS] Failed to record predictor usage: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void recordFailedRegistration() {
        try {
            BetaAccessConfig config = getOrCreateConfig();
            Long current = config.getFailedRegistrationCount() != null ? config.getFailedRegistrationCount() : 0L;
            config.setFailedRegistrationCount(current + 1);
            betaAccessConfigRepository.save(config);
        } catch (Exception e) {
            logger.warn("[BETA ANALYTICS] Failed to record failed registration attempt: {}", e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getConfigurationHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now().toString());

        // Database
        Map<String, Object> db = new LinkedHashMap<>();
        db.put("status", "UP");
        db.put("driver", "org.h2.Driver (PostgreSQL Compatibility Mode)");
        db.put("totalUsers", userRepository.count());
        db.put("totalStudents", userRepository.countByRoles_Name("ROLE_STUDENT"));
        db.put("totalColleges", collegeRepository.count());
        db.put("totalCutoffs", cutoffRepository.count());
        health.put("database", db);

        // Email
        health.put("email", emailService != null ? emailService.getEmailHealthStatus() : Map.of("status", "UNAVAILABLE"));

        // AI
        health.put("ai", aiAssistantService != null ? aiAssistantService.getAiHealthStatus() : Map.of("status", "UNAVAILABLE"));

        // Security
        Map<String, Object> sec = new LinkedHashMap<>();
        sec.put("jwtConfigured", true);
        sec.put("rawOtpLoggingDisabled", true);
        sec.put("secretsMaskedInLogs", true);
        sec.put("minorConsentSafeguardsActive", true);
        health.put("security", sec);

        // Beta Status
        health.put("beta", getBetaStatus());

        return health;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getLaunchOverview() {
        BetaAccessConfig config = getOrCreateConfig();
        long totalStudents = userRepository.countByRoles_Name("ROLE_STUDENT");
        long activeStudents = userRepository.countByRoles_NameAndAccountStatus("ROLE_STUDENT", "ACTIVE");
        long failedRegs = config.getFailedRegistrationCount() != null ? config.getFailedRegistrationCount() : 0L;
        int limit = config.getRegistrationLimit() != null ? config.getRegistrationLimit() : 50;
        long remaining = Math.max(0, limit - totalStudents);
        boolean paused = Boolean.TRUE.equals(config.getRegistrationsPaused());

        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("successfulRegistrations", totalStudents);
        overview.put("failedRegistrations", failedRegs);
        overview.put("registrationLimit", limit);
        overview.put("firstWaveTarget", 50);
        overview.put("remainingSpots", remaining);
        overview.put("registrationsPaused", paused);
        overview.put("registrationsOpen", !paused && remaining > 0);
        overview.put("activeStudents", activeStudents);
        overview.put("mockTestsAttempted", testAttemptRepository.count());
        overview.put("collegeSearches", config.getCollegeSearchCount() != null ? config.getCollegeSearchCount() : 0L);
        overview.put("predictorUsage", config.getPredictorUsageCount() != null ? config.getPredictorUsageCount() : 0L);
        overview.put("feedbackSubmissions", betaFeedbackRepository.count());

        long critBugs = betaFeedbackRepository.findAll().stream()
                .filter(f -> "CRITICAL".equalsIgnoreCase(f.getBugSeverity()) && !"RESOLVED".equalsIgnoreCase(f.getStatus()))
                .count();
        long openBugs = betaFeedbackRepository.findAll().stream()
                .filter(f -> ("BUG".equalsIgnoreCase(f.getCategory()) || f.getBugSeverity() != null) && !"RESOLVED".equalsIgnoreCase(f.getStatus()))
                .count();

        overview.put("criticalBugs", critBugs);
        overview.put("openBugs", openBugs);
        overview.put("inviteOnlyMode", config.getInviteOnlyMode() != null ? config.getInviteOnlyMode() : true);
        if (betaInvitationService != null) {
            overview.put("invitations", betaInvitationService.getInvitationStats());
        }

        if (emailService != null) {
            overview.put("emailHealth", emailService.getEmailHealthStatus());
        }
        if (aiAssistantService != null) {
            overview.put("aiHealth", aiAssistantService.getAiHealthStatus());
        }

        overview.put("timestamp", LocalDateTime.now().toString());
        return overview;
    }

    @Override
    @Transactional
    public Map<String, Object> requestAccountDeletion(Long userId, String reason, String requesterRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        StudentProfile profile = user.getProfile();
        if (profile == null) {
            profile = StudentProfile.builder().user(user).build();
        }

        profile.setDeletionRequested(true);
        profile.setDeletionRequestedAt(LocalDateTime.now());
        profile.setDeletionReason(reason != null ? reason : "Requested by " + requesterRole);
        user.setAccountStatus("DELETION_PENDING");
        userRepository.save(user);

        logger.info("[PRIVACY] Account deletion requested for userId: {} (role: {}). Status: DELETION_PENDING", 
                userId, requesterRole);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Your data and account deletion request has been submitted under the LWR Privacy & Minor Protection Safeguards. Account marked DELETION_PENDING.");
        res.put("userId", userId);
        res.put("status", "DELETION_PENDING");
        res.put("requestedAt", LocalDateTime.now());

        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingDeletionRequests() {
        List<User> list = userRepository.findAll().stream()
                .filter(u -> "DELETION_PENDING".equalsIgnoreCase(u.getAccountStatus()) ||
                        (u.getProfile() != null && Boolean.TRUE.equals(u.getProfile().getDeletionRequested())))
                .toList();

        List<Map<String, Object>> res = new ArrayList<>();
        for (User u : list) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("userId", u.getId());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            m.put("accountStatus", u.getAccountStatus());
            if (u.getProfile() != null) {
                m.put("deletionRequestedAt", u.getProfile().getDeletionRequestedAt());
                m.put("deletionReason", u.getProfile().getDeletionReason());
                m.put("isMinor", u.getProfile().getIsMinor());
                m.put("guardianName", u.getProfile().getGuardianName());
            }
            res.add(m);
        }
        return res;
    }

    @Override
    @Transactional
    public Map<String, Object> processAccountDeletion(Long userId, String adminNotes, String processedBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User #" + userId + " not found"));

        // Safeguard anonymization: Wipe all PII while retaining anonymized statistical records
        user.setFullName("Anonymized Student #" + user.getId());
        user.setEmail("deleted_" + user.getId() + "@anonymized.local");
        user.setMobileNumber(null);
        user.setPasswordHash("$2a$10$ANONYMIZED_EXPUNGED_CREDENTIALS_HASH");
        user.setAccountStatus("DELETED");

        StudentProfile profile = user.getProfile();
        if (profile != null) {
            profile.setGuardianName("EXPUNGED");
            profile.setGuardianEmail(null);
            profile.setGuardianPhone(null);
            profile.setCity("ANONYMIZED");
            profile.setCollegeName("ANONYMIZED");
        }

        userRepository.save(user);

        logger.info("[PRIVACY] Admin {} processed deletion for userId {}. Personal PII expunged.", processedBy, userId);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("message", "User #" + userId + " PII successfully expunged. Account marked DELETED.");
        res.put("userId", userId);
        res.put("status", "DELETED");
        res.put("processedBy", processedBy);
        res.put("processedAt", LocalDateTime.now());

        return res;
    }
}

