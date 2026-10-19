package com.taskforge.dto;

import java.util.List;

public record OverviewDashboardDto(
    long totalTasks,
    long dueTodayCount,
    long overdueCount,
    long awaitingReviewCount,
    long completedCount,
    double completionProgressPct,
    List<TaskDto> dueTodayTasks,
    List<TaskDto> overdueTasks,
    List<TaskDto> awaitingReviewTasks,
    List<TaskDto> upcomingDeadlines,
    List<TaskDto> recentlyUpdatedTasks,
    List<ActivityDto> recentActivities,
    List<WeeklyVelocityDto> weeklyVelocity
) {}
