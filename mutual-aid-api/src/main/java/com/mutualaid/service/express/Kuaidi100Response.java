package com.mutualaid.service.express;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class Kuaidi100Response {
    private String status;
    private String message;
    private String state;
    private String com;
    private String nu;
    private List<TrackItem> data;

    // 地图轨迹新增字段
    private String trailUrl;
    private RouteInfo routeInfo;
    private List<PredictedRouteItem> predictedRoute;

    @Data
    public static class TrackItem {
        private String time;
        private String context;
        private String ftime;
        private String status;
        private String areaCode;
        private String areaName;
        private String areaCenter; // "116.407526,39.904030" 格式 (lng,lat)
    }

    @Data
    public static class RouteInfo {
        private Position from;
        private Position cur;
        private Position to;
    }

    @Data
    public static class Position {
        private String number;
        private String name;
    }

    @Data
    public static class PredictedRouteItem {
        private String arriveTime;
        private String leaveTime;
        private String province;
        private String city;
        private String district;
        private String name;
        private String state;   // already passed / currently at / estimated pass-through
        private String type;    // 转运中心 / 网点
    }

    public static String stateToText(String state) {
        if (state == null) return "在途";
        return switch (state) {
            case "0" -> "在途";
            case "1" -> "已揽收";
            case "2" -> "疑难";
            case "3" -> "已签收";
            case "4" -> "已退签";
            case "5" -> "派送中";
            case "6" -> "已退回";
            default -> "在途";
        };
    }
}
