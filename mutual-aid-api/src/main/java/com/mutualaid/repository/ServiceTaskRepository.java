package com.mutualaid.repository;

import com.mutualaid.model.entity.ServiceTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ServiceTaskRepository extends JpaRepository<ServiceTask, Long> {
    List<ServiceTask> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);
    List<ServiceTask> findByVolunteerId(Long volunteerId);
    List<ServiceTask> findByVolunteerIdAndStatusAndUpdatedAtAfter(Long volunteerId, String status, LocalDateTime after);
    List<ServiceTask> findByStatus(String status);
    List<ServiceTask> findByIdIn(List<Long> ids);
    long countByStatus(String status);
}
