package com.mutualaid.model.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TaskVO {
    private Long id;
    private String type;
    private String title;
    private String description;
    private String address;
    private String status;
    private LocalDate appointmentDate;
    private String appointmentTime;
    private String duration;
    private BigDecimal rewardHours;
    private String requesterName;
    private Long volunteerId;
    private String volunteerName;
    private String volunteerAvatar;
    private String volunteerPhone;
    private Integer volunteerRating;
    private Integer volunteerServiceCount;
    private Integer applicantCount;
    private LocalDateTime createdAt;
}
