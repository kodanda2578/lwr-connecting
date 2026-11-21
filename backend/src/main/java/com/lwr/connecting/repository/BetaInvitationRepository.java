package com.lwr.connecting.repository;

import com.lwr.connecting.entity.BetaInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BetaInvitationRepository extends JpaRepository<BetaInvitation, Long> {
    Optional<BetaInvitation> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
    long countByStatus(String status);
    List<BetaInvitation> findAllByOrderByIssuedAtDesc();
    List<BetaInvitation> findByStatusOrderByIssuedAtDesc(String status);
    List<BetaInvitation> findByExpiresAtBeforeAndStatus(LocalDateTime now, String status);
}

