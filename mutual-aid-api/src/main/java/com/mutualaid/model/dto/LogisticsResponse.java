package com.mutualaid.model.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class LogisticsResponse {
    private Long orderId;
    private String courier;
    private String courierCode;
    private String trackingNo;
    private String address;
    private String recipientName;
    private String recipientPhone;
    private String status;
    private List<Event> events;

    // 地图轨迹新增字段
    private String trailUrl;
    private List<MapPoint> routePoints;
    private String routeFrom;
    private String routeCur;
    private String routeTo;

    @Data
    @Builder
    public static class Event {
        private String time;
        private String status;
        private String description;
        private String source;
        private boolean isLatest;
    }

    @Data
    @Builder
    public static class MapPoint {
        private double lng;
        private double lat;
        private String name;
        private String time;
    }
}
