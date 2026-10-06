package com.lwr.connecting.controller;

import com.lwr.connecting.entity.*;
import com.lwr.connecting.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCollegeManagerController {

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
    private ExamRepository examRepository;

    // --- COLLEGE CRUD ---
    @GetMapping("/colleges")
    public ResponseEntity<List<College>> getAllCollegesAdmin() {
        return ResponseEntity.ok(collegeRepository.findAll());
    }

    @PostMapping("/colleges")
    public ResponseEntity<College> createCollege(@RequestBody College college) {
        college.setId(null);
        if (college.getActive() == null) college.setActive(true);
        College saved = collegeRepository.save(college);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/colleges/{id}")
    public ResponseEntity<?> updateCollege(@PathVariable Long id, @RequestBody College updated) {
        Optional<College> existingOpt = collegeRepository.findById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        
        College existing = existingOpt.get();
        existing.setCode(updated.getCode());
        existing.setName(updated.getName());
        existing.setState(updated.getState());
        existing.setCity(updated.getCity());
        existing.setDistrict(updated.getDistrict());
        existing.setWebsite(updated.getWebsite());
        existing.setAdmissionAuthority(updated.getAdmissionAuthority());
        existing.setGovernmentStatus(updated.getGovernmentStatus());
        existing.setCollegeType(updated.getCollegeType());
        existing.setIsAutonomous(updated.getIsAutonomous());
        existing.setActive(updated.getActive());
        existing.setDescription(updated.getDescription());
        existing.setSourceReference(updated.getSourceReference());

        return ResponseEntity.ok(collegeRepository.save(existing));
    }

    @DeleteMapping("/colleges/{id}")
    public ResponseEntity<?> deleteCollege(@PathVariable Long id) {
        if (!collegeRepository.existsById(id)) return ResponseEntity.notFound().build();
        collegeRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // --- BRANCH CRUD ---
    @GetMapping("/branches")
    public ResponseEntity<List<Branch>> getAllBranchesAdmin() {
        return ResponseEntity.ok(branchRepository.findAll());
    }

    @PostMapping("/branches")
    public ResponseEntity<Branch> createBranch(@RequestBody Branch branch) {
        branch.setId(null);
        if (branch.getActive() == null) branch.setActive(true);
        return ResponseEntity.ok(branchRepository.save(branch));
    }

    @PutMapping("/branches/{id}")
    public ResponseEntity<?> updateBranch(@PathVariable Long id, @RequestBody Branch updated) {
        Optional<Branch> existingOpt = branchRepository.findById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        
        Branch existing = existingOpt.get();
        existing.setCode(updated.getCode());
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setActive(updated.getActive());
        
        return ResponseEntity.ok(branchRepository.save(existing));
    }

    // --- MAPPINGS ---
    @PostMapping("/colleges/{collegeId}/map-exam/{examId}")
    public ResponseEntity<?> mapCollegeToExam(@PathVariable Long collegeId, @PathVariable Long examId, @RequestParam(required = false) String notes) {
        Optional<College> collegeOpt = collegeRepository.findById(collegeId);
        Optional<Exam> examOpt = examRepository.findById(examId);
        if (collegeOpt.isEmpty() || examOpt.isEmpty()) return ResponseEntity.notFound().build();

        Optional<CollegeExamMapping> existing = collegeExamMappingRepository.findByCollegeIdAndExamId(collegeId, examId);
        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get());
        }

        CollegeExamMapping mapping = CollegeExamMapping.builder()
                .college(collegeOpt.get())
                .exam(examOpt.get())
                .notes(notes)
                .active(true)
                .build();
        return ResponseEntity.ok(collegeExamMappingRepository.save(mapping));
    }

    @PostMapping("/colleges/{collegeId}/map-branch/{branchId}")
    public ResponseEntity<?> mapCollegeToBranch(@PathVariable Long collegeId, @PathVariable Long branchId, @RequestParam(required = false) Integer intake) {
        Optional<College> collegeOpt = collegeRepository.findById(collegeId);
        Optional<Branch> branchOpt = branchRepository.findById(branchId);
        if (collegeOpt.isEmpty() || branchOpt.isEmpty()) return ResponseEntity.notFound().build();

        Optional<CollegeBranchMapping> existing = collegeBranchMappingRepository.findByCollegeIdAndBranchId(collegeId, branchId);
        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get());
        }

        CollegeBranchMapping mapping = CollegeBranchMapping.builder()
                .college(collegeOpt.get())
                .branch(branchOpt.get())
                .sanctionedIntake(intake)
                .active(true)
                .build();
        return ResponseEntity.ok(collegeBranchMappingRepository.save(mapping));
    }

    // --- CUTOFF CRUD ---
    @PostMapping("/cutoffs")
    public ResponseEntity<Cutoff> createCutoff(@RequestBody Cutoff cutoff) {
        cutoff.setId(null);
        if (cutoff.getActive() == null) cutoff.setActive(true);
        return ResponseEntity.ok(cutoffRepository.save(cutoff));
    }

    @PutMapping("/cutoffs/{id}")
    public ResponseEntity<?> updateCutoff(@PathVariable Long id, @RequestBody Cutoff updated) {
        Optional<Cutoff> existingOpt = cutoffRepository.findById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();

        Cutoff existing = existingOpt.get();
        existing.setExam(updated.getExam());
        existing.setCollege(updated.getCollege());
        existing.setBranch(updated.getBranch());
        existing.setYear(updated.getYear());
        existing.setCategory(updated.getCategory());
        existing.setGender(updated.getGender());
        existing.setQuota(updated.getQuota());
        existing.setRound(updated.getRound());
        existing.setOpeningRank(updated.getOpeningRank());
        existing.setClosingRank(updated.getClosingRank());
        existing.setScoreOrPercentile(updated.getScoreOrPercentile());
        existing.setSourceReference(updated.getSourceReference());
        existing.setActive(updated.getActive());

        return ResponseEntity.ok(cutoffRepository.save(existing));
    }

    @DeleteMapping("/cutoffs/{id}")
    public ResponseEntity<?> deleteCutoff(@PathVariable Long id) {
        if (!cutoffRepository.existsById(id)) return ResponseEntity.notFound().build();
        cutoffRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
