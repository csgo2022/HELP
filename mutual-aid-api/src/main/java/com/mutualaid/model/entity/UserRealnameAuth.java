package com.mutualaid.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_realname_auth")
public class UserRealnameAuth {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "real_name", nullable = false, length = 50)
    private String realName;

    @Column(name = "id_card", nullable = false, length = 18)
    private String idCard;

    @Column(length = 500)
    private String frontImage;

    @Column(length = 500)
    private String backImage;

    @Column(length = 20)
    private String status = "PENDING";

    private String rejectReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
