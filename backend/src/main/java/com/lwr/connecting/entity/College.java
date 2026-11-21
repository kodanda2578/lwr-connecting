package com.lwr.connecting.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "colleges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class College {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "state_id")
    private State state;

    @Column(nullable = false, length = 255)
    private String location;

    // Denormalized state name for the legacy schema.sql 'state' NOT NULL column in H2.
    @Column(name = "state", nullable = false, length = 100)
    private String stateText;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String district;

    @Column(length = 300)
    private String website;

    @Column(name = "admission_authority", length = 200)
    private String admissionAuthority;

    @Column(name = "government_status", length = 100)
    private String governmentStatus; // Government, Private, Govt-Aided

    @Column(name = "college_type", length = 100)
    private String collegeType; // Autonomous College, State University, Deemed University

    // Mapped to legacy schema.sql 'type' NOT NULL column in H2.
    @Column(name = "type", nullable = false, length = 50)
    private String typeCode;

    @Column(name = "affiliation", length = 255)
    private String affiliation;

    @Column(name = "accreditation", length = 255)
    private String accreditation;

    @Column(name = "contact_info", length = 255)
    private String contactInfo;

    @Builder.Default
    @Column(name = "is_autonomous")
    private Boolean isAutonomous = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "source_reference", length = 500)
    private String sourceReference;

    @Column(length = 20)
    private String pincode;

    @Builder.Default
    @Column(name = "aicte_approved")
    private Boolean aicteApproved = true;

    @Column(name = "fee_range", length = 255)
    private String feeRange;

    @Column(name = "admission_link", length = 500)
    private String admissionLink;

    @Builder.Default
    @Column(name = "verification_status", length = 50)
    private String verificationStatus = "VERIFIED";

    @Column(name = "last_verified_date", length = 50)
    private String lastVerifiedDate;

    // Mapped to legacy SOURCE NOT NULL column created by schema.sql in the H2 database.
    @Column(name = "source", nullable = false, length = 255)
    private String source;

    @PrePersist
    @PreUpdate
    public void ensureRequiredFields() {
        if (this.stateText == null || this.stateText.isBlank()) {
            if (this.state != null && this.state.getName() != null) {
                this.stateText = this.state.getName();
            } else {
                this.stateText = "National";
            }
        }
        if (this.city == null || this.city.isBlank()) {
            if (this.district != null && !this.district.isBlank()) {
                this.city = this.district;
            } else {
                this.city = "Not Specified";
            }
        }
        if (this.location == null || this.location.isBlank()) {
            if (this.city != null && !this.city.isBlank() && this.stateText != null && !this.stateText.isBlank()) {
                this.location = this.city + ", " + this.stateText;
            } else if (this.city != null && !this.city.isBlank()) {
                this.location = this.city;
            } else if (this.stateText != null && !this.stateText.isBlank()) {
                this.location = this.stateText;
            } else {
                this.location = "India";
            }
        }
        if (this.typeCode == null || this.typeCode.isBlank()) {
            if (this.governmentStatus != null && !this.governmentStatus.isBlank()) {
                this.typeCode = this.governmentStatus;
            } else if (this.collegeType != null && !this.collegeType.isBlank()) {
                this.typeCode = this.collegeType;
            } else {
                this.typeCode = "Government";
            }
        }
        if (this.source == null || this.source.isBlank()) {
            if (this.sourceReference != null && !this.sourceReference.isBlank()) {
                this.source = this.sourceReference;
            } else {
                this.source = "Official State Authority";
            }
        }
    }
}
