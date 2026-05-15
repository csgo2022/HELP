package com.mutualaid.model.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class UserProfileVO {
    private Long id;
    private String phone;
    private String name;
    private String avatar;
    private Integer gender;
    private LocalDate birthDate;
    private String role;
    private Integer points;
    private List<String> tags;
    private String description;
    // volunteer specific
    private BigDecimal totalHours;
    private BigDecimal rating;
    private Integer serviceCount;
    private Boolean verified;
    private Boolean isGold;
}
