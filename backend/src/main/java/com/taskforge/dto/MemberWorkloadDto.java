package com.taskforge.dto;

public record MemberWorkloadDto(
    Long userId,
    String name,
    String email,
    String avatarColor,
    long totalTasks,
    long completedTasks,
    long inProgressTasks,
    long overdueTasks
) {}
