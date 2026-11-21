package com.lwr.connecting.repository;

import com.lwr.connecting.entity.BetaAccessConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BetaAccessConfigRepository extends JpaRepository<BetaAccessConfig, Long> {
    Optional<BetaAccessConfig> findTopByOrderByIdAsc();
}

