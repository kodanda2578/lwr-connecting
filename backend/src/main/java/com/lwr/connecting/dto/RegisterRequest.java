package com.lwr.connecting.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String mobileNumber;

    @NotBlank(message = "Password is required")
    private String password;

    private Integer intermediateYear;
    private String board;
    private String targetExam;
    private String targetBranch;
    private String preferredLocation;
    private Integer targetRank;

    public RegisterRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Integer getIntermediateYear() { return intermediateYear; }
    public void setIntermediateYear(Integer intermediateYear) { this.intermediateYear = intermediateYear; }

    public String getBoard() { return board; }
    public void setBoard(String board) { this.board = board; }

    public String getTargetExam() { return targetExam; }
    public void setTargetExam(String targetExam) { this.targetExam = targetExam; }

    public String getTargetBranch() { return targetBranch; }
    public void setTargetBranch(String targetBranch) { this.targetBranch = targetBranch; }

    public String getPreferredLocation() { return preferredLocation; }
    public void setPreferredLocation(String preferredLocation) { this.preferredLocation = preferredLocation; }

    public Integer getTargetRank() { return targetRank; }
    public void setTargetRank(Integer targetRank) { this.targetRank = targetRank; }
}
