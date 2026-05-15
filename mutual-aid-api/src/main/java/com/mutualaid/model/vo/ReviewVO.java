package com.mutualaid.model.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewVO {
    private Long id;
    private Long taskId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private Long fromUserId;
    private String fromUserName;
    private String fromUserAvatar;
}
