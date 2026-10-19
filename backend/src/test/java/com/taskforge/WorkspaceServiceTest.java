package com.taskforge;

import com.taskforge.dto.AddMemberRequest;
import com.taskforge.dto.CreateWorkspaceRequest;
import com.taskforge.dto.UpdateRoleRequest;
import com.taskforge.dto.WorkspaceDto;
import com.taskforge.entity.WorkspaceRole;
import com.taskforge.exception.BadRequestException;
import com.taskforge.exception.ForbiddenException;
import com.taskforge.service.WorkspaceService;
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
class WorkspaceServiceTest {

    @Autowired
    private WorkspaceService workspaceService;

    private final Long alexId = 1L; // Admin in Workspace 1
    private final Long marcusId = 3L; // Member in Workspace 1
    private final Long workspaceId = 1L;

    @Test
    @DisplayName("Should create workspace and assign creator as ADMIN")
    void shouldCreateWorkspace() {
        CreateWorkspaceRequest request = new CreateWorkspaceRequest(
                "Data Engineering Guild",
                "data-eng-guild",
                "Guild dedicated to Spark, Kafka, and telemetry pipelines"
        );

        WorkspaceDto ws = workspaceService.createWorkspace(request, alexId);

        assertNotNull(ws);
        assertEquals("Data Engineering Guild", ws.name());
        assertEquals("data-eng-guild", ws.slug());
        assertEquals(WorkspaceRole.ADMIN, ws.userRole());
    }

    @Test
    @DisplayName("Should prevent standard MEMBER from adding members (requires MANAGER/ADMIN)")
    void shouldPreventMemberFromAddingMembers() {
        AddMemberRequest addReq = new AddMemberRequest("sophia.chen", WorkspaceRole.MEMBER);

        assertThrows(ForbiddenException.class, () ->
                workspaceService.addMember(workspaceId, addReq, marcusId)
        );
    }

    @Test
    @DisplayName("Should prevent user from removing themselves from workspace")
    void shouldPreventSelfRemoval() {
        assertThrows(BadRequestException.class, () ->
                workspaceService.removeMember(workspaceId, alexId, alexId)
        );
    }
}
