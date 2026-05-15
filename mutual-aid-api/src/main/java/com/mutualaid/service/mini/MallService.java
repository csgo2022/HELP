package com.mutualaid.service.mini;

import com.mutualaid.common.enums.CourierCodeEnum;
import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.dto.LogisticsResponse;
import com.mutualaid.model.entity.*;
import com.mutualaid.repository.*;
import com.mutualaid.service.express.Kuaidi100Client;
import com.mutualaid.service.express.Kuaidi100Response;
import com.mutualaid.config.Kuaidi100Properties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MallService {

    private final MallProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderLogisticsRepository logisticsRepository;
    private final Kuaidi100Client kuaidi100Client;
    private final Kuaidi100Properties kuaidi100Properties;
    private final PointTransactionRepository pointTransactionRepository;
    private final UserRepository userRepository;
    private final SysConfigRepository sysConfigRepository;

    public List<MallProduct> getProducts() {
        return productRepository.findByStatus("ON_SHELF");
    }

    public Integer getPointsBalance(Long userId) {
        return userRepository.findById(userId)
                .map(User::getPoints)
                .orElse(0);
    }

    @Transactional
    public Order createOrder(Long userId, Long productId, int quantity,
                              String recipientName, String recipientPhone, String address) {
        MallProduct product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException("商品不存在"));

        if (product.getStock() < quantity) {
            throw new BusinessException("库存不足");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        int totalPoints = product.getPointsRequired() * quantity;
        if (user.getPoints() < totalPoints) {
            throw new BusinessException("积分不足");
        }

        user.setPoints(user.getPoints() - totalPoints);
        userRepository.save(user);

        product.setStock(product.getStock() - quantity);
        productRepository.save(product);

        Order order = new Order();
        order.setOrderNo("ORD" + System.currentTimeMillis());
        order.setUserId(userId);
        order.setProductId(productId);
        order.setQuantity(quantity);
        order.setTotalPoints(totalPoints);
        order.setRecipientName(recipientName);
        order.setRecipientPhone(recipientPhone);
        order.setAddress(address);
        order.setStatus("PENDING");
        order = orderRepository.save(order);

        PointTransaction pt = new PointTransaction();
        pt.setUserId(userId);
        pt.setType("SPEND");
        pt.setAmount(totalPoints);
        pt.setBalanceAfter(user.getPoints());
        pt.setReferenceType("ORDER");
        pt.setReferenceId(order.getId());
        pointTransactionRepository.save(pt);

        return order;
    }

    public List<Order> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Order getOrderDetail(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException("订单不存在"));
    }

    public Map<String, Object> getExchangeRate() {
        Integer rate = 10; // default: 1h = 10 points
        SysConfig config = sysConfigRepository.findByConfigKey("point_exchange_rate").orElse(null);
        if (config != null && config.getConfigValue() != null) {
            try {
                rate = Integer.parseInt(config.getConfigValue());
            } catch (NumberFormatException ignored) {}
        }
        return Map.of("hoursPerPoint", 1.0 / rate, "pointsPerHour", rate);
    }

    public List<OrderLogistics> getLogistics(Long orderId) {
        return logisticsRepository.findByOrderIdOrderByTimeAsc(orderId);
    }

    public LogisticsResponse getLogisticsEnriched(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("订单不存在"));

        // 兜底：如果 courierCode 为空但有中文名，尝试从枚举映射
        if (order.getCourierCode() == null && order.getCourier() != null) {
            String code = CourierCodeEnum.getCode(order.getCourier());
            if (code != null) {
                order.setCourierCode(code);
                orderRepository.save(order);
            }
        }

        List<OrderLogistics> localEvents = logisticsRepository
                .findByOrderIdOrderByTimeAsc(orderId);

        Kuaidi100Response response = null;
        if (shouldQueryKuaidi100(order)) {
            boolean querySuccess = false;
            try {
                String phone = "shunfeng".equals(order.getCourierCode()) ? order.getRecipientPhone() : null;
                // 从地址中提取城市信息，用于 maptrack.do 的 to 参数
                String toCity = extractCity(order.getAddress());
                response = kuaidi100Client.queryTracking(
                        order.getCourierCode(), order.getTrackingNo(), phone, null, toCity);

                if (response != null && "200".equals(response.getStatus())
                        && response.getData() != null && !response.getData().isEmpty()) {
                    mergeTrackEvents(orderId, response, localEvents);
                    localEvents = logisticsRepository
                            .findByOrderIdOrderByTimeAsc(orderId);
                    querySuccess = true;
                }
            } catch (Exception e) {
                log.warn("Kuaidi100 query failed for order {}, using cached data", orderId, e);
            }

            if (querySuccess) {
                order.setLastKd100QueryTime(LocalDateTime.now());
                // 保存地图轨迹数据到订单
                if (response != null) {
                    order.setTrailUrl(response.getTrailUrl());
                    if (response.getRouteInfo() != null) {
                        Kuaidi100Response.RouteInfo ri = response.getRouteInfo();
                        order.setRouteFrom(ri.getFrom() != null ? ri.getFrom().getName() : null);
                        order.setRouteCur(ri.getCur() != null ? ri.getCur().getName() : null);
                        order.setRouteTo(ri.getTo() != null ? ri.getTo().getName() : null);
                    }
                }
                orderRepository.save(order);
            }
        }

        // 构建时间线事件
        List<LogisticsResponse.Event> events = buildEvents(localEvents);
        String latestStatus = events.isEmpty() ? "" : events.get(0).getStatus();

        // 读取地图轨迹数据（优先用API新取的数据，否则用数据库里存的）
        String trailUrl = response != null ? response.getTrailUrl() : order.getTrailUrl();
        String routeFrom = order.getRouteFrom();
        String routeCur = order.getRouteCur();
        String routeTo = order.getRouteTo();

        return LogisticsResponse.builder()
                .orderId(orderId)
                .courier(order.getCourier())
                .courierCode(order.getCourierCode())
                .trackingNo(order.getTrackingNo())
                .address(order.getAddress())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .status(latestStatus)
                .events(events)
                .trailUrl(trailUrl)
                .routeFrom(routeFrom)
                .routeCur(routeCur)
                .routeTo(routeTo)
                .build();
    }

    private boolean shouldQueryKuaidi100(Order order) {
        if (order.getCourierCode() == null || order.getTrackingNo() == null) {
            return false;
        }
        if (order.getLastKd100QueryTime() == null) {
            return true;
        }
        return order.getLastKd100QueryTime()
                .plusMinutes(kuaidi100Properties.getCacheMinutes())
                .isBefore(LocalDateTime.now());
    }

    private void mergeTrackEvents(Long orderId, Kuaidi100Response response,
                                   List<OrderLogistics> existing) {
        Set<String> existingFingerprints = existing.stream()
                .map(e -> e.getTime().toString() + "|" + e.getDescription())
                .collect(Collectors.toSet());

        List<OrderLogistics> newEvents = new ArrayList<>();
        for (Kuaidi100Response.TrackItem item : response.getData()) {
            try {
                LocalDateTime eventTime = LocalDateTime.parse(
                        item.getTime(),
                        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

                String fingerprint = eventTime.toString() + "|" + item.getContext();
                if (!existingFingerprints.contains(fingerprint)) {
                    OrderLogistics log = new OrderLogistics();
                    log.setOrderId(orderId);
                    log.setTime(eventTime);
                    log.setStatus(Kuaidi100Response.stateToText(response.getState()));
                    log.setDescription(item.getContext());
                    log.setSource("KD100");
                    newEvents.add(log);
                    existingFingerprints.add(fingerprint);
                }
            } catch (Exception e) {
                log.warn("Failed to parse track item: {}", item.getTime(), e);
            }
        }

        if (!newEvents.isEmpty()) {
            logisticsRepository.saveAll(newEvents);
        }
    }

    private List<LogisticsResponse.Event> buildEvents(List<OrderLogistics> events) {
        List<LogisticsResponse.Event> result = new ArrayList<>();
        for (int i = 0; i < events.size(); i++) {
            OrderLogistics e = events.get(i);
            result.add(LogisticsResponse.Event.builder()
                    .time(e.getTime() != null ? e.getTime().toString() : "")
                    .status(e.getStatus())
                    .description(e.getDescription())
                    .source(e.getSource())
                    .isLatest(i == events.size() - 1)
                    .build());
        }
        Collections.reverse(result);
        return result;
    }

    /**
     * 从地址中提取城市信息，格式如 "江西省-南昌市"
     * 例："江西省南昌市东湖区北京西路..." → "江西省,南昌市"
     */
    private String extractCity(String address) {
        if (address == null || address.isEmpty()) return null;
        StringBuilder sb = new StringBuilder();
        int provinceEnd = address.indexOf("省");
        if (provinceEnd > 0) {
            sb.append(address, 0, provinceEnd + 1).append(",");
        }
        int cityEnd = address.indexOf("市");
        if (cityEnd > 0 && (provinceEnd < 0 || cityEnd > provinceEnd)) {
            String rest = provinceEnd > 0 ? address.substring(provinceEnd + 1) : address;
            int localCityEnd = rest.indexOf("市");
            if (localCityEnd > 0) {
                sb.append(rest, 0, localCityEnd + 1);
                return sb.toString();
            }
        }
        return null;
    }
}
