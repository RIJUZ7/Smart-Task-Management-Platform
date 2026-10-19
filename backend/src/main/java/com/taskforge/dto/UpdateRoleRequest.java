package com.taskforge.dto;

import com.taskforge.entity.WorkspaceRole;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(
    @NotNull(message = "Role is required")
    WorkspaceRole role
) {}
