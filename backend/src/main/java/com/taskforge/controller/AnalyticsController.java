package com.taskforge.controller;

import com.taskforge.dto.AnalyticsOverviewDto;
import com.taskforge.dto.OverviewDashboardDto;
import com.taskforge.security.SecurityUtils;
import com.taskforge.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "Productivity analytics and operational command center overview")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    @Operation(summary = "Get detailed productivity analytics: velocity, workload, distributions")
    public ResponseEntity<AnalyticsOverviewDto> getAnalyticsOverview(@RequestParam Long workspaceId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(analyticsService.getAnalyticsOverview(workspaceId, userId));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get operational command center dashboard overview")
    public ResponseEntity<OverviewDashboardDto> getDashboardOverview(@RequestParam Long workspaceId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(analyticsService.getDashboardOverview(workspaceId, userId));
    }
}
