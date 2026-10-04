package com.lwr.connecting.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "email_preferences")
public class EmailPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    private Boolean newMockTests = true;

    private Boolean newStudyMaterials = true;

    private Boolean newVideos = true;

    private Boolean importantAnnouncements = true;

    private Boolean mentorReplies = true;

    private Boolean doubtSessionUpdates = true;

    public EmailPreference() {}

    public EmailPreference(Long id, User user, Boolean newMockTests, Boolean newStudyMaterials, Boolean newVideos, Boolean importantAnnouncements, Boolean mentorReplies, Boolean doubtSessionUpdates) {
        this.id = id;
        this.user = user;
        this.newMockTests = newMockTests != null ? newMockTests : true;
        this.newStudyMaterials = newStudyMaterials != null ? newStudyMaterials : true;
        this.newVideos = newVideos != null ? newVideos : true;
        this.importantAnnouncements = importantAnnouncements != null ? importantAnnouncements : true;
        this.mentorReplies = mentorReplies != null ? mentorReplies : true;
        this.doubtSessionUpdates = doubtSessionUpdates != null ? doubtSessionUpdates : true;
    }

    public static EmailPreferenceBuilder builder() {
        return new EmailPreferenceBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Boolean getNewMockTests() { return newMockTests; }
    public void setNewMockTests(Boolean newMockTests) { this.newMockTests = newMockTests; }

    public Boolean getNewStudyMaterials() { return newStudyMaterials; }
    public void setNewStudyMaterials(Boolean newStudyMaterials) { this.newStudyMaterials = newStudyMaterials; }

    public Boolean getNewVideos() { return newVideos; }
    public void setNewVideos(Boolean newVideos) { this.newVideos = newVideos; }

    public Boolean getImportantAnnouncements() { return importantAnnouncements; }
    public void setImportantAnnouncements(Boolean importantAnnouncements) { this.importantAnnouncements = importantAnnouncements; }

    public Boolean getMentorReplies() { return mentorReplies; }
    public void setMentorReplies(Boolean mentorReplies) { this.mentorReplies = mentorReplies; }

    public Boolean getDoubtSessionUpdates() { return doubtSessionUpdates; }
    public void setDoubtSessionUpdates(Boolean doubtSessionUpdates) { this.doubtSessionUpdates = doubtSessionUpdates; }

    public static class EmailPreferenceBuilder {
        private Long id;
        private User user;
        private Boolean newMockTests = true;
        private Boolean newStudyMaterials = true;
        private Boolean newVideos = true;
        private Boolean importantAnnouncements = true;
        private Boolean mentorReplies = true;
        private Boolean doubtSessionUpdates = true;

        public EmailPreferenceBuilder id(Long id) { this.id = id; return this; }
        public EmailPreferenceBuilder user(User user) { this.user = user; return this; }
        public EmailPreferenceBuilder newMockTests(Boolean newMockTests) { this.newMockTests = newMockTests; return this; }
        public EmailPreferenceBuilder newStudyMaterials(Boolean newStudyMaterials) { this.newStudyMaterials = newStudyMaterials; return this; }
        public EmailPreferenceBuilder newVideos(Boolean newVideos) { this.newVideos = newVideos; return this; }
        public EmailPreferenceBuilder importantAnnouncements(Boolean importantAnnouncements) { this.importantAnnouncements = importantAnnouncements; return this; }
        public EmailPreferenceBuilder mentorReplies(Boolean mentorReplies) { this.mentorReplies = mentorReplies; return this; }
        public EmailPreferenceBuilder doubtSessionUpdates(Boolean doubtSessionUpdates) { this.doubtSessionUpdates = doubtSessionUpdates; return this; }

        public EmailPreference build() {
            return new EmailPreference(id, user, newMockTests, newStudyMaterials, newVideos, importantAnnouncements, mentorReplies, doubtSessionUpdates);
        }
    }
}
