package com.taskforge.dto;

import java.time.OffsetDateTime;

public record UserDto(
    Long id,
    String username,
    String email,
    String fullName,
    String jobTitle,
    String avatarColor,
    OffsetDateTime createdAt
) {}
