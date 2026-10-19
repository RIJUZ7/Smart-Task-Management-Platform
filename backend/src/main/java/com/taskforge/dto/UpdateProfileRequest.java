package com.taskforge.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(
    @NotBlank(message = "Full name cannot be blank")
    String fullName,
    String jobTitle,
    String avatarColor
) {}
