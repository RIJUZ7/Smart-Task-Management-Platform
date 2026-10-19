package com.taskforge.dto;

import java.time.OffsetDateTime;

public record CommentDto(
    Long id,
    Long taskId,
    UserDto author,
    String content,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
