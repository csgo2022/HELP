package com.mutualaid.controller.admin;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;
    private final ServiceTaskRepository taskRepository;
    private final OrderRepository orderRepository;
    private final AnnouncementRepository announcementRepository;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVolunteers", userRepository.countByRole("VOLUNTEER"));
        stats.put("totalElderly", userRepository.countByRole("ELDERLY"));
        stats.put("pendingTasks", taskRepository.countByStatus("PENDING"));
        stats.put("inProgressTasks", taskRepository.countByStatus("IN_PROGRESS"));
        stats.put("completedTasks", taskRepository.countByStatus("COMPLETED"));
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalAnnouncements", announcementRepository.count());
        return ApiResponse.success(stats);
    }
}
