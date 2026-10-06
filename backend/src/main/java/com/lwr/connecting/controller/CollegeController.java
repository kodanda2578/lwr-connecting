package com.lwr.connecting.controller;

import com.lwr.connecting.entity.College;
import com.lwr.connecting.entity.CutoffRecord;
import com.lwr.connecting.repository.CollegeRepository;
import com.lwr.connecting.repository.CutoffRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/colleges")
public class CollegeController {

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private CutoffRecordRepository cutoffRecordRepository;

    @GetMapping
    public List<College> getAllColleges() {
        return collegeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<College> getCollegeById(@PathVariable Long id) {
        return collegeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/predictor")
    public ResponseEntity<List<Map<String, Object>>> predictColleges(@RequestBody Map<String, Object> request) {
        String exam = (String) request.getOrDefault("exam", "AP_EAPCET");
        Integer rank = Integer.parseInt(request.getOrDefault("rank", "5000").toString());
        String category = (String) request.getOrDefault("category", "OC_BOYS");
        String branch = (String) request.getOrDefault("branch", "CSE");

        List<CutoffRecord> records = cutoffRecordRepository.findByExamAndCategoryAndBranchCode(exam, category, branch);
        List<Map<String, Object>> response = new ArrayList<>();

        for (CutoffRecord r : records) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("collegeName", r.getCollegeName());
            map.put("collegeCode", r.getCollegeCode());
            map.put("branchName", r.getBranchName());
            map.put("branchCode", r.getBranchCode());
            map.put("openingRank", r.getOpeningRank());
            map.put("closingRank", r.getClosingRank());
            map.put("year", r.getYear());
            map.put("round", r.getCounsellingRound());
            map.put("source", r.getSource());

            if (rank <= r.getClosingRank() * 0.8) {
                map.put("matchStatus", "Above Previous Closing Rank");
            } else if (rank <= r.getClosingRank()) {
                map.put("matchStatus", "Within Previous Cutoff Range");
            } else {
                map.put("matchStatus", "Below Previous Closing Rank");
            }

            response.add(map);
        }

        return ResponseEntity.ok(response);
    }
}
