package com.lwr.connecting.repository;

import com.lwr.connecting.entity.QuestionGenerationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionGenerationRequestRepository extends JpaRepository<QuestionGenerationRequest, Long> {
    List<QuestionGenerationRequest> findByStatusOrderByRequestedAtDesc(String status);
}
