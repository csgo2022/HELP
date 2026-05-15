package com.mutualaid.model.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ApplicantVO {
    private Long id;
    private Long volunteerId;
    private String status;
    private String name;
    private String avatar;
    private String phone;
    private BigDecimal totalHours;
    private BigDecimal rating;
    private Integer serviceCount;
    private Boolean verified;
    private Boolean isGold;
}
