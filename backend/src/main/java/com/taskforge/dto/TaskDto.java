package com.taskforge.dto;

import com.taskforge.entity.TaskPriority;
import com.taskforge.entity.TaskStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record TaskDto(
    Long id,
    String taskNumber,
    Long workspaceId,
    String workspaceName,
    String title,
    String description,
    TaskStatus status,
    TaskPriority priority,
    UserDto creator,
    UserDto assignee,
    LocalDate startDate,
    LocalDate dueDate,
    String labels,
    String category,
    BigDecimal estimatedHours,
    OffsetDateTime completedAt,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    long commentsCount,
    boolean isOverdue
) {}
