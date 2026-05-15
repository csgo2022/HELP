package com.mutualaid.controller.admin;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.common.response.PageResult;
import com.mutualaid.model.entity.User;
import com.mutualaid.model.entity.UserRealnameAuth;
import com.mutualaid.service.admin.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class UserManageController {

    private final AdminUserService adminUserService;

    @GetMapping("/users")
    public ApiResponse<PageResult<User>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page - 1, size);
        Page<User> userPage = adminUserService.getUsers(keyword, role, pageable);
        return ApiResponse.success(PageResult.of(userPage, userPage.getContent()));
    }

    @GetMapping("/users/{id}")
    public ApiResponse<User> getUserDetail(@PathVariable Long id) {
        return ApiResponse.success(adminUserService.getUserDetail(id));
    }

    @PutMapping("/users/{id}/status")
    public ApiResponse<Void> toggleUserStatus(@PathVariable Long id) {
        adminUserService.toggleUserStatus(id);
        return ApiResponse.success();
    }

    @GetMapping("/realname-auth/list")
    public ApiResponse<List<UserRealnameAuth>> getPendingRealnameAuths() {
        return ApiResponse.success(adminUserService.getPendingRealnameAuths());
    }

    @PutMapping("/realname-auth/{id}")
    public ApiResponse<Void> reviewRealnameAuth(@PathVariable Long id,
                                                 @RequestBody Map<String, String> body) {
        adminUserService.reviewRealnameAuth(id, body.get("status"), body.get("rejectReason"));
        return ApiResponse.success();
    }
}
