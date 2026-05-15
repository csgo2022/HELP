package com.mutualaid.controller.admin;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.dto.LoginRequest;
import com.mutualaid.model.vo.LoginVO;
import com.mutualaid.service.mini.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginVO> login(@Valid @RequestBody LoginRequest request) {
        LoginVO vo = authService.login(request);
        if (!"ADMIN".equals(vo.getRole())) {
            return ApiResponse.error(403, "无权登录管理后台");
        }
        return ApiResponse.success(vo);
    }
}
