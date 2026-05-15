package com.mutualaid.model.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserProfileUpdateRequest {
    private String name;
    private Integer gender;
    private LocalDate birthDate;
    private String avatar;
}
