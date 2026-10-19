package com.taskforge.controller;

import com.taskforge.dto.*;
import com.taskforge.security.SecurityUtils;
import com.taskforge.service.WorkspaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workspaces")
@Tag(name = "Workspaces", description = "Workspace management, member directory, and role administration")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    @Operation(summary = "List all workspaces the current user belongs to")
    public ResponseEntity<List<WorkspaceDto>> getUserWorkspaces() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(workspaceService.getUserWorkspaces(userId));
    }

    @PostMapping
    @Operation(summary = "Create a new workspace and designate current user as ADMIN")
    public ResponseEntity<WorkspaceDto> createWorkspace(@Valid @RequestBody CreateWorkspaceRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        WorkspaceDto workspace = workspaceService.createWorkspace(request, userId);
        return new ResponseEntity<>(workspace, HttpStatus.CREATED);
    }

    @GetMapping("/{workspaceId}")
    @Operation(summary = "Get workspace details by ID (enforces membership)")
    public ResponseEntity<WorkspaceDto> getWorkspace(@PathVariable Long workspaceId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(workspaceService.getWorkspace(workspaceId, userId));
    }

    @PatchMapping("/{workspaceId}")
    @Operation(summary = "Update workspace name and description (requires ADMIN)")
    public ResponseEntity<WorkspaceDto> updateWorkspace(
            @PathVariable Long workspaceId,
            @Valid @RequestBody UpdateWorkspaceRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(workspaceService.updateWorkspace(workspaceId, request, userId));
    }

    @GetMapping("/{workspaceId}/members")
    @Operation(summary = "List all members and their workload stats for a workspace")
    public ResponseEntity<List<WorkspaceMemberDto>> getMembers(@PathVariable Long workspaceId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(workspaceService.getMembers(workspaceId, userId));
    }

    @PostMapping("/{workspaceId}/members")
    @Operation(summary = "Add an existing user to workspace by username or email (requires MANAGER or ADMIN)")
    public ResponseEntity<WorkspaceMemberDto> addMember(
            @PathVariable Long workspaceId,
            @Valid @RequestBody AddMemberRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        WorkspaceMemberDto member = workspaceService.addMember(workspaceId, request, userId);
        return new ResponseEntity<>(member, HttpStatus.CREATED);
    }

    @PatchMapping("/{workspaceId}/members/{targetUserId}/role")
    @Operation(summary = "Update member role in workspace (requires ADMIN)")
    public ResponseEntity<Map<String, String>> updateMemberRole(
            @PathVariable Long workspaceId,
            @PathVariable Long targetUserId,
            @Valid @RequestBody UpdateRoleRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        workspaceService.updateMemberRole(workspaceId, targetUserId, request, userId);
        return ResponseEntity.ok(Map.of("message", "Member role updated successfully"));
    }

    @DeleteMapping("/{workspaceId}/members/{targetUserId}")
    @Operation(summary = "Remove member from workspace (requires ADMIN)")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable Long workspaceId,
            @PathVariable Long targetUserId) {
        Long userId = SecurityUtils.getCurrentUserId();
        workspaceService.removeMember(workspaceId, targetUserId, userId);
        return ResponseEntity.ok(Map.of("message", "Member removed from workspace"));
    }
}
