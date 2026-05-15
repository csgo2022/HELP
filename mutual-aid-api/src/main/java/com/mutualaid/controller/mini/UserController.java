package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.dto.UserProfileUpdateRequest;
import com.mutualaid.model.vo.UserProfileVO;
import com.mutualaid.security.CurrentUser;
import com.mutualaid.service.mini.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mini/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ApiResponse<UserProfileVO> getProfile(@CurrentUser Long userId) {
        return ApiResponse.success(userService.getProfile(userId));
    }

    @GetMapping("/{id}")
    public ApiResponse<UserProfileVO> getUserById(@PathVariable Long id) {
        return ApiResponse.success(userService.getProfile(id));
    }

    @PutMapping("/profile")
    public ApiResponse<Void> updateProfile(@CurrentUser Long userId,
                                           @Valid @RequestBody UserProfileUpdateRequest request) {
        userService.updateProfile(userId, request);
        return ApiResponse.success();
    }

    @PutMapping("/password")
    public ApiResponse<Void> changePassword(@CurrentUser Long userId,
                                            @RequestBody Map<String, String> body) {
        userService.changePassword(userId, body.get("oldPassword"), body.get("newPassword"));
        return ApiResponse.success();
    }

    @PutMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@RequestBody Map<String, String> body) {
        userService.resetPassword(body.get("phone"), body.get("newPassword"));
        return ApiResponse.success();
    }

    @DeleteMapping("/account")
    public ApiResponse<Void> deleteAccount(@CurrentUser Long userId) {
        userService.deleteAccount(userId);
        return ApiResponse.success();
    }

    @PostMapping("/realname-auth")
    public ApiResponse<Void> submitRealnameAuth(@CurrentUser Long userId,
                                                @RequestBody Map<String, String> body) {
        userService.submitRealnameAuth(userId, body.get("realName"), body.get("idCard"));
        return ApiResponse.success();
    }

    @PutMapping("/skills")
    public ApiResponse<Void> updateSkills(@CurrentUser Long userId,
                                          @RequestBody Map<String, Object> body) {
        List<Long> skillIds = new ArrayList<>();
        if (body.get("skillIds") instanceof List) {
            ((List<?>) body.get("skillIds")).forEach(v -> {
                if (v instanceof Number) skillIds.add(((Number) v).longValue());
            });
        }
        userService.updateSkills(userId, skillIds, (String) body.get("description"));
        return ApiResponse.success();
    }

    @GetMapping("/skills")
    public ApiResponse<List<com.mutualaid.model.entity.Skill>> getAllSkills() {
        return ApiResponse.success(userService.getAllSkills());
    }
}
