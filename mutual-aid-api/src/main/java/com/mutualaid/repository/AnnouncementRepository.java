package com.mutualaid.repository;

import com.mutualaid.model.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByStatusOrderByIsTopDescDateDesc(String status);
}
