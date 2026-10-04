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
    private Integer intermediateYear;
    private String board;
    private String targetExam;
    private String targetBranch;
    private String state;
    private String city;
    private String preferredLocation;
    private Integer targetRank;

    private Boolean profileCompleted = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public StudentProfile() {}

    public StudentProfile(Long id, User user, String collegeName, Integer intermediateYear, String board, String targetExam, String targetBranch, String state, String city, String preferredLocation, Integer targetRank, Boolean profileCompleted, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.collegeName = collegeName;
        this.intermediateYear = intermediateYear;
        this.board = board;
        this.targetExam = targetExam;
        this.targetBranch = targetBranch;
        this.state = state;
        this.city = city;
        this.preferredLocation = preferredLocation;
        this.targetRank = targetRank;
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
    public void setIntermediateYear(Integer intermediateYear) { this.intermediateYear = intermediateYear; }

    public String getBoard() { return board; }
    public void setBoard(String board) { this.board = board; }

    public String getTargetExam() { return targetExam; }
    public void setTargetExam(String targetExam) { this.targetExam = targetExam; }

    public String getTargetBranch() { return targetBranch; }
    public void setTargetBranch(String targetBranch) { this.targetBranch = targetBranch; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPreferredLocation() { return preferredLocation; }
    public void setPreferredLocation(String preferredLocation) { this.preferredLocation = preferredLocation; }

    public Integer getTargetRank() { return targetRank; }
    public void setTargetRank(Integer targetRank) { this.targetRank = targetRank; }

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
        private String board;
        private String targetExam;
        private String targetBranch;
        private String state;
        private String city;
        private String preferredLocation;
        private Integer targetRank;
        private Boolean profileCompleted = false;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt = LocalDateTime.now();

        public StudentProfileBuilder id(Long id) { this.id = id; return this; }
        public StudentProfileBuilder user(User user) { this.user = user; return this; }
        public StudentProfileBuilder collegeName(String collegeName) { this.collegeName = collegeName; return this; }
        public StudentProfileBuilder intermediateYear(Integer intermediateYear) { this.intermediateYear = intermediateYear; return this; }
        public StudentProfileBuilder board(String board) { this.board = board; return this; }
        public StudentProfileBuilder targetExam(String targetExam) { this.targetExam = targetExam; return this; }
        public StudentProfileBuilder targetBranch(String targetBranch) { this.targetBranch = targetBranch; return this; }
        public StudentProfileBuilder state(String state) { this.state = state; return this; }
        public StudentProfileBuilder city(String city) { this.city = city; return this; }
        public StudentProfileBuilder preferredLocation(String preferredLocation) { this.preferredLocation = preferredLocation; return this; }
        public StudentProfileBuilder targetRank(Integer targetRank) { this.targetRank = targetRank; return this; }
        public StudentProfileBuilder profileCompleted(Boolean profileCompleted) { this.profileCompleted = profileCompleted; return this; }
        public StudentProfileBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public StudentProfileBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public StudentProfile build() {
            return new StudentProfile(id, user, collegeName, intermediateYear, board, targetExam, targetBranch, state, city, preferredLocation, targetRank, profileCompleted, createdAt, updatedAt);
        }
    }
}
