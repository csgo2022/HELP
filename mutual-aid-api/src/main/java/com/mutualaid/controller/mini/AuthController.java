package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.dto.LoginRequest;
import com.mutualaid.model.dto.RegisterRequest;
import com.mutualaid.model.vo.LoginVO;
import com.mutualaid.service.mini.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mini/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginVO> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @PostMapping("/register")
    public ApiResponse<LoginVO> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginVO> refresh(@RequestBody Map<String, String> body) {
        return ApiResponse.success(authService.refresh(body.get("refreshToken")));
    }
}
