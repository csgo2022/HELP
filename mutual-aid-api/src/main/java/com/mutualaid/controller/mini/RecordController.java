package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.dto.ReviewRequest;
import com.mutualaid.model.entity.ServiceRecord;
import com.mutualaid.security.CurrentUser;
import com.mutualaid.service.mini.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mini/records")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService recordService;

    @GetMapping
    public ApiResponse<List<ServiceRecord>> getMyRecords(@CurrentUser Long userId) {
        return ApiResponse.success(recordService.getMyRecords(userId));
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getTodayStats(@CurrentUser Long userId) {
        return ApiResponse.success(recordService.getTodayStats(userId));
    }

    @GetMapping("/{id}")
    public ApiResponse<ServiceRecord> getRecordDetail(@PathVariable Long id) {
        return ApiResponse.success(recordService.getRecordDetail(id));
    }

    @PostMapping("/{id}/review")
    public ApiResponse<Void> submitReview(@CurrentUser Long userId,
                                          @PathVariable Long id,
                                          @RequestBody ReviewRequest request) {
        recordService.submitReview(userId, request.getTaskId(), request.getToUserId(), request.getRating(), request.getComment());
        return ApiResponse.success();
    }
}
