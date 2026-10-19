package com.taskforge.service;

import com.taskforge.dto.*;
import com.taskforge.entity.*;
import com.taskforge.repository.TaskRepository;
import com.taskforge.repository.WorkspaceMembershipRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final TaskRepository taskRepository;
    private final WorkspaceMembershipRepository membershipRepository;
    private final WorkspaceService workspaceService;
    private final TaskService taskService;
    private final TaskActivityService activityService;

    public AnalyticsService(
            TaskRepository taskRepository,
            WorkspaceMembershipRepository membershipRepository,
            WorkspaceService workspaceService,
            TaskService taskService,
            TaskActivityService activityService) {
        this.taskRepository = taskRepository;
        this.membershipRepository = membershipRepository;
        this.workspaceService = workspaceService;
        this.taskService = taskService;
        this.activityService = activityService;
    }

    @Transactional(readOnly = true)
    public AnalyticsOverviewDto getAnalyticsOverview(Long workspaceId, Long currentUserId) {
        workspaceService.validateMembership(workspaceId, currentUserId);

        List<Task> allTasks = taskRepository.findByWorkspaceId(workspaceId);
        long totalTasks = allTasks.size();

        long completedTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long activeTasks = totalTasks - completedTasks;

        LocalDate today = LocalDate.now();
        long overdueTasks = allTasks.stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(today) && t.getStatus() != TaskStatus.COMPLETED)
                .count();

        double completionRate = totalTasks > 0 ? ((double) completedTasks / totalTasks) * 100.0 : 0.0;

        // Priority distribution
        Map<TaskPriority, Long> priorityMap = new EnumMap<>(TaskPriority.class);
        for (TaskPriority p : TaskPriority.values()) {
            priorityMap.put(p, allTasks.stream().filter(t -> t.getPriority() == p).count());
        }

        // Status distribution
        Map<TaskStatus, Long> statusMap = new EnumMap<>(TaskStatus.class);
        for (TaskStatus s : TaskStatus.values()) {
            statusMap.put(s, allTasks.stream().filter(t -> t.getStatus() == s).count());
        }

        // Member workload
        List<WorkspaceMembership> members = membershipRepository.findMembersWithUserByWorkspaceId(workspaceId);
        List<MemberWorkloadDto> workloadList = members.stream().map(m -> {
            User u = m.getUser();
            List<Task> memberTasks = allTasks.stream()
                    .filter(t -> t.getAssignee() != null && t.getAssignee().getId().equals(u.getId()))
                    .toList();

            long total = memberTasks.size();
            long completed = memberTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
            long inProgress = memberTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
            long overdue = memberTasks.stream()
                    .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(today) && t.getStatus() != TaskStatus.COMPLETED)
                    .count();

            return new MemberWorkloadDto(u.getId(), u.getFullName(), u.getEmail(), u.getAvatarColor(), total, completed, inProgress, overdue);
        }).collect(Collectors.toList());

        // Weekly velocity over past 5 weeks
        List<WeeklyVelocityDto> weeklyVelocity = calculateWeeklyVelocity(allTasks);

        return new AnalyticsOverviewDto(
                totalTasks,
                completedTasks,
                activeTasks,
                overdueTasks,
                Math.round(completionRate * 10.0) / 10.0,
                weeklyVelocity,
                workloadList,
                priorityMap,
                statusMap,
                weeklyVelocity
        );
    }

    @Transactional(readOnly = true)
    public OverviewDashboardDto getDashboardOverview(Long workspaceId, Long currentUserId) {
        workspaceService.validateMembership(workspaceId, currentUserId);

        LocalDate today = LocalDate.now();
        List<Task> allTasks = taskRepository.findByWorkspaceId(workspaceId);

        long totalTasks = allTasks.size();
        long completedCount = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        double progressPct = totalTasks > 0 ? ((double) completedCount / totalTasks) * 100.0 : 0.0;

        List<TaskDto> dueTodayTasks = taskRepository.findDueTodayTasks(workspaceId, today)
                .stream().map(taskService::toDto).collect(Collectors.toList());

        List<TaskDto> overdueTasks = taskRepository.findOverdueTasks(workspaceId, today)
                .stream().map(taskService::toDto).collect(Collectors.toList());

        List<TaskDto> awaitingReviewTasks = taskRepository.findAwaitingReviewTasks(workspaceId)
                .stream().map(taskService::toDto).collect(Collectors.toList());

        List<TaskDto> upcomingDeadlines = taskRepository.findUpcomingDeadlines(workspaceId, today, PageRequest.of(0, 5))
                .stream().map(taskService::toDto).collect(Collectors.toList());

        List<TaskDto> recentlyUpdatedTasks = taskRepository.findRecentlyUpdatedTasks(workspaceId, PageRequest.of(0, 5))
                .stream().map(taskService::toDto).collect(Collectors.toList());

        List<ActivityDto> recentActivities = activityService.getRecentWorkspaceActivities(workspaceId, 7);

        List<WeeklyVelocityDto> weeklyVelocity = calculateWeeklyVelocity(allTasks);

        return new OverviewDashboardDto(
                totalTasks,
                dueTodayTasks.size(),
                overdueTasks.size(),
                awaitingReviewTasks.size(),
                completedCount,
                Math.round(progressPct * 10.0) / 10.0,
                dueTodayTasks,
                overdueTasks,
                awaitingReviewTasks,
                upcomingDeadlines,
                recentlyUpdatedTasks,
                recentActivities,
                weeklyVelocity
        );
    }

    private List<WeeklyVelocityDto> calculateWeeklyVelocity(List<Task> allTasks) {
        List<WeeklyVelocityDto> result = new ArrayList<>();
        LocalDate now = LocalDate.now();
        LocalDate startOfCurrentWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        for (int i = 4; i >= 0; i--) {
            LocalDate weekStart = startOfCurrentWeek.minusWeeks(i);
            LocalDate weekEnd = weekStart.plusDays(6);
            String label = "W" + (5 - i) + " (" + weekStart.getMonth().name().substring(0, 3) + " " + weekStart.getDayOfMonth() + ")";

            long completedInWeek = allTasks.stream().filter(t -> {
                if (t.getCompletedAt() == null) return false;
                LocalDate compDate = t.getCompletedAt().toLocalDate();
                return !compDate.isBefore(weekStart) && !compDate.isAfter(weekEnd);
            }).count();

            long createdInWeek = allTasks.stream().filter(t -> {
                if (t.getCreatedAt() == null) return false;
                LocalDate creatDate = t.getCreatedAt().toLocalDate();
                return !creatDate.isBefore(weekStart) && !creatDate.isAfter(weekEnd);
            }).count();

            result.add(new WeeklyVelocityDto(label, completedInWeek, createdInWeek));
        }

        return result;
    }
}
