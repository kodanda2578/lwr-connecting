package com.lwr.connecting.repository;

import com.lwr.connecting.entity.College;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CollegeRepository extends JpaRepository<College, Integer> {
    Optional<College> findByCode(String code);
}
