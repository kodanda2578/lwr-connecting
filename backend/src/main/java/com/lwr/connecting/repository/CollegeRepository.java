package com.lwr.connecting.repository;

import com.lwr.connecting.entity.College;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollegeRepository extends JpaRepository<College, Long> {

    Optional<College> findByCode(String code);

    List<College> findByStateIdAndActiveTrueOrderByNameAsc(Long stateId);

    List<College> findByActiveTrueOrderByNameAsc();

    @Query("SELECT DISTINCT c FROM College c " +
           "LEFT JOIN CollegeExamMapping cem ON cem.college = c " +
           "WHERE c.active = true " +
           "AND (:stateId IS NULL OR c.state.id = :stateId) " +
           "AND (:examId IS NULL OR cem.exam.id = :examId) " +
           "AND (:city IS NULL OR LOWER(c.city) LIKE LOWER(CONCAT('%', :city, '%'))) " +
           "AND (:govStatus IS NULL OR LOWER(c.governmentStatus) LIKE LOWER(CONCAT('%', :govStatus, '%'))) " +
           "AND (:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.city) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.stateText) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY c.name ASC")
    List<College> searchColleges(
            @Param("stateId") Long stateId,
            @Param("examId") Long examId,
            @Param("city") String city,
            @Param("govStatus") String govStatus,
            @Param("search") String search
    );

    @Query("SELECT DISTINCT c FROM College c " +
           "LEFT JOIN CollegeExamMapping cem ON cem.college = c " +
           "LEFT JOIN CollegeBranchMapping cbm ON cbm.college = c " +
           "WHERE c.active = true " +
           "AND (:stateId IS NULL OR c.state.id = :stateId) " +
           "AND (:examId IS NULL OR cem.exam.id = :examId) " +
           "AND (:branchId IS NULL OR cbm.branch.id = :branchId) " +
           "AND (:city IS NULL OR LOWER(c.city) LIKE LOWER(CONCAT('%', :city, '%')) OR LOWER(c.district) LIKE LOWER(CONCAT('%', :city, '%'))) " +
           "AND (:govStatus IS NULL OR LOWER(c.governmentStatus) LIKE LOWER(CONCAT('%', :govStatus, '%')) OR LOWER(c.collegeType) LIKE LOWER(CONCAT('%', :govStatus, '%'))) " +
           "AND (:collegeType IS NULL OR LOWER(c.collegeType) LIKE LOWER(CONCAT('%', :collegeType, '%'))) " +
           "AND (:affiliation IS NULL OR LOWER(c.affiliation) LIKE LOWER(CONCAT('%', :affiliation, '%'))) " +
           "AND (:accreditation IS NULL OR LOWER(c.accreditation) LIKE LOWER(CONCAT('%', :accreditation, '%'))) " +
           "AND (:search IS NULL OR " +
           "     LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(c.city) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(c.district) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(c.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(c.stateText) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     (c.affiliation IS NOT NULL AND LOWER(c.affiliation) LIKE LOWER(CONCAT('%', :search, '%'))) OR " +
           "     (c.accreditation IS NOT NULL AND LOWER(c.accreditation) LIKE LOWER(CONCAT('%', :search, '%'))) OR " +
           "     (c.pincode IS NOT NULL AND c.pincode LIKE CONCAT('%', :search, '%'))) " +
           "ORDER BY c.name ASC")
    List<College> searchCollegesAdvanced(
            @Param("stateId") Long stateId,
            @Param("examId") Long examId,
            @Param("branchId") Long branchId,
            @Param("city") String city,
            @Param("govStatus") String govStatus,
            @Param("collegeType") String collegeType,
            @Param("affiliation") String affiliation,
            @Param("accreditation") String accreditation,
            @Param("search") String search
    );
}
