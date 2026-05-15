package com.mutualaid.repository;

import com.mutualaid.model.entity.ServiceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRecordRepository extends JpaRepository<ServiceRecord, Long> {
    List<ServiceRecord> findByVolunteerIdOrderByCreatedAtDesc(Long volunteerId);
}
