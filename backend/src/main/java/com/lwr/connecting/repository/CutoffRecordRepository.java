package com.lwr.connecting.repository;

import com.lwr.connecting.entity.CutoffRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CutoffRecordRepository extends JpaRepository<CutoffRecord, Long> {
    List<CutoffRecord> findByExamAndCategoryAndBranchCode(String exam, String category, String branchCode);
}
