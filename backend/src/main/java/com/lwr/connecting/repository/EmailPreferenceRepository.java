package com.lwr.connecting.repository;

import com.lwr.connecting.entity.EmailPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmailPreferenceRepository extends JpaRepository<EmailPreference, Long> {
    Optional<EmailPreference> findByUserId(Long userId);
}
