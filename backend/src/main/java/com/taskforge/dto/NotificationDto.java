package com.taskforge.dto;

import com.taskforge.entity.NotificationType;
import java.time.OffsetDateTime;

public record NotificationDto(
    Long id,
    Long workspaceId,
    String workspaceName,
    Long taskId,
    String taskNumber,
    NotificationType type,
    String title,
    String message,
    boolean isRead,
    OffsetDateTime createdAt
) {}
