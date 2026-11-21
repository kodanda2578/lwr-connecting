package com.lwr.connecting.dto;

import com.lwr.connecting.entity.BetaFeedback;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BetaFeedbackDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Integer overallRating;
    private Integer mockTestsRating;
    private Integer predictorRating;
    private Integer cutoffsRating;
    private Integer aiGuidanceRating;
    private Integer mentorshipRating;
    private String bugSeverity;
    private String overallExperience;
    private String difficultiesFaced;
    private String collegeInfoIssues;
    private String missingInfoReport;
    private String usefulFeatures;
    private String suggestions;
    private String category;
    private String status;
    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BetaFeedbackDTO fromEntity(BetaFeedback entity) {
        if (entity == null) return null;
        return BetaFeedbackDTO.builder()
                .id(entity.getId())
                .studentId(entity.getStudent() != null ? entity.getStudent().getId() : null)
                .studentName(entity.getStudentName())
                .studentEmail(entity.getStudentEmail())
                .overallRating(entity.getOverallRating())
                .mockTestsRating(entity.getMockTestsRating())
                .predictorRating(entity.getPredictorRating())
                .cutoffsRating(entity.getCutoffsRating())
                .aiGuidanceRating(entity.getAiGuidanceRating())
                .mentorshipRating(entity.getMentorshipRating())
                .bugSeverity(entity.getBugSeverity())
                .overallExperience(entity.getOverallExperience())
                .difficultiesFaced(entity.getDifficultiesFaced())
                .collegeInfoIssues(entity.getCollegeInfoIssues())
                .missingInfoReport(entity.getMissingInfoReport())
                .usefulFeatures(entity.getUsefulFeatures())
                .suggestions(entity.getSuggestions())
                .category(entity.getCategory())
                .status(entity.getStatus())
                .adminNotes(entity.getAdminNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
