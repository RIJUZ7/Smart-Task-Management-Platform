package com.taskforge.repository;

import com.taskforge.entity.Task;
import com.taskforge.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    Optional<Task> findByIdAndWorkspaceId(Long id, Long workspaceId);

    List<Task> findByWorkspaceId(Long workspaceId);

    Page<Task> findByWorkspaceId(Long workspaceId, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.workspace.id = :workspaceId AND t.dueDate = :today AND t.status != 'COMPLETED' ORDER BY t.priority DESC")
    List<Task> findDueTodayTasks(@Param("workspaceId") Long workspaceId, @Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.workspace.id = :workspaceId AND t.dueDate < :today AND t.status != 'COMPLETED' ORDER BY t.dueDate ASC")
    List<Task> findOverdueTasks(@Param("workspaceId") Long workspaceId, @Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.workspace.id = :workspaceId AND t.status = 'IN_REVIEW' ORDER BY t.updatedAt DESC")
    List<Task> findAwaitingReviewTasks(@Param("workspaceId") Long workspaceId);

    @Query("SELECT t FROM Task t WHERE t.workspace.id = :workspaceId ORDER BY t.updatedAt DESC")
    List<Task> findRecentlyUpdatedTasks(@Param("workspaceId") Long workspaceId, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.workspace.id = :workspaceId AND t.dueDate >= :today AND t.status != 'COMPLETED' ORDER BY t.dueDate ASC")
    List<Task> findUpcomingDeadlines(@Param("workspaceId") Long workspaceId, @Param("today") LocalDate today, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.assignee.id = :assigneeId ORDER BY t.dueDate ASC NULLS LAST")
    Page<Task> findByAssigneeId(@Param("assigneeId") Long assigneeId, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.workspace.id = :workspaceId AND t.assignee.id = :assigneeId ORDER BY t.dueDate ASC NULLS LAST")
    List<Task> findByWorkspaceIdAndAssigneeId(@Param("workspaceId") Long workspaceId, @Param("assigneeId") Long assigneeId);

    @Query("SELECT t FROM Task t WHERE t.workspace.id = :workspaceId AND ((t.dueDate BETWEEN :start AND :end) OR (t.startDate BETWEEN :start AND :end))")
    List<Task> findTasksBetweenDates(@Param("workspaceId") Long workspaceId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    long countByWorkspaceId(Long workspaceId);

    long countByWorkspaceIdAndStatus(Long workspaceId, TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.workspace.id = :workspaceId AND t.dueDate < :today AND t.status != 'COMPLETED'")
    long countOverdueTasks(@Param("workspaceId") Long workspaceId, @Param("today") LocalDate today);
}
