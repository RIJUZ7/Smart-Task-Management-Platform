package com.taskforge.dto;

import com.taskforge.entity.WorkspaceRole;
import java.time.OffsetDateTime;

public record WorkspaceMemberDto(
    Long userId,
    String username,
    String email,
    String fullName,
    String jobTitle,
    String avatarColor,
    WorkspaceRole role,
    OffsetDateTime joinedAt,
    long assignedTasksCount,
    long completedTasksCount
) {}
