package com.taskforge.service;

import com.taskforge.dto.NotificationDto;
import com.taskforge.entity.Notification;
import com.taskforge.entity.NotificationType;
import com.taskforge.entity.Task;
import com.taskforge.entity.User;
import com.taskforge.entity.Workspace;
import com.taskforge.exception.ForbiddenException;
import com.taskforge.exception.ResourceNotFoundException;
import com.taskforge.repository.NotificationRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUnreadNotifications(Long userId) {
        return notificationRepository.findUnreadByUserId(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationDto markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied to notification");
        }

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return toDto(saved);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Transactional
    public void createNotification(User recipient, Workspace workspace, Task task, NotificationType type, String title, String message) {
        if (recipient == null) {
            return;
        }
        Notification notification = new Notification(recipient, workspace, task, type, title, message);
        notificationRepository.save(notification);
    }

    public NotificationDto toDto(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getWorkspace() != null ? n.getWorkspace().getId() : null,
                n.getWorkspace() != null ? n.getWorkspace().getName() : null,
                n.getTask() != null ? n.getTask().getId() : null,
                n.getTask() != null ? n.getTask().getTaskNumber() : null,
                n.getType(),
                n.getTitle(),
                n.getMessage(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
