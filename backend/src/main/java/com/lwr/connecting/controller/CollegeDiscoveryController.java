package com.lwr.connecting.controller;

import com.lwr.connecting.entity.*;
import com.lwr.connecting.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"", "/api"})
@CrossOrigin(origins = "*")
public class CollegeDiscoveryController {

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private CollegeExamMappingRepository collegeExamMappingRepository;

    @Autowired
    private CollegeBranchMappingRepository collegeBranchMappingRepository;

    @Autowired
    private CutoffRepository cutoffRepository;

    @Autowired
    private com.lwr.connecting.service.CollegeDataIngestionService collegeDataIngestionService;

    @Autowired
    private com.lwr.connecting.service.CollegeOnlineLookupService collegeOnlineLookupService;

    @Autowired
    private com.lwr.connecting.service.BetaAccessService betaAccessService;

    @GetMapping("/colleges")
    public ResponseEntity<?> getColleges(
            @RequestParam(required = false) Long stateId,
            @RequestParam(required = false) Long examId,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String govStatus,
            @RequestParam(required = false) String collegeType,
            @RequestParam(required = false) String affiliation,
            @RequestParam(required = false) String accreditation,
            @RequestParam(required = false) String verificationStatus,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (betaAccessService != null) {
            betaAccessService.recordCollegeSearch();
        }
        List<College> colleges = collegeRepository.searchCollegesAdvanced(
                stateId, examId, branchId, city, govStatus, collegeType, affiliation, accreditation, search
        );

        if (verificationStatus != null && !verificationStatus.isBlank()) {
            String vStatus = verificationStatus.trim();
            if ("VERIFIED_OFFICIAL".equalsIgnoreCase(vStatus) || "VERIFIED".equalsIgnoreCase(vStatus)) {
                colleges = colleges.stream()
                        .filter(c -> "VERIFIED".equalsIgnoreCase(c.getVerificationStatus()) || "VERIFIED_OFFICIAL".equalsIgnoreCase(c.getVerificationStatus()))
                        .collect(Collectors.toList());
            } else if ("PROVISIONAL_IMPORT".equalsIgnoreCase(vStatus) || "PROVISIONAL".equalsIgnoreCase(vStatus)) {
                colleges = colleges.stream()
                        .filter(c -> !"VERIFIED".equalsIgnoreCase(c.getVerificationStatus()) && !"VERIFIED_OFFICIAL".equalsIgnoreCase(c.getVerificationStatus()))
                        .collect(Collectors.toList());
            }
        }

        // If page parameter is supplied, return structured server-side pagination
        if (page != null) {
            int pageNum = Math.max(0, page);
            int pageSize = (size != null && size > 0) ? size : 9;
            int totalElements = colleges.size();
            int totalPages = (int) Math.ceil((double) totalElements / pageSize);
            int fromIndex = Math.min(pageNum * pageSize, totalElements);
            int toIndex = Math.min(fromIndex + pageSize, totalElements);
            List<College> pagedList = colleges.subList(fromIndex, toIndex);

            Map<String, Object> pageResponse = new LinkedHashMap<>();
            pageResponse.put("content", pagedList);
            pageResponse.put("totalPages", totalPages);
            pageResponse.put("totalElements", totalElements);
            pageResponse.put("currentPage", pageNum);
            pageResponse.put("pageSize", pageSize);
            return ResponseEntity.ok(pageResponse);
        }

        return ResponseEntity.ok(colleges);
    }

    @GetMapping("/colleges/online-search")
    public ResponseEntity<?> searchOnlineColleges(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(collegeOnlineLookupService.searchOnlineVerifiedInstitutions(q));
    }

    @GetMapping("/colleges/suggestions")
    public ResponseEntity<List<Map<String, String>>> getCollegeSuggestions(@RequestParam(required = false) String q) {
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<College> matches = collegeRepository.searchColleges(null, null, null, null, q.trim());
        List<Map<String, String>> suggestions = matches.stream().limit(8).map(c -> {
            Map<String, String> m = new HashMap<>();
            m.put("id", c.getId().toString());
            m.put("name", c.getName());
            m.put("code", c.getCode());
            m.put("location", (c.getCity() != null ? c.getCity() : c.getLocation()) + (c.getStateText() != null ? ", " + c.getStateText() : ""));
            m.put("type", c.getGovernmentStatus() != null ? c.getGovernmentStatus() : "University");
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(suggestions);
    }

    @GetMapping("/colleges/stats")
    public ResponseEntity<?> getCollegeStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        List<College> allColleges = collegeRepository.findAll();
        List<Cutoff> allCutoffs = cutoffRepository.findAll();

        stats.put("totalColleges", allColleges.size());

        Map<String, Long> byVerificationStatus = new LinkedHashMap<>();
        byVerificationStatus.put("VERIFIED_OFFICIAL", allColleges.stream()
                .filter(c -> "VERIFIED".equalsIgnoreCase(c.getVerificationStatus()) || "VERIFIED_OFFICIAL".equalsIgnoreCase(c.getVerificationStatus()))
                .count());
        byVerificationStatus.put("PROVISIONAL_IMPORT", allColleges.stream()
                .filter(c -> !"VERIFIED".equalsIgnoreCase(c.getVerificationStatus()) && !"VERIFIED_OFFICIAL".equalsIgnoreCase(c.getVerificationStatus()))
                .count());
        stats.put("byVerificationStatus", byVerificationStatus);

        Map<String, Long> byState = new TreeMap<>();
        allColleges.forEach(c -> {
            String st = c.getStateText() != null && !c.getStateText().isBlank()
                    ? c.getStateText()
                    : (c.getState() != null ? c.getState().getName() : "Other");
            byState.put(st, byState.getOrDefault(st, 0L) + 1L);
        });
        stats.put("byState", byState);

        stats.put("totalCutoffs", allCutoffs.size());

        Map<String, Long> cutoffsByExam = new LinkedHashMap<>();
        allCutoffs.forEach(ct -> {
            String ex = ct.getExam() != null ? ct.getExam().getName() : "Other";
            cutoffsByExam.put(ex, cutoffsByExam.getOrDefault(ex, 0L) + 1L);
        });
        stats.put("cutoffsByExam", cutoffsByExam);

        Map<String, Long> cutoffsByYear = new TreeMap<>(Collections.reverseOrder());
        allCutoffs.forEach(ct -> {
            String yr = String.valueOf(ct.getYear());
            cutoffsByYear.put(yr, cutoffsByYear.getOrDefault(yr, 0L) + 1L);
        });
        stats.put("cutoffsByYear", cutoffsByYear);

        stats.put("lastVerificationDate", java.time.LocalDate.now().toString());
        stats.put("sources", List.of(
                "JoSAA / CSAB (josaa.nic.in)",
                "APSCHE Official Counselling (eapcet-sche.aptonline.in)",
                "TGCHE Official Counselling (tgeapcet.nic.in)",
                "KEA Karnataka (cetonline.karnataka.gov.in)",
                "DOTE Tamil Nadu (tneaonline.org)",
                "State CET Cell Maharashtra (mahacet.org)",
                "CEE Kerala (cee.kerala.gov.in)",
                "WBJEEB West Bengal (wbjeeb.nic.in)",
                "AICTE Public Directory & NIRF Official Rankings"
        ));

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/data-ingestion/status")
    public ResponseEntity<?> getDataIngestionStatus() {
        return ResponseEntity.ok(collegeDataIngestionService.getLastIngestionReport());
    }

    @PostMapping("/data-ingestion/refresh")
    public ResponseEntity<?> refreshDataIngestion() {
        Map<String, Object> report = collegeDataIngestionService.ingestAllIndiaCollegesAndCutoffs();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/colleges/{id}")
    public ResponseEntity<?> getCollegeById(@PathVariable Long id) {
        Optional<College> college = collegeRepository.findById(id);
        if (college.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<CollegeExamMapping> examMappings = collegeExamMappingRepository.findByCollegeIdAndActiveTrue(id);
        List<CollegeBranchMapping> branchMappings = collegeBranchMappingRepository.findByCollegeIdAndActiveTrue(id);
        List<Cutoff> cutoffs = cutoffRepository.findByCollegeIdAndActiveTrueOrderByYearDesc(id);

        Map<String, Object> response = new HashMap<>();
        response.put("college", college.get());
        response.put("exams", examMappings.stream().map(CollegeExamMapping::getExam).collect(Collectors.toList()));
        response.put("branches", branchMappings.stream().map(CollegeBranchMapping::getBranch).collect(Collectors.toList()));
        response.put("cutoffs", cutoffs);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/colleges/{id}/branches")
    public ResponseEntity<List<Branch>> getCollegeBranches(@PathVariable Long id) {
        List<CollegeBranchMapping> mappings = collegeBranchMappingRepository.findByCollegeIdAndActiveTrue(id);
        List<Branch> branches = mappings.stream().map(CollegeBranchMapping::getBranch).collect(Collectors.toList());
        return ResponseEntity.ok(branches);
    }

    @GetMapping("/colleges/{id}/cutoffs")
    public ResponseEntity<List<Cutoff>> getCollegeCutoffs(@PathVariable Long id) {
        List<Cutoff> cutoffs = cutoffRepository.findByCollegeIdAndActiveTrueOrderByYearDesc(id);
        return ResponseEntity.ok(cutoffs);
    }

    @GetMapping("/branches")
    public ResponseEntity<List<Branch>> getAllBranches() {
        return ResponseEntity.ok(branchRepository.findByActiveTrueOrderByNameAsc());
    }

    @GetMapping("/cutoffs")
    public ResponseEntity<List<Cutoff>> searchCutoffs(
            @RequestParam(required = false) Long examId,
            @RequestParam(required = false) Long collegeId,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String gender) {
        List<Cutoff> cutoffs = cutoffRepository.searchCutoffs(examId, collegeId, branchId, year, category, gender);
        return ResponseEntity.ok(cutoffs);
    }

    @GetMapping("/cutoffs/predict")
    public ResponseEntity<?> predictCollegeMatches(
            @RequestParam Long examId,
            @RequestParam Integer rank,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long stateId,
            @RequestParam(required = false) String govStatus,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String homeState,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        
        if (betaAccessService != null) {
            betaAccessService.recordPredictorUsage();
        }

        List<Cutoff> eligibleCutoffs = cutoffRepository.predictEligibleCutoffs(examId, rank, category, branchId);

        // Optional post-filter for state and govStatus if provided
        if (stateId != null) {
            eligibleCutoffs = eligibleCutoffs.stream()
                    .filter(c -> c.getCollege() != null && c.getCollege().getState() != null && c.getCollege().getState().getId().equals(stateId))
                    .collect(Collectors.toList());
        }
        if (govStatus != null && !govStatus.isBlank()) {
            eligibleCutoffs = eligibleCutoffs.stream()
                    .filter(c -> c.getCollege() != null && c.getCollege().getGovernmentStatus() != null &&
                            c.getCollege().getGovernmentStatus().equalsIgnoreCase(govStatus))
                    .collect(Collectors.toList());
        }
        if (gender != null && !gender.isBlank() && !"ALL".equalsIgnoreCase(gender)) {
            eligibleCutoffs = eligibleCutoffs.stream()
                    .filter(c -> c.getGender() == null || "ALL".equalsIgnoreCase(c.getGender()) || c.getGender().equalsIgnoreCase(gender))
                    .collect(Collectors.toList());
        }
        if (homeState != null && !homeState.isBlank() && !"ALL".equalsIgnoreCase(homeState)) {
            String normHome = homeState.trim().toLowerCase();
            eligibleCutoffs = eligibleCutoffs.stream()
                    .filter(c -> {
                        if (c.getQuota() == null) return true;
                        String q = c.getQuota().toUpperCase();
                        // All India Quota and Other State Quotas are universally accessible
                        if (q.contains("ALL_INDIA") || q.contains("OTHER_STATE")) return true;
                        // State / Home Quotas apply if college is in student's home state
                        if (c.getCollege() != null) {
                            String colState = c.getCollege().getStateText() != null ? c.getCollege().getStateText().toLowerCase() : "";
                            String stateCode = (c.getCollege().getState() != null && c.getCollege().getState().getCode() != null) ?
                                    c.getCollege().getState().getCode().toLowerCase() : "";
                            return colState.contains(normHome) || normHome.contains(colState) || stateCode.equals(normHome);
                        }
                        return false;
                    })
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> results = new ArrayList<>();
        for (Cutoff c : eligibleCutoffs) {
            Map<String, Object> match = new LinkedHashMap<>();
            match.put("college", c.getCollege());
            match.put("branch", c.getBranch());
            match.put("exam", c.getExam());
            match.put("category", c.getCategory());
            match.put("seatPool", c.getGender() != null ? c.getGender() : "Gender-Neutral / All");
            match.put("quota", c.getQuota() != null ? c.getQuota() : "State Quota");
            match.put("year", c.getYear());
            match.put("round", c.getRound());
            match.put("openingRank", c.getOpeningRank());
            match.put("closingRank", c.getClosingRank());
            match.put("userRank", rank);
            int margin = c.getClosingRank() - rank;
            match.put("difference", margin);
            
            // Standardized labels as required: "Historically within range", "Borderline", "Historically outside range"
            if (margin >= 0) {
                match.put("competitivenessStatus", "Historically within range");
                match.put("chanceCategory", "Historically within range");
            } else if (margin >= -1500) {
                match.put("competitivenessStatus", "Borderline");
                match.put("chanceCategory", "Borderline");
            } else {
                match.put("competitivenessStatus", "Historically outside range");
                match.put("chanceCategory", "Historically outside range");
            }

            // Explicit reason why the record matches student inputs
            String examCode = c.getExam() != null ? c.getExam().getCode() : "Exam";
            String catCode = c.getCategory() != null ? c.getCategory() : "General";
            String whyMatches;
            if (margin >= 0) {
                whyMatches = String.format(
                        "Your entrance rank of %,d was comfortably within the previous closing rank of %,d (margin: +%,d, Academic Year %d, Round %d, Category %s) for %s.",
                        rank, c.getClosingRank(), margin, c.getYear(), c.getRound(), catCode, examCode
                );
            } else {
                whyMatches = String.format(
                        "Your entrance rank of %,d was close to the competitive closing rank of %,d (margin: %,d, Academic Year %d, Round %d, Category %s) for %s; considered a borderline/reach option.",
                        rank, c.getClosingRank(), margin, c.getYear(), c.getRound(), catCode, examCode
                );
            }
            match.put("whyMatches", whyMatches);

            match.put("sourceReference", c.getSourceReference() != null ? c.getSourceReference() : "Official State Authority");
            match.put("lastVerifiedDate", c.getLastVerifiedDate() != null ? c.getLastVerifiedDate() : "Verified Official Records");
            match.put("disclaimer", "Historical cutoff comparison for educational guidance only. Does not guarantee admission in current year counselling.");
            results.add(match);
        }

        if (page != null) {
            int pageNum = Math.max(0, page);
            int pageSize = (size != null && size > 0) ? size : 10;
            int totalElements = results.size();
            int totalPages = (int) Math.ceil((double) totalElements / pageSize);
            int fromIndex = Math.min(pageNum * pageSize, totalElements);
            int toIndex = Math.min(fromIndex + pageSize, totalElements);
            List<Map<String, Object>> pagedResults = results.subList(fromIndex, toIndex);

            Map<String, Object> pageResponse = new LinkedHashMap<>();
            pageResponse.put("content", pagedResults);
            pageResponse.put("totalPages", totalPages);
            pageResponse.put("totalElements", totalElements);
            pageResponse.put("currentPage", pageNum);
            pageResponse.put("pageSize", pageSize);
            return ResponseEntity.ok(pageResponse);
        }

        return ResponseEntity.ok(results);
    }
}
