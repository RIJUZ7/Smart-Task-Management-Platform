package com.taskforge.dto;

import com.taskforge.entity.TaskPriority;
import com.taskforge.entity.TaskStatus;
import java.util.List;
import java.util.Map;

public record AnalyticsOverviewDto(
    long totalTasks,
    long completedTasks,
    long activeTasks,
    long overdueTasks,
    double completionRate,
    List<WeeklyVelocityDto> tasksCompletedPerWeek,
    List<MemberWorkloadDto> workloadByMember,
    Map<TaskPriority, Long> taskDistributionByPriority,
    Map<TaskStatus, Long> taskDistributionByStatus,
    List<WeeklyVelocityDto> completionTrends
) {}
