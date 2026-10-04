package com.lwr.connecting.repository;

import com.lwr.connecting.entity.MentorRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MentorRequestRepository extends JpaRepository<MentorRequest, Long> {
    List<MentorRequest> findByStudentId(Long studentId);
    List<MentorRequest> findByStatus(String status);
}
