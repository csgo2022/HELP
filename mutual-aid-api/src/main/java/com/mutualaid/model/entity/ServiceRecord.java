package com.mutualaid.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "service_record")
public class ServiceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "volunteer_id", nullable = false)
    private Long volunteerId;

    @Column(nullable = false, length = 200)
    private String title;

    private LocalDateTime time;

    @Column(length = 200)
    private String location;

    @Column(length = 20)
    private String duration;

    @Column(length = 20)
    private String status;

    @Column(length = 50)
    private String client;

    @Column(columnDefinition = "TEXT")
    private String summary;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
