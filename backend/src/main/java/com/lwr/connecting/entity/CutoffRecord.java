package com.lwr.connecting.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "cutoff_records")
public class CutoffRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String exam;

    @Column(name = "\"year\"", nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer counsellingRound;

    @Column(nullable = false)
    private String collegeCode;

    @Column(nullable = false)
    private String collegeName;

    @Column(nullable = false)
    private String branchCode;

    @Column(nullable = false)
    private String branchName;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Integer openingRank;

    @Column(nullable = false)
    private Integer closingRank;

    @Column(nullable = false)
    private String source;

    private LocalDate lastUpdated = LocalDate.now();

    public CutoffRecord() {}

    public CutoffRecord(Long id, String exam, Integer year, Integer counsellingRound, String collegeCode, String collegeName, String branchCode, String branchName, String category, Integer openingRank, Integer closingRank, String source, LocalDate lastUpdated) {
        this.id = id;
        this.exam = exam;
        this.year = year;
        this.counsellingRound = counsellingRound;
        this.collegeCode = collegeCode;
        this.collegeName = collegeName;
        this.branchCode = branchCode;
        this.branchName = branchName;
        this.category = category;
        this.openingRank = openingRank;
        this.closingRank = closingRank;
        this.source = source;
        this.lastUpdated = lastUpdated != null ? lastUpdated : LocalDate.now();
    }

    public static CutoffRecordBuilder builder() {
        return new CutoffRecordBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getExam() { return exam; }
    public void setExam(String exam) { this.exam = exam; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public Integer getCounsellingRound() { return counsellingRound; }
    public void setCounsellingRound(Integer counsellingRound) { this.counsellingRound = counsellingRound; }

    public String getCollegeCode() { return collegeCode; }
    public void setCollegeCode(String collegeCode) { this.collegeCode = collegeCode; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getOpeningRank() { return openingRank; }
    public void setOpeningRank(Integer openingRank) { this.openingRank = openingRank; }

    public Integer getClosingRank() { return closingRank; }
    public void setClosingRank(Integer closingRank) { this.closingRank = closingRank; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public LocalDate getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDate lastUpdated) { this.lastUpdated = lastUpdated; }

    public static class CutoffRecordBuilder {
        private Long id;
        private String exam;
        private Integer year;
        private Integer counsellingRound;
        private String collegeCode;
        private String collegeName;
        private String branchCode;
        private String branchName;
        private String category;
        private Integer openingRank;
        private Integer closingRank;
        private String source;
        private LocalDate lastUpdated = LocalDate.now();

        public CutoffRecordBuilder id(Long id) { this.id = id; return this; }
        public CutoffRecordBuilder exam(String exam) { this.exam = exam; return this; }
        public CutoffRecordBuilder year(Integer year) { this.year = year; return this; }
        public CutoffRecordBuilder counsellingRound(Integer counsellingRound) { this.counsellingRound = counsellingRound; return this; }
        public CutoffRecordBuilder collegeCode(String collegeCode) { this.collegeCode = collegeCode; return this; }
        public CutoffRecordBuilder collegeName(String collegeName) { this.collegeName = collegeName; return this; }
        public CutoffRecordBuilder branchCode(String branchCode) { this.branchCode = branchCode; return this; }
        public CutoffRecordBuilder branchName(String branchName) { this.branchName = branchName; return this; }
        public CutoffRecordBuilder category(String category) { this.category = category; return this; }
        public CutoffRecordBuilder openingRank(Integer openingRank) { this.openingRank = openingRank; return this; }
        public CutoffRecordBuilder closingRank(Integer closingRank) { this.closingRank = closingRank; return this; }
        public CutoffRecordBuilder source(String source) { this.source = source; return this; }
        public CutoffRecordBuilder lastUpdated(LocalDate lastUpdated) { this.lastUpdated = lastUpdated; return this; }

        public CutoffRecord build() {
            return new CutoffRecord(id, exam, year, counsellingRound, collegeCode, collegeName, branchCode, branchName, category, openingRank, closingRank, source, lastUpdated);
        }
    }
}
