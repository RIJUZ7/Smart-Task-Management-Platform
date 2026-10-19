package com.taskforge.dto;

public record WeeklyVelocityDto(
    String weekLabel,
    long completedCount,
    long createdCount
) {}
