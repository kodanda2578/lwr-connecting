package com.lwr.connecting.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "colleges")
public class College {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String type;

    private String affiliation;
    private String website;
    private String feesPerYear;

    @Column(columnDefinition = "TEXT")
    private String placementInfo;

    @Column(columnDefinition = "TEXT")
    private String facilities;

    @Column(nullable = false)
    private String source;

    private LocalDate lastUpdated = LocalDate.now();

    public College() {}

    public College(Integer id, String code, String name, String location, String city, String state, String type, String affiliation, String website, String feesPerYear, String placementInfo, String facilities, String source, LocalDate lastUpdated) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.location = location;
        this.city = city;
        this.state = state;
        this.type = type;
        this.affiliation = affiliation;
        this.website = website;
        this.feesPerYear = feesPerYear;
        this.placementInfo = placementInfo;
        this.facilities = facilities;
        this.source = source;
        this.lastUpdated = lastUpdated != null ? lastUpdated : LocalDate.now();
    }

    public static CollegeBuilder builder() {
        return new CollegeBuilder();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getAffiliation() { return affiliation; }
    public void setAffiliation(String affiliation) { this.affiliation = affiliation; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getFeesPerYear() { return feesPerYear; }
    public void setFeesPerYear(String feesPerYear) { this.feesPerYear = feesPerYear; }

    public String getPlacementInfo() { return placementInfo; }
    public void setPlacementInfo(String placementInfo) { this.placementInfo = placementInfo; }

    public String getFacilities() { return facilities; }
    public void setFacilities(String facilities) { this.facilities = facilities; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public LocalDate getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDate lastUpdated) { this.lastUpdated = lastUpdated; }

    public static class CollegeBuilder {
        private Integer id;
        private String code;
        private String name;
        private String location;
        private String city;
        private String state;
        private String type;
        private String affiliation;
        private String website;
        private String feesPerYear;
        private String placementInfo;
        private String facilities;
        private String source;
        private LocalDate lastUpdated = LocalDate.now();

        public CollegeBuilder id(Integer id) { this.id = id; return this; }
        public CollegeBuilder code(String code) { this.code = code; return this; }
        public CollegeBuilder name(String name) { this.name = name; return this; }
        public CollegeBuilder location(String location) { this.location = location; return this; }
        public CollegeBuilder city(String city) { this.city = city; return this; }
        public CollegeBuilder state(String state) { this.state = state; return this; }
        public CollegeBuilder type(String type) { this.type = type; return this; }
        public CollegeBuilder affiliation(String affiliation) { this.affiliation = affiliation; return this; }
        public CollegeBuilder website(String website) { this.website = website; return this; }
        public CollegeBuilder feesPerYear(String feesPerYear) { this.feesPerYear = feesPerYear; return this; }
        public CollegeBuilder placementInfo(String placementInfo) { this.placementInfo = placementInfo; return this; }
        public CollegeBuilder facilities(String facilities) { this.facilities = facilities; return this; }
        public CollegeBuilder source(String source) { this.source = source; return this; }
        public CollegeBuilder lastUpdated(LocalDate lastUpdated) { this.lastUpdated = lastUpdated; return this; }

        public College build() {
            return new College(id, code, name, location, city, state, type, affiliation, website, feesPerYear, placementInfo, facilities, source, lastUpdated);
        }
    }
}
