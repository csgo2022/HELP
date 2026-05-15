package com.mutualaid.controller.admin;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.MallProduct;
import com.mutualaid.model.entity.Order;
import com.mutualaid.model.entity.OrderLogistics;
import com.mutualaid.repository.MallProductRepository;
import com.mutualaid.repository.OrderLogisticsRepository;
import com.mutualaid.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class OrderManageController {

    private final OrderRepository orderRepository;
    private final OrderLogisticsRepository logisticsRepository;
    private final MallProductRepository productRepository;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getOrders() {
        List<Order> orders = orderRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Order o : orders) {
            result.add(enrichOrder(o));
        }
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> getOrderDetail(@PathVariable Long id) {
        Order order = orderRepository.findById(id).orElseThrow();
        return ApiResponse.success(enrichOrder(order));
    }

    private Map<String, Object> enrichOrder(Order o) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", o.getId());
        m.put("orderNo", o.getOrderNo());
        m.put("userId", o.getUserId());
        m.put("productId", o.getProductId());
        m.put("quantity", o.getQuantity());
        m.put("totalPoints", o.getTotalPoints());
        m.put("status", o.getStatus());
        m.put("recipientName", o.getRecipientName());
        m.put("recipientPhone", o.getRecipientPhone());
        m.put("address", o.getAddress());
        m.put("courier", o.getCourier());
        m.put("trackingNo", o.getTrackingNo());
        m.put("createdAt", o.getCreatedAt());
        productRepository.findById(o.getProductId()).ifPresent(p -> {
            m.put("productName", p.getName());
            m.put("productImage", p.getImage());
        });
        return m;
    }

    @PutMapping("/{id}/logistics")
    public ApiResponse<Void> updateLogistics(@PathVariable Long id,
                                              @RequestBody Map<String, String> body) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setCourier(body.get("courier"));
        order.setCourierCode(body.get("courierCode"));
        order.setTrackingNo(body.get("trackingNo"));
        order.setStatus("SHIPPED");
        order.setLastKd100QueryTime(null);
        orderRepository.save(order);

        OrderLogistics log = new OrderLogistics();
        log.setOrderId(id);
        log.setTime(LocalDateTime.now());
        log.setStatus("已发货");
        log.setDescription("您的订单已通过" + body.get("courier") + "发出，运单号：" + body.get("trackingNo"));
        log.setSource("ADMIN");
        logisticsRepository.save(log);

        return ApiResponse.success();
    }
}
