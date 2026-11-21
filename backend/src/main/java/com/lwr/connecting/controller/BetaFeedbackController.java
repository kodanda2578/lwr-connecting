package com.lwr.connecting.controller;

import com.lwr.connecting.dto.BetaFeedbackDTO;
import com.lwr.connecting.entity.BetaFeedback;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.BetaFeedbackRepository;
import com.lwr.connecting.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/feedback", "/api/feedback"})
@CrossOrigin(origins = "*")
public class BetaFeedbackController {

    private static final Logger logger = LoggerFactory.getLogger(BetaFeedbackController.class);

    @Autowired
    private BetaFeedbackRepository betaFeedbackRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestBody BetaFeedbackDTO request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required to submit beta feedback."));
        }

        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found."));
        }

        boolean isStudent = user.getRoles().stream()
                .anyMatch(r -> "ROLE_STUDENT".equalsIgnoreCase(r.getName()));
        if (!isStudent) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only authenticated students are eligible to submit beta feedback."));
        }

        if (request == null || request.getOverallExperience() == null || request.getOverallExperience().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Overall experience description is required."));
        }

        // Accidental duplicate submission prevention (within 15s)
        List<BetaFeedback> recentList = betaFeedbackRepository.findByStudentOrderByCreatedAtDesc(user);
        if (!recentList.isEmpty()) {
            BetaFeedback last = recentList.get(0);
            if (last.getCreatedAt() != null && last.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(15))
                    && last.getOverallExperience().equalsIgnoreCase(request.getOverallExperience().trim())) {
                logger.warn("[BETA FEEDBACK] Deduplicated accidental double submit for userId {}", user.getId());
                return ResponseEntity.status(HttpStatus.OK).body(BetaFeedbackDTO.fromEntity(last));
            }
        }

        int rating = request.getOverallRating() != null ? request.getOverallRating() : 5;
        if (rating < 1) rating = 1;
        if (rating > 5) rating = 5;

        BetaFeedback feedback = BetaFeedback.builder()
                .student(user)
                .studentName(user.getFullName())
                .studentEmail(user.getEmail())
                .overallRating(rating)
                .mockTestsRating(request.getMockTestsRating())
                .predictorRating(request.getPredictorRating())
                .cutoffsRating(request.getCutoffsRating())
                .aiGuidanceRating(request.getAiGuidanceRating())
                .mentorshipRating(request.getMentorshipRating())
                .bugSeverity(request.getBugSeverity() != null && !request.getBugSeverity().isBlank() ? request.getBugSeverity().toUpperCase() : null)
                .overallExperience(request.getOverallExperience().trim())
                .difficultiesFaced(request.getDifficultiesFaced() != null ? request.getDifficultiesFaced().trim() : null)
                .collegeInfoIssues(request.getCollegeInfoIssues() != null ? request.getCollegeInfoIssues().trim() : null)
                .missingInfoReport(request.getMissingInfoReport() != null ? request.getMissingInfoReport().trim() : null)
                .usefulFeatures(request.getUsefulFeatures() != null ? request.getUsefulFeatures().trim() : null)
                .suggestions(request.getSuggestions() != null ? request.getSuggestions().trim() : null)
                .category(request.getCategory() != null && !request.getCategory().trim().isEmpty() ? request.getCategory().trim() : "GENERAL")
                .status("NEW")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        BetaFeedback saved = betaFeedbackRepository.save(feedback);
        logger.info("[BETA FEEDBACK] Student {} ({}) submitted feedback #{} [category={}, bugSeverity={}]", 
                user.getFullName(), user.getEmail(), saved.getId(), saved.getCategory(), saved.getBugSeverity());

        return ResponseEntity.status(HttpStatus.CREATED).body(BetaFeedbackDTO.fromEntity(saved));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyFeedback(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required."));
        }

        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found."));
        }

        List<BetaFeedback> feedbacks = betaFeedbackRepository.findByStudentOrderByCreatedAtDesc(user);
        List<BetaFeedbackDTO> dtoList = feedbacks.stream().map(BetaFeedbackDTO::fromEntity).toList();
        return ResponseEntity.ok(dtoList);
    }
}
