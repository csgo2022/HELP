package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.Announcement;
import com.mutualaid.service.mini.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mini/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ApiResponse<List<Announcement>> getAnnouncements() {
        return ApiResponse.success(announcementService.getPublishedAnnouncements());
    }

    @GetMapping("/{id}")
    public ApiResponse<Announcement> getAnnouncementDetail(@PathVariable Long id) {
        return ApiResponse.success(announcementService.getAnnouncementDetail(id));
    }
}
