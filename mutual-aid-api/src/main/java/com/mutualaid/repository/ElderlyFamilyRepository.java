package com.mutualaid.repository;

import com.mutualaid.model.entity.ElderlyFamily;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ElderlyFamilyRepository extends JpaRepository<ElderlyFamily, Long> {
    List<ElderlyFamily> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
