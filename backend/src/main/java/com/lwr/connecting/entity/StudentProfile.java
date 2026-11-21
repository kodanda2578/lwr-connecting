package com.lwr.connecting.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String collegeName;
    private Integer intermediateYear; // 1 or 2
    private Integer intermediateClass; // 11 or 12
    private String studyStream = "MPC"; // MPC, BiPC, Other
    private String board;
    private String targetExam;
    private String targetBranch;
    private String engineeringInterests;
    private String state;
    private String city;
    private String preferredLocation;
    private Integer targetRank;

    // Minor & Guardian Safeguards
    private Boolean isMinor = true;
    private String guardianName;
    private String guardianEmail;
    private String guardianPhone;
    private Boolean guardianConsentGiven = false;
    private LocalDateTime guardianConsentTimestamp;

    // Account & Data Deletion Safeguards
    private Boolean deletionRequested = false;
    private LocalDateTime deletionRequestedAt;
    private String deletionReason;

    private Boolean profileCompleted = false;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public StudentProfile() {}

    public StudentProfile(Long id, User user, String collegeName, Integer intermediateYear, Integer intermediateClass,
                          String studyStream, String board, String targetExam, String targetBranch,
                          String engineeringInterests, String state, String city, String preferredLocation,
                          Integer targetRank, Boolean isMinor, String guardianName, String guardianEmail,
                          String guardianPhone, Boolean guardianConsentGiven, LocalDateTime guardianConsentTimestamp,
                          Boolean deletionRequested, LocalDateTime deletionRequestedAt, String deletionReason,
                          Boolean profileCompleted, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.collegeName = collegeName;
        this.intermediateYear = intermediateYear;
        this.intermediateClass = intermediateClass != null ? intermediateClass : (intermediateYear != null ? (intermediateYear == 1 ? 11 : 12) : 12);
        this.studyStream = studyStream != null ? studyStream : "MPC";
        this.board = board;
        this.targetExam = targetExam;
        this.targetBranch = targetBranch;
        this.engineeringInterests = engineeringInterests;
        this.state = state;
        this.city = city;
        this.preferredLocation = preferredLocation;
        this.targetRank = targetRank;
        this.isMinor = isMinor != null ? isMinor : true;
        this.guardianName = guardianName;
        this.guardianEmail = guardianEmail;
        this.guardianPhone = guardianPhone;
        this.guardianConsentGiven = guardianConsentGiven != null ? guardianConsentGiven : false;
        this.guardianConsentTimestamp = guardianConsentTimestamp;
        this.deletionRequested = deletionRequested != null ? deletionRequested : false;
        this.deletionRequestedAt = deletionRequestedAt;
        this.deletionReason = deletionReason;
        this.profileCompleted = profileCompleted != null ? profileCompleted : false;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.updatedAt = updatedAt != null ? updatedAt : LocalDateTime.now();
    }

    public static StudentProfileBuilder builder() {
        return new StudentProfileBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public Integer getIntermediateYear() { return intermediateYear; }
    public void setIntermediateYear(Integer intermediateYear) { 
        this.intermediateYear = intermediateYear; 
        if (this.intermediateClass == null && intermediateYear != null) {
            this.intermediateClass = intermediateYear == 1 ? 11 : 12;
        }
    }

    public Integer getIntermediateClass() { return intermediateClass; }
    public void setIntermediateClass(Integer intermediateClass) { 
        this.intermediateClass = intermediateClass; 
        if (intermediateClass != null) {
            this.intermediateYear = intermediateClass == 11 ? 1 : 2;
        }
    }

    public String getStudyStream() { return studyStream; }
    public void setStudyStream(String studyStream) { this.studyStream = studyStream; }

    public String getBoard() { return board; }
    public void setBoard(String board) { this.board = board; }

    public String getTargetExam() { return targetExam; }
    public void setTargetExam(String targetExam) { this.targetExam = targetExam; }

    public String getTargetBranch() { return targetBranch; }
    public void setTargetBranch(String targetBranch) { this.targetBranch = targetBranch; }

    public String getEngineeringInterests() { return engineeringInterests; }
    public void setEngineeringInterests(String engineeringInterests) { this.engineeringInterests = engineeringInterests; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPreferredLocation() { return preferredLocation; }
    public void setPreferredLocation(String preferredLocation) { this.preferredLocation = preferredLocation; }

    public Integer getTargetRank() { return targetRank; }
    public void setTargetRank(Integer targetRank) { this.targetRank = targetRank; }

    public Boolean getIsMinor() { return isMinor; }
    public void setIsMinor(Boolean minor) { isMinor = minor; }

    public String getGuardianName() { return guardianName; }
    public void setGuardianName(String guardianName) { this.guardianName = guardianName; }

    public String getGuardianEmail() { return guardianEmail; }
    public void setGuardianEmail(String guardianEmail) { this.guardianEmail = guardianEmail; }

    public String getGuardianPhone() { return guardianPhone; }
    public void setGuardianPhone(String guardianPhone) { this.guardianPhone = guardianPhone; }

    public Boolean getGuardianConsentGiven() { return guardianConsentGiven; }
    public void setGuardianConsentGiven(Boolean guardianConsentGiven) { this.guardianConsentGiven = guardianConsentGiven; }

    public LocalDateTime getGuardianConsentTimestamp() { return guardianConsentTimestamp; }
    public void setGuardianConsentTimestamp(LocalDateTime guardianConsentTimestamp) { this.guardianConsentTimestamp = guardianConsentTimestamp; }

    public Boolean getDeletionRequested() { return deletionRequested; }
    public void setDeletionRequested(Boolean deletionRequested) { this.deletionRequested = deletionRequested; }

    public LocalDateTime getDeletionRequestedAt() { return deletionRequestedAt; }
    public void setDeletionRequestedAt(LocalDateTime deletionRequestedAt) { this.deletionRequestedAt = deletionRequestedAt; }

    public String getDeletionReason() { return deletionReason; }
    public void setDeletionReason(String deletionReason) { this.deletionReason = deletionReason; }

    public Boolean getProfileCompleted() { return profileCompleted; }
    public void setProfileCompleted(Boolean profileCompleted) { this.profileCompleted = profileCompleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static class StudentProfileBuilder {
        private Long id;
        private User user;
        private String collegeName;
        private Integer intermediateYear;
        private Integer intermediateClass;
        private String studyStream = "MPC";
        private String board;
        private String targetExam;
        private String targetBranch;
        private String engineeringInterests;
        private String state;
        private String city;
        private String preferredLocation;
        private Integer targetRank;
        private Boolean isMinor = true;
        private String guardianName;
        private String guardianEmail;
        private String guardianPhone;
        private Boolean guardianConsentGiven = false;
        private LocalDateTime guardianConsentTimestamp;
        private Boolean deletionRequested = false;
        private LocalDateTime deletionRequestedAt;
        private String deletionReason;
        private Boolean profileCompleted = false;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt = LocalDateTime.now();

        public StudentProfileBuilder id(Long id) { this.id = id; return this; }
        public StudentProfileBuilder user(User user) { this.user = user; return this; }
        public StudentProfileBuilder collegeName(String collegeName) { this.collegeName = collegeName; return this; }
        public StudentProfileBuilder intermediateYear(Integer intermediateYear) { 
            this.intermediateYear = intermediateYear; 
            if (this.intermediateClass == null && intermediateYear != null) {
                this.intermediateClass = intermediateYear == 1 ? 11 : 12;
            }
            return this; 
        }
        public StudentProfileBuilder intermediateClass(Integer intermediateClass) {
            this.intermediateClass = intermediateClass;
            if (intermediateClass != null) {
                this.intermediateYear = intermediateClass == 11 ? 1 : 2;
            }
            return this;
        }
        public StudentProfileBuilder studyStream(String studyStream) { this.studyStream = studyStream; return this; }
        public StudentProfileBuilder board(String board) { this.board = board; return this; }
        public StudentProfileBuilder targetExam(String targetExam) { this.targetExam = targetExam; return this; }
        public StudentProfileBuilder targetBranch(String targetBranch) { this.targetBranch = targetBranch; return this; }
        public StudentProfileBuilder engineeringInterests(String engineeringInterests) { this.engineeringInterests = engineeringInterests; return this; }
        public StudentProfileBuilder state(String state) { this.state = state; return this; }
        public StudentProfileBuilder city(String city) { this.city = city; return this; }
        public StudentProfileBuilder preferredLocation(String preferredLocation) { this.preferredLocation = preferredLocation; return this; }
        public StudentProfileBuilder targetRank(Integer targetRank) { this.targetRank = targetRank; return this; }
        public StudentProfileBuilder isMinor(Boolean isMinor) { this.isMinor = isMinor; return this; }
        public StudentProfileBuilder guardianName(String guardianName) { this.guardianName = guardianName; return this; }
        public StudentProfileBuilder guardianEmail(String guardianEmail) { this.guardianEmail = guardianEmail; return this; }
        public StudentProfileBuilder guardianPhone(String guardianPhone) { this.guardianPhone = guardianPhone; return this; }
        public StudentProfileBuilder guardianConsentGiven(Boolean guardianConsentGiven) { this.guardianConsentGiven = guardianConsentGiven; return this; }
        public StudentProfileBuilder guardianConsentTimestamp(LocalDateTime guardianConsentTimestamp) { this.guardianConsentTimestamp = guardianConsentTimestamp; return this; }
        public StudentProfileBuilder deletionRequested(Boolean deletionRequested) { this.deletionRequested = deletionRequested; return this; }
        public StudentProfileBuilder deletionRequestedAt(LocalDateTime deletionRequestedAt) { this.deletionRequestedAt = deletionRequestedAt; return this; }
        public StudentProfileBuilder deletionReason(String deletionReason) { this.deletionReason = deletionReason; return this; }
        public StudentProfileBuilder profileCompleted(Boolean profileCompleted) { this.profileCompleted = profileCompleted; return this; }
        public StudentProfileBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public StudentProfileBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public StudentProfile build() {
            return new StudentProfile(id, user, collegeName, intermediateYear, intermediateClass, studyStream, board,
                    targetExam, targetBranch, engineeringInterests, state, city, preferredLocation, targetRank,
                    isMinor, guardianName, guardianEmail, guardianPhone, guardianConsentGiven, guardianConsentTimestamp,
                    deletionRequested, deletionRequestedAt, deletionReason, profileCompleted, createdAt, updatedAt);
        }
    }
}
