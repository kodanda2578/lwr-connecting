package com.lwr.connecting.repository;

import com.lwr.connecting.entity.CollegeBranchMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollegeBranchMappingRepository extends JpaRepository<CollegeBranchMapping, Long> {
    List<CollegeBranchMapping> findByCollegeIdAndActiveTrue(Long collegeId);
    List<CollegeBranchMapping> findByBranchIdAndActiveTrue(Long branchId);
    Optional<CollegeBranchMapping> findByCollegeIdAndBranchId(Long collegeId, Long branchId);
}
