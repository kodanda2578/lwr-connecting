package com.lwr.connecting.controller;

import com.lwr.connecting.entity.*;
import com.lwr.connecting.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/admin/data-import")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminDataImportController {

    private static final Logger logger = LoggerFactory.getLogger(AdminDataImportController.class);

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private CutoffRepository cutoffRepository;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private BranchRepository branchRepository;

    /**
     * Preview endpoint: validates records, checks for duplicates against existing DB,
     * and returns structured analysis without modifying the database.
     */
    @PostMapping("/preview")
    public ResponseEntity<?> previewDataImport(@RequestBody Map<String, Object> payload) {
        String type = payload.getOrDefault("type", "COLLEGE").toString().toUpperCase();
        List<Map<String, Object>> records = (List<Map<String, Object>>) payload.getOrDefault("records", Collections.emptyList());

        Map<String, Object> previewReport = new LinkedHashMap<>();
        previewReport.put("type", type);
        previewReport.put("totalRecordsReceived", records.size());

        List<Map<String, Object>> validRecords = new ArrayList<>();
        List<Map<String, Object>> duplicateRecords = new ArrayList<>();
        List<Map<String, Object>> invalidRecords = new ArrayList<>();

        if ("COLLEGE".equals(type)) {
            for (int i = 0; i < records.size(); i++) {
                Map<String, Object> r = records.get(i);
                String code = r.getOrDefault("code", "").toString().trim().toUpperCase();
                String name = r.getOrDefault("name", "").toString().trim();

                if (code.isBlank() || name.isBlank()) {
                    Map<String, Object> err = new LinkedHashMap<>(r);
                    err.put("errorReason", "Missing required field: code or name is blank");
                    invalidRecords.add(err);
                    continue;
                }

                Optional<College> existing = collegeRepository.findByCode(code);
                if (existing.isPresent()) {
                    Map<String, Object> dup = new LinkedHashMap<>(r);
                    dup.put("existingCollegeName", existing.get().getName());
                    dup.put("status", "DUPLICATE_FOUND_SAFE_UPDATE");
                    duplicateRecords.add(dup);
                } else {
                    Map<String, Object> val = new LinkedHashMap<>(r);
                    val.put("status", "NEW_RECORD_READY");
                    validRecords.add(val);
                }
            }
        } else if ("CUTOFF".equals(type)) {
            for (Map<String, Object> r : records) {
                String examCode = r.getOrDefault("examCode", "").toString().trim().toUpperCase();
                String collegeCode = r.getOrDefault("collegeCode", "").toString().trim().toUpperCase();
                String branchCode = r.getOrDefault("branchCode", "").toString().trim().toUpperCase();
                Object yearObj = r.get("year");
                Object closingRankObj = r.get("closingRank");

                if (examCode.isBlank() || collegeCode.isBlank() || branchCode.isBlank() || yearObj == null || closingRankObj == null) {
                    Map<String, Object> err = new LinkedHashMap<>(r);
                    err.put("errorReason", "Missing required field: examCode, collegeCode, branchCode, year, or closingRank");
                    invalidRecords.add(err);
                    continue;
                }

                Optional<Exam> examOpt = examRepository.findByCode(examCode);
                Optional<College> colOpt = collegeRepository.findByCode(collegeCode);
                Optional<Branch> brOpt = branchRepository.findByCode(branchCode);

                if (examOpt.isEmpty() || colOpt.isEmpty() || brOpt.isEmpty()) {
                    Map<String, Object> err = new LinkedHashMap<>(r);
                    err.put("errorReason", "Foreign entity not found: check examCode (" + examCode + "), collegeCode (" + collegeCode + "), branchCode (" + branchCode + ")");
                    invalidRecords.add(err);
                    continue;
                }

                int year = Integer.parseInt(yearObj.toString());
                String category = r.getOrDefault("category", "OC").toString().toUpperCase();
                String gender = r.getOrDefault("gender", "ALL").toString().toUpperCase();

                List<Cutoff> existing = cutoffRepository.searchCutoffs(examOpt.get().getId(), colOpt.get().getId(), brOpt.get().getId(), year, category, gender);
                if (!existing.isEmpty()) {
                    Map<String, Object> dup = new LinkedHashMap<>(r);
                    dup.put("existingClosingRank", existing.get(0).getClosingRank());
                    dup.put("status", "EXISTING_BENCHMARK_WILL_UPDATE");
                    duplicateRecords.add(dup);
                } else {
                    Map<String, Object> val = new LinkedHashMap<>(r);
                    val.put("status", "NEW_CUTOFF_READY");
                    validRecords.add(val);
                }
            }
        }

        previewReport.put("validCount", validRecords.size());
        previewReport.put("duplicateCount", duplicateRecords.size());
        previewReport.put("invalidCount", invalidRecords.size());
        previewReport.put("validRecords", validRecords);
        previewReport.put("duplicateRecords", duplicateRecords);
        previewReport.put("invalidRecords", invalidRecords);
        previewReport.put("canCommit", !validRecords.isEmpty() || !duplicateRecords.isEmpty());

        return ResponseEntity.ok(previewReport);
    }

    /**
     * Commit endpoint: commits validated preview records with safe upserts and logging.
     */
    @PostMapping("/commit")
    public ResponseEntity<?> commitDataImport(@RequestBody Map<String, Object> payload) {
        String type = payload.getOrDefault("type", "COLLEGE").toString().toUpperCase();
        List<Map<String, Object>> records = (List<Map<String, Object>>) payload.getOrDefault("records", Collections.emptyList());
        String defaultSourceUrl = payload.getOrDefault("sourceUrl", "https://facilities.aicte-india.org/dashboard/").toString();

        int created = 0;
        int updated = 0;

        if ("COLLEGE".equals(type)) {
            for (Map<String, Object> r : records) {
                String code = r.getOrDefault("code", "").toString().trim().toUpperCase();
                String name = r.getOrDefault("name", "").toString().trim();
                if (code.isBlank() || name.isBlank()) continue;

                Optional<College> existing = collegeRepository.findByCode(code);
                College c = existing.orElseGet(College::new);
                boolean isNew = existing.isEmpty();

                c.setCode(code);
                c.setName(name);
                if (r.containsKey("stateCode")) {
                    stateRepository.findByCode(r.get("stateCode").toString().toUpperCase()).ifPresent(c::setState);
                }
                if (r.containsKey("city")) c.setCity(r.get("city").toString());
                if (r.containsKey("location")) c.setLocation(r.get("location").toString());
                if (r.containsKey("pincode")) c.setPincode(r.get("pincode").toString());
                if (r.containsKey("website")) c.setWebsite(r.get("website").toString());
                if (r.containsKey("feeRange")) c.setFeeRange(r.get("feeRange").toString());
                if (r.containsKey("governmentStatus")) c.setGovernmentStatus(r.get("governmentStatus").toString());
                if (r.containsKey("admissionLink")) c.setAdmissionLink(r.get("admissionLink").toString());
                if (r.containsKey("description")) c.setDescription(r.get("description").toString());

                c.setAicteApproved(true);
                c.setVerificationStatus("VERIFIED_ADMIN_IMPORT");
                c.setLastVerifiedDate(LocalDate.now().toString());
                c.setSource(defaultSourceUrl);
                c.setSourceReference("Admin Verified Import (" + defaultSourceUrl + ")");
                c.setActive(true);

                collegeRepository.save(c);
                if (isNew) created++; else updated++;
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Import committed successfully: " + created + " created, " + updated + " safely updated.");
        response.put("createdCount", created);
        response.put("updatedCount", updated);
        response.put("totalCollegesInDb", collegeRepository.count());

        logger.info("[ADMIN_IMPORT] Committed data import: created={}, updated={}", created, updated);
        return ResponseEntity.ok(response);
    }
}
