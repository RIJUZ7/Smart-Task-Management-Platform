package com.taskforge.controller;

import com.taskforge.dto.CommentDto;
import com.taskforge.dto.CreateCommentRequest;
import com.taskforge.security.SecurityUtils;
import com.taskforge.service.TaskCommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
@Tag(name = "Task Comments", description = "Task collaboration comments and discussions")
public class CommentController {

    private final TaskCommentService commentService;

    public CommentController(TaskCommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    @Operation(summary = "Get comments for a task in chronological order")
    public ResponseEntity<List<CommentDto>> getComments(
            @PathVariable Long taskId,
            @RequestParam Long workspaceId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(commentService.getComments(workspaceId, taskId, userId));
    }

    @PostMapping
    @Operation(summary = "Post a comment on a task")
    public ResponseEntity<CommentDto> addComment(
            @PathVariable Long taskId,
            @RequestParam Long workspaceId,
            @Valid @RequestBody CreateCommentRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        CommentDto created = commentService.addComment(workspaceId, taskId, request, userId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}
