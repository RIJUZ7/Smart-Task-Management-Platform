package com.taskforge.service;

import com.taskforge.dto.CreateTaskRequest;
import com.taskforge.dto.TaskDto;
import com.taskforge.dto.UpdateTaskRequest;
import com.taskforge.entity.*;
import com.taskforge.exception.BadRequestException;
import com.taskforge.exception.ForbiddenException;
import com.taskforge.exception.ResourceNotFoundException;
import com.taskforge.repository.*;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final TaskCommentRepository commentRepository;
    private final TaskActivityService activityService;
    private final NotificationService notificationService;
    private final WorkspaceService workspaceService;

    public TaskService(
            TaskRepository taskRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMembershipRepository membershipRepository,
            UserRepository userRepository,
            TaskCommentRepository commentRepository,
            TaskActivityService activityService,
            NotificationService notificationService,
            WorkspaceService workspaceService) {
        this.taskRepository = taskRepository;
        this.workspaceRepository = workspaceRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.activityService = activityService;
        this.notificationService = notificationService;
        this.workspaceService = workspaceService;
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> getTasks(
            Long workspaceId,
            TaskStatus status,
            TaskPriority priority,
            Long assigneeId,
            String search,
            LocalDate dueDateFrom,
            LocalDate dueDateTo,
            Pageable pageable,
            Long currentUserId) {

        workspaceService.validateMembership(workspaceId, currentUserId);

        Specification<Task> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("workspace").get("id"), workspaceId));

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (assigneeId != null) {
                predicates.add(cb.equal(root.get("assignee").get("id"), assigneeId));
            }
            if (search != null && !search.isBlank()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), term);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), term);
                Predicate numberMatch = cb.like(cb.lower(root.get("taskNumber")), term);
                predicates.add(cb.or(titleMatch, descMatch, numberMatch));
            }
            if (dueDateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dueDate"), dueDateFrom));
            }
            if (dueDateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dueDate"), dueDateTo));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Task> page = taskRepository.findAll(spec, pageable);
        return page.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public TaskDto getTaskById(Long workspaceId, Long taskId, Long currentUserId) {
        workspaceService.validateMembership(workspaceId, currentUserId);

        Task task = taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId + " in workspace: " + workspaceId));

        return toDto(task);
    }

    @Transactional
    public TaskDto createTask(Long workspaceId, CreateTaskRequest request, Long currentUserId) {
        workspaceService.validateMembership(workspaceId, currentUserId);

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        User creator = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User assignee = null;
        if (request.assigneeId() != null) {
            assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found"));

            if (!membershipRepository.existsByWorkspaceIdAndUserId(workspaceId, assignee.getId())) {
                throw new BadRequestException("Assignee must be a member of the workspace");
            }
        }

        // Generate sequential Task Number
        long taskCount = taskRepository.countByWorkspaceId(workspaceId);
        String taskNumber = "TF-" + (100 + taskCount + 1);

        Task task = new Task();
        task.setTaskNumber(taskNumber);
        task.setWorkspace(workspace);
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setStatus(request.status() != null ? request.status() : TaskStatus.TODO);
        task.setPriority(request.priority() != null ? request.priority() : TaskPriority.MEDIUM);
        task.setCreator(creator);
        task.setAssignee(assignee);
        task.setStartDate(request.startDate());
        task.setDueDate(request.dueDate());
        task.setLabels(request.labels());
        task.setCategory(request.category());
        task.setEstimatedHours(request.estimatedHours());

        if (task.getStatus() == TaskStatus.COMPLETED) {
            task.setCompletedAt(OffsetDateTime.now());
        }

        Task saved = taskRepository.save(task);

        // Audit log
        activityService.logActivity(saved, creator, ActivityAction.CREATED, null, null, null,
                "Task created by " + creator.getFullName());

        // Notification if assigned to someone else
        if (assignee != null && !assignee.getId().equals(creator.getId())) {
            notificationService.createNotification(
                    assignee, workspace, saved, NotificationType.TASK_ASSIGNED,
                    "Assigned to " + saved.getTaskNumber(),
                    creator.getFullName() + " assigned you to '" + saved.getTitle() + "'"
            );
        }

        return toDto(saved);
    }

    @Transactional
    public TaskDto updateTask(Long workspaceId, Long taskId, UpdateTaskRequest request, Long currentUserId) {
        workspaceService.validateMembership(workspaceId, currentUserId);

        Task task = taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        User actor = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Track changes for activity logs
        if (!Objects.equals(task.getTitle(), request.title())) {
            activityService.logActivity(task, actor, ActivityAction.UPDATED, "title", task.getTitle(), request.title(),
                    "Title updated to '" + request.title() + "'");
            task.setTitle(request.title());
        }

        if (request.status() != null && task.getStatus() != request.status()) {
            TaskStatus oldStatus = task.getStatus();
            task.setStatus(request.status());
            if (request.status() == TaskStatus.COMPLETED) {
                task.setCompletedAt(OffsetDateTime.now());
            } else {
                task.setCompletedAt(null);
            }
            activityService.logActivity(task, actor, ActivityAction.STATUS_CHANGED, "status", oldStatus.name(), request.status().name(),
                    "Status changed from " + oldStatus.name() + " to " + request.status().name());

            // If status changed to IN_REVIEW, notify workspace managers/creator
            if (request.status() == TaskStatus.IN_REVIEW && !task.getCreator().getId().equals(actor.getId())) {
                notificationService.createNotification(
                        task.getCreator(), task.getWorkspace(), task, NotificationType.REVIEW_REQUESTED,
                        "Review Requested: " + task.getTaskNumber(),
                        actor.getFullName() + " submitted '" + task.getTitle() + "' for review"
                );
            }
        }

        if (request.priority() != null && task.getPriority() != request.priority()) {
            TaskPriority oldPriority = task.getPriority();
            task.setPriority(request.priority());
            activityService.logActivity(task, actor, ActivityAction.PRIORITY_CHANGED, "priority", oldPriority.name(), request.priority().name(),
                    "Priority changed from " + oldPriority.name() + " to " + request.priority().name());
        }

        // Assignee update
        Long currentAssigneeId = task.getAssignee() != null ? task.getAssignee().getId() : null;
        if (!Objects.equals(currentAssigneeId, request.assigneeId())) {
            User oldAssignee = task.getAssignee();
            User newAssignee = null;
            if (request.assigneeId() != null) {
                newAssignee = userRepository.findById(request.assigneeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
                if (!membershipRepository.existsByWorkspaceIdAndUserId(workspaceId, newAssignee.getId())) {
                    throw new BadRequestException("Assignee must be a member of the workspace");
                }
            }
            task.setAssignee(newAssignee);
            String oldName = oldAssignee != null ? oldAssignee.getFullName() : "Unassigned";
            String newName = newAssignee != null ? newAssignee.getFullName() : "Unassigned";

            activityService.logActivity(task, actor, ActivityAction.REASSIGNED, "assignee", oldName, newName,
                    "Reassigned from " + oldName + " to " + newName);

            if (newAssignee != null && !newAssignee.getId().equals(actor.getId())) {
                notificationService.createNotification(
                        newAssignee, task.getWorkspace(), task, NotificationType.TASK_REASSIGNED,
                        "Assigned to " + task.getTaskNumber(),
                        actor.getFullName() + " assigned you to '" + task.getTitle() + "'"
                );
            }
        }

        task.setDescription(request.description());
        task.setStartDate(request.startDate());
        task.setDueDate(request.dueDate());
        task.setLabels(request.labels());
        task.setCategory(request.category());
        task.setEstimatedHours(request.estimatedHours());

        Task updated = taskRepository.save(task);
        return toDto(updated);
    }

    @Transactional
    public TaskDto updateTaskStatus(Long workspaceId, Long taskId, TaskStatus newStatus, Long currentUserId) {
        workspaceService.validateMembership(workspaceId, currentUserId);

        Task task = taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        User actor = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (task.getStatus() != newStatus) {
            TaskStatus oldStatus = task.getStatus();
            task.setStatus(newStatus);
            if (newStatus == TaskStatus.COMPLETED) {
                task.setCompletedAt(OffsetDateTime.now());
            } else {
                task.setCompletedAt(null);
            }

            activityService.logActivity(task, actor, ActivityAction.STATUS_CHANGED, "status", oldStatus.name(), newStatus.name(),
                    "Status changed from " + oldStatus.name() + " to " + newStatus.name());

            if (newStatus == TaskStatus.IN_REVIEW && !task.getCreator().getId().equals(actor.getId())) {
                notificationService.createNotification(
                        task.getCreator(), task.getWorkspace(), task, NotificationType.REVIEW_REQUESTED,
                        "Review Requested: " + task.getTaskNumber(),
                        actor.getFullName() + " submitted '" + task.getTitle() + "' for review"
                );
            }
        }

        Task saved = taskRepository.save(task);
        return toDto(saved);
    }

    @Transactional
    public void deleteTask(Long workspaceId, Long taskId, Long currentUserId) {
        WorkspaceMembership membership = workspaceService.validateMembership(workspaceId, currentUserId);

        Task task = taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        // Only ADMIN, MANAGER or task creator can delete
        boolean isPrivileged = membership.getRole() == WorkspaceRole.ADMIN || membership.getRole() == WorkspaceRole.MANAGER;
        boolean isCreator = task.getCreator().getId().equals(currentUserId);

        if (!isPrivileged && !isCreator) {
            throw new ForbiddenException("You do not have permission to delete this task");
        }

        taskRepository.delete(task);
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> getAssignedToMe(Long workspaceId, Pageable pageable, Long currentUserId) {
        if (workspaceId != null) {
            workspaceService.validateMembership(workspaceId, currentUserId);
            Specification<Task> spec = (root, query, cb) -> cb.and(
                    cb.equal(root.get("workspace").get("id"), workspaceId),
                    cb.equal(root.get("assignee").get("id"), currentUserId)
            );
            return taskRepository.findAll(spec, pageable).map(this::toDto);
        } else {
            return taskRepository.findByAssigneeId(currentUserId, pageable).map(this::toDto);
        }
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> getMyTasks(Long workspaceId, Pageable pageable, Long currentUserId) {
        if (workspaceId != null) {
            workspaceService.validateMembership(workspaceId, currentUserId);
            Specification<Task> spec = (root, query, cb) -> cb.and(
                    cb.equal(root.get("workspace").get("id"), workspaceId),
                    cb.or(
                            cb.equal(root.get("assignee").get("id"), currentUserId),
                            cb.equal(root.get("creator").get("id"), currentUserId)
                    )
            );
            return taskRepository.findAll(spec, pageable).map(this::toDto);
        } else {
            Specification<Task> spec = (root, query, cb) -> cb.or(
                    cb.equal(root.get("assignee").get("id"), currentUserId),
                    cb.equal(root.get("creator").get("id"), currentUserId)
            );
            return taskRepository.findAll(spec, pageable).map(this::toDto);
        }
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getCalendarTasks(Long workspaceId, LocalDate start, LocalDate end, Long currentUserId) {
        workspaceService.validateMembership(workspaceId, currentUserId);

        List<Task> tasks = taskRepository.findTasksBetweenDates(workspaceId, start, end);
        return tasks.stream().map(this::toDto).collect(Collectors.toList());
    }

    public TaskDto toDto(Task t) {
        long commentCount = commentRepository.findByTaskIdOrderByCreatedAtAsc(t.getId()).size();
        boolean isOverdue = t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now()) && t.getStatus() != TaskStatus.COMPLETED;

        return new TaskDto(
                t.getId(),
                t.getTaskNumber(),
                t.getWorkspace().getId(),
                t.getWorkspace().getName(),
                t.getTitle(),
                t.getDescription(),
                t.getStatus(),
                t.getPriority(),
                UserService.toDto(t.getCreator()),
                UserService.toDto(t.getAssignee()),
                t.getStartDate(),
                t.getDueDate(),
                t.getLabels(),
                t.getCategory(),
                t.getEstimatedHours(),
                t.getCompletedAt(),
                t.getCreatedAt(),
                t.getUpdatedAt(),
                commentCount,
                isOverdue
        );
    }
}
