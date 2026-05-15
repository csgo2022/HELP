package com.mutualaid.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "announcement")
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    private LocalDate date;

    @Column(length = 50)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 50)
    private String publisher;

    private Integer views = 0;

    @Column(name = "is_top")
    private Boolean isTop = false;

    @Column(length = 20)
    private String status = "PUBLISHED";

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
