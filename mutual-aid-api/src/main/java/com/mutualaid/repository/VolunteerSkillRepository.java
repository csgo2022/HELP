package com.mutualaid.repository;

import com.mutualaid.model.entity.VolunteerSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VolunteerSkillRepository extends JpaRepository<VolunteerSkill, Long> {
    List<VolunteerSkill> findByVolunteerId(Long volunteerId);

    @Modifying
    @Query("DELETE FROM VolunteerSkill vs WHERE vs.volunteerId = :volunteerId")
    void deleteByVolunteerId(@Param("volunteerId") Long volunteerId);
}
