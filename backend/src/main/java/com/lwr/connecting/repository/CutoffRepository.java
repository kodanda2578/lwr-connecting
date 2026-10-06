package com.lwr.connecting.repository;

import com.lwr.connecting.entity.Cutoff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CutoffRepository extends JpaRepository<Cutoff, Long> {

    List<Cutoff> findByCollegeIdAndActiveTrueOrderByYearDesc(Long collegeId);

    List<Cutoff> findByExamIdAndActiveTrueOrderByClosingRankAsc(Long examId);

    @Query("SELECT c FROM Cutoff c WHERE c.active = true " +
           "AND (:examId IS NULL OR c.exam.id = :examId) " +
           "AND (:collegeId IS NULL OR c.college.id = :collegeId) " +
           "AND (:branchId IS NULL OR c.branch.id = :branchId) " +
           "AND (:year IS NULL OR c.year = :year) " +
           "AND (:category IS NULL OR LOWER(c.category) = LOWER(:category)) " +
           "AND (:gender IS NULL OR LOWER(c.gender) = LOWER(:gender)) " +
           "ORDER BY c.year DESC, c.closingRank ASC")
    List<Cutoff> searchCutoffs(
            @Param("examId") Long examId,
            @Param("collegeId") Long collegeId,
            @Param("branchId") Long branchId,
            @Param("year") Integer year,
            @Param("category") String category,
            @Param("gender") String gender
    );

    @Query("SELECT c FROM Cutoff c WHERE c.active = true " +
           "AND c.exam.id = :examId " +
           "AND (:category IS NULL OR LOWER(c.category) = LOWER(:category)) " +
           "AND (:branchId IS NULL OR c.branch.id = :branchId) " +
           "AND c.closingRank >= :userRank " +
           "ORDER BY c.closingRank ASC")
    List<Cutoff> predictEligibleCutoffs(
            @Param("examId") Long examId,
            @Param("userRank") Integer userRank,
            @Param("category") String category,
            @Param("branchId") Long branchId
    );
}
