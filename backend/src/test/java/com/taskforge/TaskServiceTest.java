package com.taskforge;

import com.taskforge.dto.CreateTaskRequest;
import com.taskforge.dto.TaskDto;
import com.taskforge.dto.UpdateTaskRequest;
import com.taskforge.entity.TaskPriority;
import com.taskforge.entity.TaskStatus;
import com.taskforge.exception.BadRequestException;
import com.taskforge.exception.ForbiddenException;
import com.taskforge.exception.ResourceNotFoundException;
import com.taskforge.service.TaskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TaskServiceTest {

    @Autowired
    private TaskService taskService;

    private final Long alexId = 1L; // Admin in Workspace 1
    private final Long workspaceId = 1L;

    @Test
    @DisplayName("Should create task with generated sequential number and valid properties")
    void shouldCreateTask() {
        CreateTaskRequest request = new CreateTaskRequest(
                workspaceId,
                "Implement S3 Artifact Cache",
                "Speed up build pipelines by 4x using cache layers",
                TaskStatus.TODO,
                TaskPriority.HIGH,
                alexId,
                LocalDate.now(),
                LocalDate.now().plusDays(5),
                "DevOps,Cache",
                "INFRASTRUCTURE",
                BigDecimal.valueOf(8.0)
        );

        TaskDto created = taskService.createTask(workspaceId, request, alexId);

        assertNotNull(created);
        assertNotNull(created.id());
        assertTrue(created.taskNumber().startsWith("TF-"));
        assertEquals("Implement S3 Artifact Cache", created.title());
        assertEquals(TaskStatus.TODO, created.status());
        assertEquals(TaskPriority.HIGH, created.priority());
        assertFalse(created.isOverdue());
    }

    @Test
    @DisplayName("Should enforce workspace isolation: access with wrong workspace ID fails")
    void shouldEnforceWorkspaceIsolation() {
        // Task 1 belongs to Workspace 1. Asking for it under Workspace 2 should fail
        assertThrows(ResourceNotFoundException.class, () ->
                taskService.getTaskById(2L, 1L, 3L) // User 3 is admin in workspace 2
        );
    }

    @Test
    @DisplayName("Should reject access to tasks from non-member user")
    void shouldRejectNonMemberAccess() {
        // User 4 is NOT a member of Workspace 2 (only User 3, 1, 2 are)
        assertThrows(ForbiddenException.class, () ->
                taskService.getTasks(2L, null, null, null, null, null, null, PageRequest.of(0, 10), 4L)
        );
    }

    @Test
    @DisplayName("Should update task status and automatically set completedAt")
    void shouldSetCompletedAtOnCompletion() {
        TaskDto updated = taskService.updateTaskStatus(workspaceId, 1L, TaskStatus.COMPLETED, alexId);

        assertEquals(TaskStatus.COMPLETED, updated.status());
        assertNotNull(updated.completedAt());
        assertFalse(updated.isOverdue());
    }

    @Test
    @DisplayName("Should reject assigning a user who is not a member of the workspace")
    void shouldRejectAssigneeNotMember() {
        // User 4 is not a member of Workspace 2
        CreateTaskRequest request = new CreateTaskRequest(
                2L,
                "Illegal Assignment Task",
                "Should fail validation",
                TaskStatus.TODO,
                TaskPriority.LOW,
                4L, // not member of workspace 2
                LocalDate.now(),
                LocalDate.now().plusDays(3),
                null,
                null,
                BigDecimal.valueOf(2.0)
        );

        assertThrows(BadRequestException.class, () ->
                taskService.createTask(2L, request, 3L)
        );
    }
}
