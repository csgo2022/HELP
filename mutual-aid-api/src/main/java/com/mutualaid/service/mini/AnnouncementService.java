package com.mutualaid.service.mini;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.entity.Announcement;
import com.mutualaid.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public List<Announcement> getPublishedAnnouncements() {
        return announcementRepository.findByStatusOrderByIsTopDescDateDesc("PUBLISHED");
    }

    @Transactional
    public Announcement getAnnouncementDetail(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new BusinessException("公告不存在"));
        announcement.setViews(announcement.getViews() + 1);
        return announcementRepository.save(announcement);
    }
}
