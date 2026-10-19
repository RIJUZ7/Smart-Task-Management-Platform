package com.taskforge.controller;

import com.taskforge.dto.ActivityDto;
import com.taskforge.security.SecurityUtils;
import com.taskforge.service.TaskActivityService;
import com.taskforge.service.WorkspaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Activity History", description = "Audit trail and workspace activity streams")
public class ActivityController {

    private final TaskActivityService activityService;
    private final WorkspaceService workspaceService;

    public ActivityController(TaskActivityService activityService, WorkspaceService workspaceService) {
        this.activityService = activityService;
        this.workspaceService = workspaceService;
    }

    @GetMapping("/tasks/{taskId}/activity")
    @Operation(summary = "Get complete activity history for a specific task")
    public ResponseEntity<List<ActivityDto>> getTaskActivities(
            @PathVariable Long taskId,
            @RequestParam Long workspaceId) {
        Long userId = SecurityUtils.getCurrentUserId();
        workspaceService.validateMembership(workspaceId, userId);
        return ResponseEntity.ok(activityService.getTaskActivities(taskId));
    }

    @GetMapping("/workspaces/{workspaceId}/activity")
    @Operation(summary = "Get workspace-wide team activity stream")
    public ResponseEntity<List<ActivityDto>> getWorkspaceActivities(
            @PathVariable Long workspaceId,
            @RequestParam(defaultValue = "30") int limit) {
        Long userId = SecurityUtils.getCurrentUserId();
        workspaceService.validateMembership(workspaceId, userId);
        return ResponseEntity.ok(activityService.getRecentWorkspaceActivities(workspaceId, limit));
    }
}
