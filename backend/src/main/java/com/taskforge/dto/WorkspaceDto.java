package com.taskforge.dto;

import com.taskforge.entity.WorkspaceRole;
import java.time.OffsetDateTime;

public record WorkspaceDto(
    Long id,
    String name,
    String slug,
    String description,
    WorkspaceRole userRole,
    long memberCount,
    long taskCount,
    UserDto createdBy,
    OffsetDateTime createdAt
) {}
