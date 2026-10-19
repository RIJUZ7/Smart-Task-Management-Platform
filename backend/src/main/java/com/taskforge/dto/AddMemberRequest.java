package com.taskforge.dto;

import com.taskforge.entity.WorkspaceRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddMemberRequest(
    @NotBlank(message = "Username or email is required")
    String usernameOrEmail,

    @NotNull(message = "Role is required")
    WorkspaceRole role
) {}
