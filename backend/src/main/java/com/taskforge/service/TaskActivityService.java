package com.taskforge.service;

import com.taskforge.dto.ActivityDto;
import com.taskforge.entity.ActivityAction;
import com.taskforge.entity.Task;
import com.taskforge.entity.TaskActivity;
import com.taskforge.entity.User;
import com.taskforge.repository.TaskActivityRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskActivityService {

    private final TaskActivityRepository activityRepository;

    public TaskActivityService(TaskActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    @Transactional
    public void logActivity(Task task, User actor, ActivityAction action, String fieldName, String oldValue, String newValue, String description) {
        TaskActivity activity = new TaskActivity(task, actor, action, fieldName, oldValue, newValue, description);
        activityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getTaskActivities(Long taskId) {
        return activityRepository.findByTaskIdOrderByCreatedAtDesc(taskId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getRecentWorkspaceActivities(Long workspaceId, int limit) {
        return activityRepository.findRecentWorkspaceActivities(workspaceId, PageRequest.of(0, limit))
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ActivityDto toDto(TaskActivity a) {
        return new ActivityDto(
                a.getId(),
                a.getTask() != null ? a.getTask().getId() : null,
                a.getTask() != null ? a.getTask().getTaskNumber() : "TF-000",
                a.getTask() != null ? a.getTask().getTitle() : "",
                UserService.toDto(a.getActor()),
                a.getAction(),
                a.getFieldName(),
                a.getOldValue(),
                a.getNewValue(),
                a.getDescription(),
                a.getCreatedAt()
        );
    }
}
