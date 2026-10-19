package com.taskforge.dto;

import com.taskforge.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequest(
    @NotNull(message = "Status is required")
    TaskStatus status
) {}
