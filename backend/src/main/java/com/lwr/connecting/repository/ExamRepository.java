package com.lwr.connecting.repository;

import com.lwr.connecting.entity.Exam;
import com.lwr.connecting.enums.ExamType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    Optional<Exam> findByCode(String code);
    List<Exam> findByActiveTrueOrderByNameAsc();
    List<Exam> findByTypeAndActiveTrue(ExamType type);
    List<Exam> findByStateIdAndActiveTrue(Long stateId);
}
