package com.taskforge;

import com.taskforge.dto.AnalyticsOverviewDto;
import com.taskforge.dto.OverviewDashboardDto;
import com.taskforge.service.AnalyticsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AnalyticsServiceTest {

    @Autowired
    private AnalyticsService analyticsService;

    private final Long workspaceId = 1L;
    private final Long alexId = 1L;

    @Test
    @DisplayName("Should accurately compute analytics overview from actual task records")
    void shouldComputeAnalyticsOverview() {
        AnalyticsOverviewDto overview = analyticsService.getAnalyticsOverview(workspaceId, alexId);

        assertNotNull(overview);
        assertTrue(overview.totalTasks() >= 10);
        assertTrue(overview.completedTasks() >= 3);
        assertEquals(overview.totalTasks() - overview.completedTasks(), overview.activeTasks());
        assertTrue(overview.completionRate() > 0.0);
        assertFalse(overview.tasksCompletedPerWeek().isEmpty());
        assertFalse(overview.workloadByMember().isEmpty());
        assertNotNull(overview.taskDistributionByPriority());
        assertNotNull(overview.taskDistributionByStatus());
    }

    @Test
    @DisplayName("Should return command center operational dashboard data")
    void shouldReturnDashboardOverview() {
        OverviewDashboardDto dashboard = analyticsService.getDashboardOverview(workspaceId, alexId);

        assertNotNull(dashboard);
        assertTrue(dashboard.totalTasks() >= 10);
        assertNotNull(dashboard.dueTodayTasks());
        assertNotNull(dashboard.overdueTasks());
        assertNotNull(dashboard.awaitingReviewTasks());
        assertNotNull(dashboard.upcomingDeadlines());
        assertNotNull(dashboard.recentlyUpdatedTasks());
        assertNotNull(dashboard.recentActivities());
    }
}
