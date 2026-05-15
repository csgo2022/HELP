package com.mutualaid.model.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull
    private Long taskId;

    @NotNull
    private Long toUserId;

    @Min(1) @Max(5)
    private int rating;

    private String comment;
}
