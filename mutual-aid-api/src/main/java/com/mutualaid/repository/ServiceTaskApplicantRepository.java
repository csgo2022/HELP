package com.mutualaid.repository;

import com.mutualaid.model.entity.ServiceTaskApplicant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceTaskApplicantRepository extends JpaRepository<ServiceTaskApplicant, Long> {
    List<ServiceTaskApplicant> findByTaskId(Long taskId);
    List<ServiceTaskApplicant> findByVolunteerIdOrderByCreatedAtDesc(Long volunteerId);
    boolean existsByTaskIdAndVolunteerId(Long taskId, Long volunteerId);
}
