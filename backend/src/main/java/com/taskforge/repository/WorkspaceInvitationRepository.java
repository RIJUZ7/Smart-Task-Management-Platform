package com.taskforge.repository;

import com.taskforge.entity.WorkspaceInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceInvitationRepository extends JpaRepository<WorkspaceInvitation, Long> {
    Optional<WorkspaceInvitation> findByToken(String token);

    @Query("SELECT i FROM WorkspaceInvitation i JOIN FETCH i.workspace JOIN FETCH i.invitedBy WHERE i.workspace.id = :workspaceId AND i.accepted = false ORDER BY i.createdAt DESC")
    List<WorkspaceInvitation> findPendingByWorkspaceId(@Param("workspaceId") Long workspaceId);

    boolean existsByWorkspaceIdAndEmailAndAcceptedFalse(Long workspaceId, String email);
}
