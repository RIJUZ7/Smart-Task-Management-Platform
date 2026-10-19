package com.taskforge.repository;

import com.taskforge.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    Optional<Workspace> findBySlug(String slug);
    boolean existsBySlug(String slug);

    @Query("SELECT w FROM Workspace w JOIN WorkspaceMembership wm ON w.id = wm.workspace.id WHERE wm.user.id = :userId ORDER BY w.name ASC")
    List<Workspace> findWorkspacesByUserId(@Param("userId") Long userId);
}
