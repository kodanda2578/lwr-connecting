package com.lwr.connecting.repository;

import com.lwr.connecting.entity.QuestionValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuestionValidationRepository extends JpaRepository<QuestionValidation, Long> {
    Optional<QuestionValidation> findByQuestionId(Long questionId);
}
