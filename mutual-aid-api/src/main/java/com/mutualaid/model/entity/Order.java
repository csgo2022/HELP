package com.mutualaid.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String orderNo;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    private Integer quantity = 1;

    @Column(name = "total_points", nullable = false)
    private Integer totalPoints;

    @Column(name = "courier_code", length = 50)
    private String courierCode;

    @Column(name = "last_kd100_query_time")
    private LocalDateTime lastKd100QueryTime;

    @Column(name = "trail_url", length = 500)
    private String trailUrl;

    @Column(name = "route_from", length = 200)
    private String routeFrom;

    @Column(name = "route_cur", length = 200)
    private String routeCur;

    @Column(name = "route_to", length = 200)
    private String routeTo;

    @Column(length = 50)
    private String recipientName;

    @Column(length = 20)
    private String recipientPhone;

    @Column(length = 500)
    private String address;

    @Column(length = 50)
    private String courier;

    @Column(length = 100)
    private String trackingNo;

    @Column(length = 20)
    private String status = "PENDING";

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
