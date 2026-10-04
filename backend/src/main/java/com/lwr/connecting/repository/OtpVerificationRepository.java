package com.lwr.connecting.repository;

import com.lwr.connecting.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findFirstByUserIdAndPurposeAndVerifiedFalseOrderByCreatedAtDesc(Long userId, String purpose);
}
