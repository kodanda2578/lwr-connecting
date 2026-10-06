package com.lwr.connecting.controller;

import com.lwr.connecting.entity.*;
import com.lwr.connecting.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
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

    @GetMapping("/colleges")
    public ResponseEntity<List<College>> getColleges(
            @RequestParam(required = false) Long stateId,
            @RequestParam(required = false) Long examId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String govStatus,
            @RequestParam(required = false) String search) {
        List<College> colleges = collegeRepository.searchColleges(stateId, examId, city, govStatus, search);
        return ResponseEntity.ok(colleges);
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
            @RequestParam(required = false) Long branchId) {
        
        List<Cutoff> eligibleCutoffs = cutoffRepository.predictEligibleCutoffs(examId, rank, category, branchId);

        List<Map<String, Object>> results = new ArrayList<>();
        for (Cutoff c : eligibleCutoffs) {
            Map<String, Object> match = new HashMap<>();
            match.put("college", c.getCollege());
            match.put("branch", c.getBranch());
            match.put("exam", c.getExam());
            match.put("category", c.getCategory());
            match.put("year", c.getYear());
            match.put("closingRank", c.getClosingRank());
            match.put("userRank", rank);
            match.put("difference", c.getClosingRank() - rank);
            
            // Classification based on historical rank margins
            int margin = c.getClosingRank() - rank;
            if (margin >= 5000) {
                match.put("chanceCategory", "Strong Chance");
            } else if (margin >= 1000) {
                match.put("chanceCategory", "Possible");
            } else {
                match.put("chanceCategory", "Reach");
            }
            match.put("sourceReference", c.getSourceReference());
            results.add(match);
        }

        return ResponseEntity.ok(results);
    }
}
