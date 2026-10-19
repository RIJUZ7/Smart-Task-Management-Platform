package com.taskforge.service;

import com.taskforge.dto.CommentDto;
import com.taskforge.dto.CreateCommentRequest;
import com.taskforge.entity.*;
import com.taskforge.exception.ResourceNotFoundException;
import com.taskforge.repository.TaskCommentRepository;
import com.taskforge.repository.TaskRepository;
import com.taskforge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskCommentService {

    private final TaskCommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final WorkspaceService workspaceService;
    private final TaskActivityService activityService;
    private final NotificationService notificationService;

    public TaskCommentService(
            TaskCommentRepository commentRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            WorkspaceService workspaceService,
            TaskActivityService activityService,
            NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.workspaceService = workspaceService;
        this.activityService = activityService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<CommentDto> getComments(Long workspaceId, Long taskId, Long currentUserId) {
        workspaceService.validateMembership(workspaceId, currentUserId);

        taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDto addComment(Long workspaceId, Long taskId, CreateCommentRequest request, Long currentUserId) {
        workspaceService.validateMembership(workspaceId, currentUserId);

        Task task = taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        User author = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TaskComment comment = new TaskComment(task, author, request.content().trim());
        TaskComment saved = commentRepository.save(comment);

        // Activity log
        activityService.logActivity(task, author, ActivityAction.COMMENT_ADDED, "comment", null, null,
                author.getFullName() + " added a comment");

        // Notify assignee if someone else commented
        if (task.getAssignee() != null && !task.getAssignee().getId().equals(currentUserId)) {
            notificationService.createNotification(
                    task.getAssignee(), task.getWorkspace(), task, NotificationType.COMMENT_ADDED,
                    "New comment on " + task.getTaskNumber(),
                    author.getFullName() + " commented on '" + task.getTitle() + "'"
            );
        }

        // Notify creator if creator is different from commenter and assignee
        if (!task.getCreator().getId().equals(currentUserId) &&
                (task.getAssignee() == null || !task.getCreator().getId().equals(task.getAssignee().getId()))) {
            notificationService.createNotification(
                    task.getCreator(), task.getWorkspace(), task, NotificationType.COMMENT_ADDED,
                    "New comment on " + task.getTaskNumber(),
                    author.getFullName() + " commented on '" + task.getTitle() + "'"
            );
        }

        return toDto(saved);
    }

    public CommentDto toDto(TaskComment c) {
        return new CommentDto(
                c.getId(),
                c.getTask().getId(),
                UserService.toDto(c.getAuthor()),
                c.getContent(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
