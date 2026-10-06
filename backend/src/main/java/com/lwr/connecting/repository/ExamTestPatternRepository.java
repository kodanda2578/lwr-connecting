package com.lwr.connecting.repository;

import com.lwr.connecting.entity.ExamTestPattern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamTestPatternRepository extends JpaRepository<ExamTestPattern, Long> {
    List<ExamTestPattern> findByExamId(Long examId);
}
