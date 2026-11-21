package com.lwr.connecting.repository;

import com.lwr.connecting.entity.BetaFeedback;
import com.lwr.connecting.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BetaFeedbackRepository extends JpaRepository<BetaFeedback, Long> {
    List<BetaFeedback> findAllByOrderByCreatedAtDesc();
    List<BetaFeedback> findByStudentOrderByCreatedAtDesc(User student);
    List<BetaFeedback> findByStatusOrderByCreatedAtDesc(String status);
    List<BetaFeedback> findByCategoryOrderByCreatedAtDesc(String category);
    long countByStatus(String status);
    long countByCategory(String category);
    long countByBugSeverity(String bugSeverity);
}
