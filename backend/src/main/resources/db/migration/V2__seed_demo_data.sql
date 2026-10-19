-- TASKFORGE Demo Seed Data
-- Portable ANSI SQL timestamps compatible with PostgreSQL and H2

INSERT INTO users (id, username, email, password_hash, full_name, job_title, avatar_color, created_at, updated_at)
VALUES 
(1, 'alex.turner', 'alex@taskforge.dev', '$2a$10$FTQ6OoTx8CVQGTl3pqrXgur8tswtuHs2StZd/r9.Of0gFHW960yTK', 'Alex Turner', 'Lead Architect & Admin', '#F26B38', TIMESTAMP '2026-10-01 08:00:00+00', TIMESTAMP '2026-10-01 08:00:00+00'),
(2, 'elena.rostova', 'elena@taskforge.dev', '$2a$10$FTQ6OoTx8CVQGTl3pqrXgur8tswtuHs2StZd/r9.Of0gFHW960yTK', 'Elena Rostova', 'Senior Operations Manager', '#436B8A', TIMESTAMP '2026-10-01 08:00:00+00', TIMESTAMP '2026-10-01 08:00:00+00'),
(3, 'marcus.vance', 'marcus@taskforge.dev', '$2a$10$FTQ6OoTx8CVQGTl3pqrXgur8tswtuHs2StZd/r9.Of0gFHW960yTK', 'Marcus Vance', 'DevOps & Site Reliability', '#34765B', TIMESTAMP '2026-10-02 09:00:00+00', TIMESTAMP '2026-10-02 09:00:00+00'),
(4, 'sophia.chen', 'sophia@taskforge.dev', '$2a$10$FTQ6OoTx8CVQGTl3pqrXgur8tswtuHs2StZd/r9.Of0gFHW960yTK', 'Sophia Chen', 'QA Automation & Systems Engineer', '#B77A22', TIMESTAMP '2026-10-02 09:30:00+00', TIMESTAMP '2026-10-02 09:30:00+00');

-- Workspaces
INSERT INTO workspaces (id, name, slug, description, created_by, created_at, updated_at)
VALUES 
(1, 'Core Engineering Operations', 'core-engineering', 'Primary mission workspace for system architecture, runtime pipelines, and security boundaries.', 1, TIMESTAMP '2026-10-01 10:00:00+00', TIMESTAMP '2026-10-01 10:00:00+00'),
(2, 'Platform Reliability & SRE', 'platform-sre', 'Cluster infrastructure, database clustering, metrics observability, and incident operations.', 3, TIMESTAMP '2026-10-02 11:00:00+00', TIMESTAMP '2026-10-02 11:00:00+00');

-- Workspace Memberships
INSERT INTO workspace_memberships (workspace_id, user_id, role, joined_at)
VALUES 
(1, 1, 'ADMIN', TIMESTAMP '2026-10-01 10:00:00+00'),
(1, 2, 'MANAGER', TIMESTAMP '2026-10-01 10:15:00+00'),
(1, 3, 'MEMBER', TIMESTAMP '2026-10-02 11:30:00+00'),
(1, 4, 'MEMBER', TIMESTAMP '2026-10-02 11:45:00+00'),
(2, 3, 'ADMIN', TIMESTAMP '2026-10-02 12:00:00+00'),
(2, 1, 'MEMBER', TIMESTAMP '2026-10-02 12:30:00+00'),
(2, 2, 'MEMBER', TIMESTAMP '2026-10-03 09:00:00+00');

-- Tasks
INSERT INTO tasks (id, task_number, workspace_id, title, description, status, priority, creator_id, assignee_id, start_date, due_date, labels, category, estimated_hours, completed_at, created_at, updated_at)
VALUES
(1, 'TF-101', 1, 'Implement Distributed Lock for Pipeline Executors', 'Eliminate split-brain conditions across worker pods by introducing Redis/DB lease mechanisms.', 'IN_PROGRESS', 'URGENT', 1, 1, DATE '2026-10-15', DATE '2026-10-22', 'Backend,Concurrency,Architecture', 'ENGINEERING', 16.0, NULL, TIMESTAMP '2026-10-15 09:00:00+00', TIMESTAMP '2026-10-18 14:00:00+00'),
(2, 'TF-102', 1, 'Audit Workspace Isolation & RBAC Authorization Boundaries', 'Verify that zero tenant leakage occurs across API controllers and JPA repository queries.', 'IN_REVIEW', 'HIGH', 2, 3, DATE '2026-10-16', DATE '2026-10-21', 'Security,RBAC,Compliance', 'SECURITY', 8.5, NULL, TIMESTAMP '2026-10-16 11:00:00+00', TIMESTAMP '2026-10-18 16:30:00+00'),
(3, 'TF-103', 1, 'Refactor Calendar View to Support Timezone-Aware Schedulers', 'Ensure due dates and sprint milestones render with zero local UTC shift across team locations.', 'COMPLETED', 'MEDIUM', 2, 4, DATE '2026-10-12', DATE '2026-10-17', 'Frontend,UI/UX,Calendar', 'FRONTEND', 12.0, TIMESTAMP '2026-10-17 17:00:00+00', TIMESTAMP '2026-10-12 10:00:00+00', TIMESTAMP '2026-10-17 17:00:00+00'),
(4, 'TF-104', 1, 'Benchmark Database Query Latency on Task Filtering & Pagination', 'Evaluate B-tree indices on compound (workspace_id, status, due_date) columns under 100k simulated rows.', 'TODO', 'MEDIUM', 1, 3, DATE '2026-10-19', DATE '2026-10-25', 'Database,Performance', 'INFRASTRUCTURE', 6.0, NULL, TIMESTAMP '2026-10-18 09:00:00+00', TIMESTAMP '2026-10-18 09:00:00+00'),
(5, 'TF-105', 1, 'Resolve Edge-Case Race Condition on Concurrent Task Comments', 'Wrap comment submission in pessimistic transactions to preserve chronological order.', 'IN_PROGRESS', 'HIGH', 1, 1, DATE '2026-10-18', DATE '2026-10-23', 'Backend,Bugfix', 'ENGINEERING', 4.5, NULL, TIMESTAMP '2026-10-18 13:00:00+00', TIMESTAMP '2026-10-19 10:00:00+00'),
(6, 'TF-106', 1, 'Configure Actuator Health Metrics & Prometheus Scrape Targets', 'Expose JVM memory pools, thread deadlocks, and database connection pool saturation metrics.', 'COMPLETED', 'LOW', 3, 3, DATE '2026-10-10', DATE '2026-10-14', 'DevOps,Observability', 'DEVOPS', 5.0, TIMESTAMP '2026-10-14 15:00:00+00', TIMESTAMP '2026-10-10 09:00:00+00', TIMESTAMP '2026-10-14 15:00:00+00'),
(7, 'TF-107', 1, 'Design High-Density Operational Overview Grid for Mobile Drawer', 'Refine responsive layouts using CSS Grid and mobile drawers adhering to Industrial Workflow Studio tokens.', 'IN_REVIEW', 'MEDIUM', 2, 4, DATE '2026-10-17', DATE '2026-10-20', 'Frontend,Mobile,Aesthetics', 'FRONTEND', 8.0, NULL, TIMESTAMP '2026-10-17 14:00:00+00', TIMESTAMP '2026-10-18 18:00:00+00'),
(8, 'TF-108', 1, 'Conduct End-to-End Stress Test for Flyway Migration Integrity', 'Validate rollback and forward migration idempotency across distributed container restarts.', 'TODO', 'URGENT', 1, 1, DATE '2026-10-14', DATE '2026-10-18', 'QA,Migrations,Reliability', 'QA', 7.0, NULL, TIMESTAMP '2026-10-14 11:00:00+00', TIMESTAMP '2026-10-14 11:00:00+00'),
(9, 'TF-109', 1, 'Standardize API Error Response Schema with RFC 7807 Problem Details', 'Harmonize validation errors, 401 unauthorized, and 403 forbidden payload structures.', 'COMPLETED', 'LOW', 2, 2, DATE '2026-10-08', DATE '2026-10-13', 'API,Standards', 'BACKEND', 4.0, TIMESTAMP '2026-10-13 16:00:00+00', TIMESTAMP '2026-10-08 10:00:00+00', TIMESTAMP '2026-10-13 16:00:00+00'),
(10, 'TF-110', 1, 'Build Weekly Task Completion Velocity Chart Aggregator', 'Aggregate weekly closed ticket counts grouped by team member and priority category.', 'IN_PROGRESS', 'HIGH', 2, 4, DATE '2026-10-18', DATE '2026-10-24', 'Analytics,Recharts,Reporting', 'ANALYTICS', 10.0, NULL, TIMESTAMP '2026-10-18 15:00:00+00', TIMESTAMP '2026-10-19 11:00:00+00');

-- Task Comments
INSERT INTO task_comments (id, task_id, author_id, content, created_at, updated_at)
VALUES
(1, 1, 3, 'Initial lease timeout set to 3000ms. Tested with 3 concurrent workers in staging cluster.', TIMESTAMP '2026-10-16 14:00:00+00', TIMESTAMP '2026-10-16 14:00:00+00'),
(2, 1, 1, 'Reviewed PR. Ensure heartbeats are dispatched asynchronously so long executions do not forfeit lock.', TIMESTAMP '2026-10-17 09:30:00+00', TIMESTAMP '2026-10-17 09:30:00+00'),
(3, 2, 1, 'Verified controller interceptors. All repository calls now enforce workspace_id filtering.', TIMESTAMP '2026-10-17 16:00:00+00', TIMESTAMP '2026-10-17 16:00:00+00'),
(4, 7, 2, 'The sidebar collapse transition looks great on 768px tablet viewports.', TIMESTAMP '2026-10-18 11:15:00+00', TIMESTAMP '2026-10-18 11:15:00+00');

-- Task Activities
INSERT INTO task_activities (id, task_id, actor_id, action, field_name, old_value, new_value, description, created_at)
VALUES
(1, 1, 1, 'CREATED', NULL, NULL, NULL, 'Task created by Alex Turner', TIMESTAMP '2026-10-15 09:00:00+00'),
(2, 1, 1, 'STATUS_CHANGED', 'status', 'TODO', 'IN_PROGRESS', 'Status changed from TODO to IN_PROGRESS', TIMESTAMP '2026-10-16 10:00:00+00'),
(3, 2, 2, 'CREATED', NULL, NULL, NULL, 'Task created by Elena Rostova', TIMESTAMP '2026-10-16 11:00:00+00'),
(4, 2, 2, 'ASSIGNED', 'assignee', NULL, 'Marcus Vance', 'Assigned to Marcus Vance', TIMESTAMP '2026-10-16 11:30:00+00'),
(5, 2, 3, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'IN_REVIEW', 'Status updated to IN_REVIEW for architectural signoff', TIMESTAMP '2026-10-17 15:00:00+00'),
(6, 3, 2, 'STATUS_CHANGED', 'status', 'IN_REVIEW', 'COMPLETED', 'Marked as completed following acceptance tests', TIMESTAMP '2026-10-17 17:00:00+00'),
(7, 8, 1, 'PRIORITY_CHANGED', 'priority', 'HIGH', 'URGENT', 'Escalated priority to URGENT due to staging failure', TIMESTAMP '2026-10-17 18:30:00+00');

-- Notifications
INSERT INTO notifications (id, user_id, workspace_id, task_id, type, title, message, is_read, created_at)
VALUES
(1, 1, 1, 1, 'TASK_ASSIGNED', 'Assigned to TF-101', 'You were assigned to "Implement Distributed Lock for Pipeline Executors"', FALSE, TIMESTAMP '2026-10-16 10:00:00+00'),
(2, 1, 1, 2, 'REVIEW_REQUESTED', 'Review Requested on TF-102', 'Marcus Vance submitted "Audit Workspace Isolation & RBAC" for review', FALSE, TIMESTAMP '2026-10-17 15:00:00+00'),
(3, 1, 1, 8, 'DEADLINE_APPROACHING', 'Deadline Alert for TF-108', 'Task "Conduct End-to-End Stress Test for Flyway Migration Integrity" is overdue', FALSE, TIMESTAMP '2026-10-18 08:00:00+00'),
(4, 3, 1, 4, 'TASK_ASSIGNED', 'Assigned to TF-104', 'You were assigned to "Benchmark Database Query Latency on Task Filtering"', TRUE, TIMESTAMP '2026-10-18 09:00:00+00'),
(5, 4, 1, 10, 'TASK_ASSIGNED', 'Assigned to TF-110', 'Elena Rostova assigned you to "Build Weekly Task Completion Velocity Chart Aggregator"', FALSE, TIMESTAMP '2026-10-18 15:00:00+00');

-- Advance identity sequences past seed IDs to avoid primary key conflicts on subsequent inserts
ALTER TABLE users ALTER COLUMN id RESTART WITH 100;
ALTER TABLE workspaces ALTER COLUMN id RESTART WITH 100;
ALTER TABLE workspace_memberships ALTER COLUMN id RESTART WITH 100;
ALTER TABLE tasks ALTER COLUMN id RESTART WITH 100;
ALTER TABLE task_comments ALTER COLUMN id RESTART WITH 100;
ALTER TABLE task_activities ALTER COLUMN id RESTART WITH 100;
ALTER TABLE notifications ALTER COLUMN id RESTART WITH 100;
