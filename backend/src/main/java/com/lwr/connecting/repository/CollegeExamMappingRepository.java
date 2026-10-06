package com.lwr.connecting.repository;

import com.lwr.connecting.entity.CollegeExamMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollegeExamMappingRepository extends JpaRepository<CollegeExamMapping, Long> {
    List<CollegeExamMapping> findByCollegeIdAndActiveTrue(Long collegeId);
    List<CollegeExamMapping> findByExamIdAndActiveTrue(Long examId);
    Optional<CollegeExamMapping> findByCollegeIdAndExamId(Long collegeId, Long examId);
}
