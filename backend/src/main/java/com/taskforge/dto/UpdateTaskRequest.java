package com.taskforge.dto;

import com.taskforge.entity.TaskPriority;
import com.taskforge.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateTaskRequest(
    @NotBlank(message = "Task title cannot be blank")
    @Size(min = 2, max = 255, message = "Task title must be between 2 and 255 characters")
    String title,

    String description,

    TaskStatus status,

    TaskPriority priority,

    Long assigneeId,

    LocalDate startDate,

    LocalDate dueDate,

    String labels,

    String category,

    BigDecimal estimatedHours
) {}
