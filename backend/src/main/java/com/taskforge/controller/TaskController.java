package com.taskforge.controller;

import com.taskforge.dto.CreateTaskRequest;
import com.taskforge.dto.TaskDto;
import com.taskforge.dto.TaskStatusUpdateRequest;
import com.taskforge.dto.UpdateTaskRequest;
import com.taskforge.entity.TaskPriority;
import com.taskforge.entity.TaskStatus;
import com.taskforge.security.SecurityUtils;
import com.taskforge.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Tasks", description = "Core Task Engine: CRUD, assignment, filtering, sorting, and pagination")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    @Operation(summary = "Query tasks with server-side filtering, search, pagination, and sorting")
    public ResponseEntity<Page<TaskDto>> getTasks(
            @RequestParam Long workspaceId,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        Long userId = SecurityUtils.getCurrentUserId();
        String[] sortParts = sort.split(",");
        String sortProp = sortParts[0];
        Sort.Direction dir = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortProp));

        Page<TaskDto> result = taskService.getTasks(workspaceId, status, priority, assigneeId, search, dueDateFrom, dueDateTo, pageable, userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @Operation(summary = "Create a new task in workspace")
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody CreateTaskRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        TaskDto created = taskService.createTask(request.workspaceId(), request, userId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{taskId}")
    @Operation(summary = "Get single task details by ID within workspace")
    public ResponseEntity<TaskDto> getTaskById(
            @PathVariable Long taskId,
            @RequestParam Long workspaceId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(taskService.getTaskById(workspaceId, taskId, userId));
    }

    @PatchMapping("/{taskId}")
    @Operation(summary = "Update task details, assignment, priority, or deadline")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable Long taskId,
            @RequestParam Long workspaceId,
            @Valid @RequestBody UpdateTaskRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(taskService.updateTask(workspaceId, taskId, request, userId));
    }

    @PatchMapping("/{taskId}/status")
    @Operation(summary = "Quick update task status with audit history")
    public ResponseEntity<TaskDto> updateTaskStatus(
            @PathVariable Long taskId,
            @RequestParam Long workspaceId,
            @Valid @RequestBody TaskStatusUpdateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(taskService.updateTaskStatus(workspaceId, taskId, request.status(), userId));
    }

    @DeleteMapping("/{taskId}")
    @Operation(summary = "Delete task with confirmation and permission check")
    public ResponseEntity<Map<String, String>> deleteTask(
            @PathVariable Long taskId,
            @RequestParam Long workspaceId) {
        Long userId = SecurityUtils.getCurrentUserId();
        taskService.deleteTask(workspaceId, taskId, userId);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
    }

    @GetMapping("/assigned-to-me")
    @Operation(summary = "List tasks assigned to the current authenticated user")
    public ResponseEntity<Page<TaskDto>> getAssignedToMe(
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "dueDate"));
        return ResponseEntity.ok(taskService.getAssignedToMe(workspaceId, pageable, userId));
    }

    @GetMapping("/my")
    @Operation(summary = "List tasks created by or assigned to current user")
    public ResponseEntity<Page<TaskDto>> getMyTasks(
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        return ResponseEntity.ok(taskService.getMyTasks(workspaceId, pageable, userId));
    }

    @GetMapping("/calendar")
    @Operation(summary = "Get tasks scheduled in date range for monthly/weekly calendar view")
    public ResponseEntity<List<TaskDto>> getCalendarTasks(
            @RequestParam Long workspaceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(taskService.getCalendarTasks(workspaceId, start, end, userId));
    }
}
