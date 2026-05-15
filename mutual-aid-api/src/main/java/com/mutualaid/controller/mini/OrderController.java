package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.Order;
import com.mutualaid.model.dto.LogisticsResponse;
import com.mutualaid.model.entity.OrderLogistics;
import com.mutualaid.repository.MallProductRepository;
import com.mutualaid.security.CurrentUser;
import com.mutualaid.service.mini.MallService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/mini/orders")
@RequiredArgsConstructor
public class OrderController {

    private final MallService mallService;
    private final MallProductRepository productRepository;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getMyOrders(@CurrentUser Long userId) {
        List<Order> orders = mallService.getMyOrders(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Order o : orders) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", o.getId());
            m.put("orderNo", o.getOrderNo());
            m.put("productId", o.getProductId());
            m.put("quantity", o.getQuantity());
            m.put("totalPoints", o.getTotalPoints());
            m.put("status", o.getStatus());
            m.put("recipientName", o.getRecipientName());
            m.put("address", o.getAddress());
            m.put("courier", o.getCourier());
            m.put("trackingNo", o.getTrackingNo());
            m.put("createdAt", o.getCreatedAt());
            productRepository.findById(o.getProductId()).ifPresent(p -> {
                m.put("productName", p.getName());
                m.put("productImage", p.getImage());
            });
            result.add(m);
        }
        return ApiResponse.success(result);
    }

    @PostMapping
    public ApiResponse<Order> createOrder(@CurrentUser Long userId, @RequestBody Map<String, Object> body) {
        Order order = mallService.createOrder(userId,
                Long.valueOf(body.get("productId").toString()),
                Integer.parseInt(body.get("quantity").toString()),
                (String) body.get("recipientName"),
                (String) body.get("recipientPhone"),
                (String) body.get("address"));
        return ApiResponse.success(order);
    }

    @GetMapping("/{id}")
    public ApiResponse<Order> getOrderDetail(@PathVariable Long id) {
        return ApiResponse.success(mallService.getOrderDetail(id));
    }

    @GetMapping("/{id}/logistics")
    public ApiResponse<LogisticsResponse> getLogistics(@PathVariable Long id) {
        return ApiResponse.success(mallService.getLogisticsEnriched(id));
    }
}
