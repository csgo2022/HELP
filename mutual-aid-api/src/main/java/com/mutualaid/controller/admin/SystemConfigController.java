package com.mutualaid.controller.admin;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.SysConfig;
import com.mutualaid.repository.SysConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class SystemConfigController {

    private final SysConfigRepository sysConfigRepository;

    @GetMapping
    public ApiResponse<List<SysConfig>> getSettings() {
        return ApiResponse.success(sysConfigRepository.findAll());
    }

    @PutMapping
    public ApiResponse<Void> updateSettings(@RequestBody Map<String, String> body) {
        body.forEach((key, value) -> {
            SysConfig config = sysConfigRepository.findByConfigKey(key).orElse(null);
            if (config != null) {
                config.setConfigValue(value);
                sysConfigRepository.save(config);
            }
        });
        return ApiResponse.success();
    }
}
