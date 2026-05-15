package com.mutualaid.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "volunteer_profile")
public class VolunteerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    private BigDecimal totalHours = BigDecimal.ZERO;

    private BigDecimal rating = BigDecimal.ZERO;

    private Boolean verified = false;

    @Column(name = "is_gold")
    private Boolean isGold = false;

    private Integer serviceCount = 0;

    private String description;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
