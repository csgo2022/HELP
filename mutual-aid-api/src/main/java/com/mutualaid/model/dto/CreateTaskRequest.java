package com.mutualaid.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateTaskRequest {
    @NotBlank(message = "服务类型不能为空")
    private String type;

    @NotBlank(message = "标题不能为空")
    private String title;

    private String description;
    private String address;
    private LocalDate appointmentDate;
    private String appointmentTime;
    private String duration;
    private BigDecimal rewardHours;
    private String remarks;
}
