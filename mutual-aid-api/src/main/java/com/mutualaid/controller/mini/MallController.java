package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.MallProduct;
import com.mutualaid.security.CurrentUser;
import com.mutualaid.service.mini.MallService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mini/point-mall")
@RequiredArgsConstructor
public class MallController {

    private final MallService mallService;

    @GetMapping("/products")
    public ApiResponse<List<MallProduct>> getProducts() {
        return ApiResponse.success(mallService.getProducts());
    }

    @GetMapping("/balance")
    public ApiResponse<Integer> getBalance(@CurrentUser Long userId) {
        return ApiResponse.success(mallService.getPointsBalance(userId));
    }

    @GetMapping("/exchange-rate")
    public ApiResponse<Map<String, Object>> getExchangeRate() {
        return ApiResponse.success(mallService.getExchangeRate());
    }
}
