package com.mutualaid.controller.mini;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.ElderlyFamily;
import com.mutualaid.repository.ElderlyFamilyRepository;
import com.mutualaid.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mini/family-bindings")
@RequiredArgsConstructor
public class FamilyController {

    private final ElderlyFamilyRepository familyRepository;

    @GetMapping
    public ApiResponse<List<ElderlyFamily>> getBindings(@CurrentUser Long userId) {
        return ApiResponse.success(familyRepository.findByUserId(userId));
    }

    @PostMapping
    public ApiResponse<ElderlyFamily> createBinding(@CurrentUser Long userId,
                                                     @RequestBody Map<String, String> body) {
        ElderlyFamily family = new ElderlyFamily();
        family.setUserId(userId);
        family.setFamilyName(body.get("familyName"));
        family.setFamilyPhone(body.get("familyPhone"));
        return ApiResponse.success(familyRepository.save(family));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBinding(@PathVariable Long id, @CurrentUser Long userId) {
        ElderlyFamily family = familyRepository.findById(id)
                .orElseThrow(() -> new BusinessException("绑定不存在"));
        if (!family.getUserId().equals(userId)) {
            throw new BusinessException("无权解绑");
        }
        familyRepository.delete(family);
        return ApiResponse.success();
    }
}
