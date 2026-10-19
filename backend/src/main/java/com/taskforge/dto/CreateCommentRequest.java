package com.taskforge.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCommentRequest(
    @NotBlank(message = "Comment content cannot be blank")
    String content
) {}
