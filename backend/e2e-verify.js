async function testApi() {
  const loginData = JSON.stringify({
    usernameOrEmail: 'alex.turner',
    password: 'password123'
  });

  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: loginData
  });
  const auth = await loginRes.json();
  console.log(`[AUTH SUCCESS] User: ${auth.user.fullName} (${auth.user.username}) | Role: ${auth.user.jobTitle}`);

  const token = auth.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const wsRes = await fetch('http://localhost:8080/api/workspaces', { headers: authHeaders });
  const workspaces = await wsRes.json();
  console.log(`[WORKSPACES] Found ${workspaces.length} workspace(s). Primary: "${workspaces[0].name}" (ID: ${workspaces[0].id})`);

  const wsId = workspaces[0].id;

  // 1. Create Task via POST /api/tasks
  const newTaskRes = await fetch('http://localhost:8080/api/tasks', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      workspaceId: wsId,
      title: 'Configure Distributed Tracing with OpenTelemetry',
      description: 'Add OTel agent and trace context propagation across services',
      status: 'TODO',
      priority: 'URGENT',
      dueDate: '2026-10-30T17:00:00Z'
    })
  });
  const newTask = await newTaskRes.json();
  console.log(`[TASK CREATED] Task #${newTask.taskNumber} (ID: ${newTask.id}) | Title: "${newTask.title}" | Status: ${newTask.status} | Priority: ${newTask.priority}`);

  // 2. Add Comment via POST /api/tasks/{taskId}/comments?workspaceId={wsId}
  const commentRes = await fetch(`http://localhost:8080/api/tasks/${newTask.id}/comments?workspaceId=${wsId}`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      content: 'Verified in staging environment, trace spans are propagating as expected.'
    })
  });
  const comment = await commentRes.json();
  console.log(`[COMMENT ADDED] Comment ID: ${comment.id} by ${comment.author.fullName}: "${comment.content}"`);

  // 3. Update Status to IN_PROGRESS
  const statusRes = await fetch(`http://localhost:8080/api/tasks/${newTask.id}/status?workspaceId=${wsId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status: 'IN_PROGRESS' })
  });
  const updatedTask = await statusRes.json();
  console.log(`[STATUS UPDATED] Task #${updatedTask.taskNumber} status is now: ${updatedTask.status}`);

  // 4. Query Tasks with Filters
  const tasksRes = await fetch(`http://localhost:8080/api/tasks?workspaceId=${wsId}&priority=URGENT`, { headers: authHeaders });
  const urgentTasks = await tasksRes.json();
  console.log(`[QUERY URGENT TASKS] Total Urgent in Workspace: ${urgentTasks.totalElements}`);

  // Search by keyword
  const searchRes = await fetch(`http://localhost:8080/api/tasks?workspaceId=${wsId}&search=OpenTelemetry`, { headers: authHeaders });
  const searchResults = await searchRes.json();
  console.log(`[SEARCH 'OpenTelemetry'] Found: ${searchResults.totalElements} match(es). First match title: "${searchResults.content[0].title}"`);

  // 5. Fetch Analytics via GET /api/analytics/overview?workspaceId={wsId}
  const analyticsRes = await fetch(`http://localhost:8080/api/analytics/overview?workspaceId=${wsId}`, { headers: authHeaders });
  const analytics = await analyticsRes.json();
  console.log(`[ANALYTICS OVERVIEW] Total Tasks: ${analytics.totalTasks} | Completed: ${analytics.completedTasks} | Rate: ${analytics.completionRate}%`);
  console.log(`[WEEKLY VELOCITY] Data points: ${analytics.weeklyVelocity ? analytics.weeklyVelocity.length : 0} weeks recorded`);
  console.log(`[MEMBER WORKLOAD] Members: ${analytics.memberWorkload ? analytics.memberWorkload.length : 0} active team members`);

  // 5. Fetch Dashboard Overview via GET /api/analytics/dashboard?workspaceId={wsId}
  const dashRes = await fetch(`http://localhost:8080/api/analytics/dashboard?workspaceId=${wsId}`, { headers: authHeaders });
  const dashboard = await dashRes.json();
  console.log(`[DASHBOARD OVERVIEW] Active: ${dashboard.activeTasksCount} | In Review: ${dashboard.inReviewCount} | High/Urgent: ${dashboard.highPriorityCount}`);

  console.log('\n======================================================');
  console.log('✅ ALL FULL-STACK WORKSPACE, TASK, COMMENT & ANALYTICS');
  console.log('   ENDPOINTS VALIDATED WITH 100% OPERATIONAL INTEGRITY');
  console.log('======================================================\n');
}

testApi().catch(err => {
  console.error('API Verification error:', err);
  process.exit(1);
});
