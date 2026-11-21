package com.lwr.connecting.controller;

import com.lwr.connecting.dto.BetaFeedbackDTO;
import com.lwr.connecting.entity.BetaFeedback;
import com.lwr.connecting.repository.BetaFeedbackRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/admin/feedback", "/api/admin/feedback"})
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminFeedbackController {

    private static final Logger logger = LoggerFactory.getLogger(AdminFeedbackController.class);

    @Autowired
    private BetaFeedbackRepository betaFeedbackRepository;

    @GetMapping
    public ResponseEntity<List<BetaFeedbackDTO>> getAllFeedback(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String bugSeverity
    ) {
        List<BetaFeedback> all = betaFeedbackRepository.findAllByOrderByCreatedAtDesc();
        
        List<BetaFeedbackDTO> filtered = all.stream()
                .filter(f -> status == null || status.isBlank() || f.getStatus().equalsIgnoreCase(status.trim()))
                .filter(f -> category == null || category.isBlank() || f.getCategory().equalsIgnoreCase(category.trim()))
                .filter(f -> bugSeverity == null || bugSeverity.isBlank() || 
                        (f.getBugSeverity() != null && f.getBugSeverity().equalsIgnoreCase(bugSeverity.trim())))
                .map(BetaFeedbackDTO::fromEntity)
                .toList();

        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getFeedbackStats() {
        List<BetaFeedback> all = betaFeedbackRepository.findAllByOrderByCreatedAtDesc();

        long total = all.size();
        long newCount = all.stream().filter(f -> "NEW".equalsIgnoreCase(f.getStatus()) || "OPEN".equalsIgnoreCase(f.getStatus())).count();
        long inReviewCount = all.stream().filter(f -> "IN_REVIEW".equalsIgnoreCase(f.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(f.getStatus())).count();
        long resolvedCount = all.stream().filter(f -> "RESOLVED".equalsIgnoreCase(f.getStatus())).count();

        double avgRating = all.isEmpty() ? 0.0 : all.stream()
                .mapToInt(f -> f.getOverallRating() != null ? f.getOverallRating() : 0)
                .average()
                .orElse(0.0);

        Map<Integer, Long> ratingDistribution = new HashMap<>();
        for (int r = 1; r <= 5; r++) {
            final int star = r;
            long count = all.stream().filter(f -> f.getOverallRating() != null && f.getOverallRating() == star).count();
            ratingDistribution.put(star, count);
        }

        Map<String, Long> categoryCounts = new HashMap<>();
        Map<String, Long> bugSeverityCounts = new HashMap<>();
        for (BetaFeedback f : all) {
            String cat = f.getCategory() != null ? f.getCategory() : "GENERAL";
            categoryCounts.put(cat, categoryCounts.getOrDefault(cat, 0L) + 1);

            if (f.getBugSeverity() != null && !f.getBugSeverity().isBlank()) {
                String sev = f.getBugSeverity().toUpperCase();
                bugSeverityCounts.put(sev, bugSeverityCounts.getOrDefault(sev, 0L) + 1);
            }
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalFeedback", total);
        stats.put("newCount", newCount);
        stats.put("openCount", newCount);
        stats.put("inReviewCount", inReviewCount);
        stats.put("inProgressCount", inReviewCount);
        stats.put("resolvedCount", resolvedCount);
        stats.put("averageRating", Math.round(avgRating * 10.0) / 10.0);
        stats.put("ratingDistribution", ratingDistribution);
        stats.put("categoryCounts", categoryCounts);
        stats.put("bugSeverityCounts", bugSeverityCounts);

        return ResponseEntity.ok(stats);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateFeedbackStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        Optional<BetaFeedback> opt = betaFeedbackRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Beta feedback #" + id + " not found."));
        }

        BetaFeedback feedback = opt.get();
        if (body.containsKey("status") && body.get("status") != null && !body.get("status").isBlank()) {
            feedback.setStatus(body.get("status").trim().toUpperCase());
        }
        if (body.containsKey("adminNotes")) {
            feedback.setAdminNotes(body.get("adminNotes"));
        }
        feedback.setUpdatedAt(LocalDateTime.now());

        BetaFeedback updated = betaFeedbackRepository.save(feedback);
        logger.info("[BETA FEEDBACK] Admin updated feedback #{} status to {} with notes: {}", 
                id, updated.getStatus(), updated.getAdminNotes());

        return ResponseEntity.ok(BetaFeedbackDTO.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id) {
        if (!betaFeedbackRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Feedback #" + id + " not found."));
        }
        betaFeedbackRepository.deleteById(id);
        logger.info("[BETA FEEDBACK] Admin deleted feedback #{}", id);
        return ResponseEntity.ok(Map.of("message", "Beta feedback record deleted successfully."));
    }
}
