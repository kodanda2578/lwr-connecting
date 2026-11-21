package com.lwr.connecting.repository;

import com.lwr.connecting.entity.GuidanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuidanceRequestRepository extends JpaRepository<GuidanceRequest, Long> {

    List<GuidanceRequest> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<GuidanceRequest> findAllByOrderByCreatedAtDesc();

    List<GuidanceRequest> findByStatusOrderByCreatedAtDesc(String status);

    long countByStatus(String status);

    @Query("SELECT r FROM GuidanceRequest r WHERE (:status IS NULL OR r.status = :status) ORDER BY r.createdAt DESC")
    List<GuidanceRequest> filterRequests(@Param("status") String status);
}
