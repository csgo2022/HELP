package com.mutualaid.controller.mini;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.dto.HealthAnalysisResponse;
import com.mutualaid.model.entity.HealthRecord;
import com.mutualaid.repository.HealthRecordRepository;
import com.mutualaid.security.CurrentUser;
import com.mutualaid.service.mini.HealthAnalysisService;
import com.mutualaid.service.mini.OssUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mini/health-records")
@RequiredArgsConstructor
public class HealthController {

    private final HealthRecordRepository healthRecordRepository;
    private final HealthAnalysisService healthAnalysisService;
    private final OssUploadService ossUploadService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ApiResponse<List<HealthRecord>> getRecords(@CurrentUser Long userId) {
        return ApiResponse.success(healthRecordRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping
    public ApiResponse<HealthRecord> createRecord(@CurrentUser Long userId,
                                                   @RequestBody Map<String, String> body) {
        HealthRecord record = new HealthRecord();
        record.setUserId(userId);
        record.setImage(body.get("image"));
        record.setNote(body.get("note"));
        return ApiResponse.success(healthRecordRepository.save(record));
    }

    @PostMapping("/analyze")
    public ApiResponse<HealthAnalysisResponse> analyze(@CurrentUser Long userId,
                                                        @RequestParam("file") MultipartFile file) {
        try {
            // 1. 上传到 OSS
            String imageUrl = ossUploadService.uploadAvatar(file);

            // 2. OCR + DeepSeek 分析
            HealthAnalysisResponse result = healthAnalysisService.analyze(imageUrl);

            // 3. 保存记录（含分析结果）
            HealthRecord record = new HealthRecord();
            record.setUserId(userId);
            record.setImage(imageUrl);
            record.setAnalysisResult(objectMapper.writeValueAsString(result));
            healthRecordRepository.save(record);

            // 4. 返回分析结果
            return ApiResponse.success(result);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("分析失败: " + e.getMessage());
        }
    }
}
