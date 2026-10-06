package com.lwr.connecting.repository;

import com.lwr.connecting.entity.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {
    List<TestAttempt> findByUserIdOrderByStartTimeDesc(Long userId);
    List<TestAttempt> findByTestIdOrderByScoreDesc(Long testId);
    java.util.Optional<TestAttempt> findFirstByUserIdAndTestIdAndStatus(Long userId, Long testId, com.lwr.connecting.enums.AttemptStatus status);
}
