package com.mutualaid.controller.admin;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.Announcement;
import com.mutualaid.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/announcements")
@RequiredArgsConstructor
public class AnnouncementManageController {

    private final AnnouncementRepository announcementRepository;

    @GetMapping
    public ApiResponse<Page<Announcement>> getAnnouncements(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(announcementRepository.findAll(PageRequest.of(page - 1, size)));
    }

    @PostMapping
    public ApiResponse<Announcement> createAnnouncement(@RequestBody Map<String, Object> body) {
        Announcement announcement = new Announcement();
        announcement.setTitle((String) body.get("title"));
        announcement.setContent((String) body.get("content"));
        announcement.setCategory((String) body.get("category"));
        announcement.setPublisher((String) body.get("publisher"));
        announcement.setDate(LocalDate.now());
        announcement.setIsTop(Boolean.TRUE.equals(body.get("isTop")));
        return ApiResponse.success(announcementRepository.save(announcement));
    }

    @PutMapping("/{id}")
    public ApiResponse<Announcement> updateAnnouncement(@PathVariable Long id,
                                                         @RequestBody Map<String, Object> body) {
        Announcement announcement = announcementRepository.findById(id).orElseThrow();
        if (body.containsKey("title")) announcement.setTitle((String) body.get("title"));
        if (body.containsKey("content")) announcement.setContent((String) body.get("content"));
        if (body.containsKey("category")) announcement.setCategory((String) body.get("category"));
        if (body.containsKey("isTop")) announcement.setIsTop(Boolean.TRUE.equals(body.get("isTop")));
        if (body.containsKey("status")) announcement.setStatus((String) body.get("status"));
        return ApiResponse.success(announcementRepository.save(announcement));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementRepository.deleteById(id);
        return ApiResponse.success();
    }
}
