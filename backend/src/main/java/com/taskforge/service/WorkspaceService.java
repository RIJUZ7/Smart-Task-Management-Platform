package com.taskforge.service;

import com.taskforge.dto.*;
import com.taskforge.entity.*;
import com.taskforge.exception.BadRequestException;
import com.taskforge.exception.ForbiddenException;
import com.taskforge.exception.ResourceNotFoundException;
import com.taskforge.repository.TaskRepository;
import com.taskforge.repository.UserRepository;
import com.taskforge.repository.WorkspaceMembershipRepository;
import com.taskforge.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public WorkspaceService(
            WorkspaceRepository workspaceRepository,
            WorkspaceMembershipRepository membershipRepository,
            UserRepository userRepository,
            TaskRepository taskRepository) {
        this.workspaceRepository = workspaceRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public List<WorkspaceDto> getUserWorkspaces(Long userId) {
        List<Workspace> workspaces = workspaceRepository.findWorkspacesByUserId(userId);
        return workspaces.stream()
                .map(w -> toWorkspaceDto(w, userId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkspaceDto getWorkspace(Long workspaceId, Long userId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + workspaceId));

        validateMembership(workspaceId, userId);
        return toWorkspaceDto(workspace, userId);
    }

    @Transactional
    public WorkspaceDto createWorkspace(CreateWorkspaceRequest request, Long userId) {
        if (workspaceRepository.existsBySlug(request.slug())) {
            throw new BadRequestException("Workspace slug '" + request.slug() + "' is already in use");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Workspace workspace = new Workspace();
        workspace.setName(request.name().trim());
        workspace.setSlug(request.slug().trim().toLowerCase());
        workspace.setDescription(request.description());
        workspace.setCreatedBy(user);
        Workspace saved = workspaceRepository.save(workspace);

        WorkspaceMembership membership = new WorkspaceMembership(saved, user, WorkspaceRole.ADMIN);
        membershipRepository.save(membership);

        return toWorkspaceDto(saved, userId);
    }

    @Transactional
    public WorkspaceDto updateWorkspace(Long workspaceId, UpdateWorkspaceRequest request, Long userId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        requireRole(workspaceId, userId, WorkspaceRole.ADMIN);

        workspace.setName(request.name().trim());
        workspace.setDescription(request.description());
        Workspace updated = workspaceRepository.save(workspace);

        return toWorkspaceDto(updated, userId);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceMemberDto> getMembers(Long workspaceId, Long userId) {
        validateMembership(workspaceId, userId);

        List<WorkspaceMembership> memberships = membershipRepository.findMembersWithUserByWorkspaceId(workspaceId);
        return memberships.stream().map(m -> {
            User u = m.getUser();
            long assignedCount = taskRepository.findByWorkspaceIdAndAssigneeId(workspaceId, u.getId()).size();
            long completedCount = taskRepository.findByWorkspaceIdAndAssigneeId(workspaceId, u.getId())
                    .stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();

            return new WorkspaceMemberDto(
                    u.getId(),
                    u.getUsername(),
                    u.getEmail(),
                    u.getFullName(),
                    u.getJobTitle(),
                    u.getAvatarColor(),
                    m.getRole(),
                    m.getJoinedAt(),
                    assignedCount,
                    completedCount
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public WorkspaceMemberDto addMember(Long workspaceId, AddMemberRequest request, Long userId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        requireRole(workspaceId, userId, WorkspaceRole.MANAGER);

        User targetUser = userRepository.findByUsername(request.usernameOrEmail())
                .or(() -> userRepository.findByEmail(request.usernameOrEmail()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username or email: " + request.usernameOrEmail()));

        if (membershipRepository.existsByWorkspaceIdAndUserId(workspaceId, targetUser.getId())) {
            throw new BadRequestException("User is already a member of this workspace");
        }

        WorkspaceMembership membership = new WorkspaceMembership(workspace, targetUser, request.role());
        membershipRepository.save(membership);

        return new WorkspaceMemberDto(
                targetUser.getId(),
                targetUser.getUsername(),
                targetUser.getEmail(),
                targetUser.getFullName(),
                targetUser.getJobTitle(),
                targetUser.getAvatarColor(),
                request.role(),
                membership.getJoinedAt(),
                0,
                0
        );
    }

    @Transactional
    public void updateMemberRole(Long workspaceId, Long targetUserId, UpdateRoleRequest request, Long currentUserId) {
        requireRole(workspaceId, currentUserId, WorkspaceRole.ADMIN);

        WorkspaceMembership membership = membershipRepository.findByWorkspaceIdAndUserId(workspaceId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User is not a member of this workspace"));

        membership.setRole(request.role());
        membershipRepository.save(membership);
    }

    @Transactional
    public void removeMember(Long workspaceId, Long targetUserId, Long currentUserId) {
        requireRole(workspaceId, currentUserId, WorkspaceRole.ADMIN);

        if (targetUserId.equals(currentUserId)) {
            throw new BadRequestException("You cannot remove yourself from the workspace");
        }

        WorkspaceMembership membership = membershipRepository.findByWorkspaceIdAndUserId(workspaceId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User is not a member of this workspace"));

        membershipRepository.delete(membership);
    }

    public WorkspaceMembership validateMembership(Long workspaceId, Long userId) {
        return membershipRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException("Access denied: You are not a member of workspace id " + workspaceId));
    }

    public void requireRole(Long workspaceId, Long userId, WorkspaceRole minRole) {
        WorkspaceMembership membership = validateMembership(workspaceId, userId);
        WorkspaceRole userRole = membership.getRole();

        if (minRole == WorkspaceRole.ADMIN && userRole != WorkspaceRole.ADMIN) {
            throw new ForbiddenException("Action requires ADMIN role in this workspace");
        }
        if (minRole == WorkspaceRole.MANAGER && (userRole != WorkspaceRole.ADMIN && userRole != WorkspaceRole.MANAGER)) {
            throw new ForbiddenException("Action requires MANAGER or ADMIN role in this workspace");
        }
    }

    private WorkspaceDto toWorkspaceDto(Workspace w, Long userId) {
        WorkspaceMembership membership = membershipRepository.findByWorkspaceIdAndUserId(w.getId(), userId).orElse(null);
        WorkspaceRole role = membership != null ? membership.getRole() : null;
        long memberCount = membershipRepository.findByWorkspaceId(w.getId()).size();
        long taskCount = taskRepository.countByWorkspaceId(w.getId());

        return new WorkspaceDto(
                w.getId(),
                w.getName(),
                w.getSlug(),
                w.getDescription(),
                role,
                memberCount,
                taskCount,
                UserService.toDto(w.getCreatedBy()),
                w.getCreatedAt()
        );
    }
}
