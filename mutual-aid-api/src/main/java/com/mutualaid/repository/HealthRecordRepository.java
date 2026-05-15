package com.mutualaid.repository;

import com.mutualaid.model.entity.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {
    List<HealthRecord> findByUserIdOrderByCreatedAtDesc(Long userId);
}
