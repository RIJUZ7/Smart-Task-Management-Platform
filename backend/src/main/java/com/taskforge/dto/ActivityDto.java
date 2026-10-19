package com.taskforge.dto;

import com.taskforge.entity.ActivityAction;
import java.time.OffsetDateTime;

public record ActivityDto(
    Long id,
    Long taskId,
    String taskNumber,
    String taskTitle,
    UserDto actor,
    ActivityAction action,
    String fieldName,
    String oldValue,
    String newValue,
    String description,
    OffsetDateTime createdAt
) {}
