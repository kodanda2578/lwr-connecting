package com.lwr.connecting.repository;

import com.lwr.connecting.entity.EmailEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmailEventRepository extends JpaRepository<EmailEvent, Long> {
    Optional<EmailEvent> findByIdempotencyKey(String idempotencyKey);
    Boolean existsByIdempotencyKeyAndStatus(String idempotencyKey, String status);
}
