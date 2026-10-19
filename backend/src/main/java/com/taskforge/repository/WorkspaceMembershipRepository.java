package com.taskforge.repository;

import com.taskforge.entity.WorkspaceMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceMembershipRepository extends JpaRepository<WorkspaceMembership, Long> {
    Optional<WorkspaceMembership> findByWorkspaceIdAndUserId(Long workspaceId, Long userId);
    List<WorkspaceMembership> findByWorkspaceId(Long workspaceId);
    List<WorkspaceMembership> findByUserId(Long userId);
    boolean existsByWorkspaceIdAndUserId(Long workspaceId, Long userId);
    void deleteByWorkspaceIdAndUserId(Long workspaceId, Long userId);

    @Query("SELECT wm FROM WorkspaceMembership wm JOIN FETCH wm.user WHERE wm.workspace.id = :workspaceId")
    List<WorkspaceMembership> findMembersWithUserByWorkspaceId(@Param("workspaceId") Long workspaceId);
}
