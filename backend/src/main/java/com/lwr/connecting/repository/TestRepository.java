package com.lwr.connecting.repository;

import com.lwr.connecting.entity.Test;
import com.lwr.connecting.enums.TestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestRepository extends JpaRepository<Test, Long> {
    List<Test> findByExamIdAndActiveTrue(Long examId);
    List<Test> findByTestTypeAndActiveTrue(TestType testType);
    List<Test> findByActiveTrueOrderByCreatedDateDesc();
}
