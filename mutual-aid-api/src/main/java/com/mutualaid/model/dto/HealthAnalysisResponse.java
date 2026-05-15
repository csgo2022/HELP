package com.mutualaid.model.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class HealthAnalysisResponse {
    private List<Metric> metrics;
    private String summary;
    private List<String> advice;
    private String riskLevel; // normal / attention / warning

    @Data
    @Builder
    public static class Metric {
        private String name;
        private String value;
        private String unit;
        private String range;      // 正常参考范围
        private String status;     // 正常/偏高/偏低
    }
}
