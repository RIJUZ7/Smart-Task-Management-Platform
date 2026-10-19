package com.taskforge.repository;

import com.taskforge.entity.TaskActivity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskActivityRepository extends JpaRepository<TaskActivity, Long> {

    @Query("SELECT a FROM TaskActivity a JOIN FETCH a.actor WHERE a.task.id = :taskId ORDER BY a.createdAt DESC")
    List<TaskActivity> findByTaskIdOrderByCreatedAtDesc(@Param("taskId") Long taskId);

    @Query("SELECT a FROM TaskActivity a JOIN FETCH a.actor JOIN FETCH a.task t WHERE t.workspace.id = :workspaceId ORDER BY a.createdAt DESC")
    List<TaskActivity> findRecentWorkspaceActivities(@Param("workspaceId") Long workspaceId, Pageable pageable);
}
