package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.dto.AiGuidanceResponse;
import com.mutualaid.service.mini.AiGuidanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mini/ai")
@RequiredArgsConstructor
public class AiGuidanceController {

    private final AiGuidanceService aiGuidanceService;

    @GetMapping("/guidance")
    public ApiResponse<AiGuidanceResponse> getGuidance(@RequestParam Long taskId) {
        return ApiResponse.success(aiGuidanceService.getGuidance(taskId));
    }
}
