export type WorkspaceRole = 'ADMIN' | 'MANAGER' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ActivityAction = 'CREATED' | 'STATUS_CHANGED' | 'PRIORITY_CHANGED' | 'ASSIGNED' | 'REASSIGNED' | 'COMMENT_ADDED' | 'UPDATED' | 'DELETED';
export type NotificationType = 'TASK_ASSIGNED' | 'TASK_REASSIGNED' | 'STATUS_CHANGED' | 'DEADLINE_APPROACHING' | 'REVIEW_REQUESTED' | 'COMMENT_ADDED';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  jobTitle?: string;
  avatarColor: string;
  createdAt: string;
}

export interface Workspace {
  id: number;
  name: string;
  slug: string;
  description?: string;
  userRole: WorkspaceRole;
  memberCount: number;
  taskCount: number;
  createdBy?: User;
  createdAt: string;
}

export interface WorkspaceMember {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  jobTitle?: string;
  avatarColor: string;
  role: WorkspaceRole;
  joinedAt: string;
  assignedTasksCount: number;
  completedTasksCount: number;
}

export interface Task {
  id: number;
  taskNumber: string;
  workspaceId: number;
  workspaceName?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  creator: User;
  assignee?: User;
  startDate?: string;
  dueDate?: string;
  labels?: string;
  category?: string;
  estimatedHours?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  isOverdue: boolean;
}

export interface TaskComment {
  id: number;
  taskId: number;
  author: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskActivity {
  id: number;
  taskId: number;
  taskNumber: string;
  taskTitle: string;
  actor: User;
  action: ActivityAction;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  workspaceId?: number;
  workspaceName?: string;
  taskId?: number;
  taskNumber?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface WeeklyVelocity {
  weekLabel: string;
  completedCount: number;
  createdCount: number;
}

export interface MemberWorkload {
  userId: number;
  name: string;
  email: string;
  avatarColor: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
}

export interface AnalyticsOverview {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksCompletedPerWeek: WeeklyVelocity[];
  workloadByMember: MemberWorkload[];
  taskDistributionByPriority: Record<TaskPriority, number>;
  taskDistributionByStatus: Record<TaskStatus, number>;
  completionTrends: WeeklyVelocity[];
}

export interface OverviewDashboard {
  totalTasks: number;
  dueTodayCount: number;
  overdueCount: number;
  awaitingReviewCount: number;
  completedCount: number;
  completionProgressPct: number;
  dueTodayTasks: Task[];
  overdueTasks: Task[];
  awaitingReviewTasks: Task[];
  upcomingDeadlines: Task[];
  recentlyUpdatedTasks: Task[];
  recentActivities: TaskActivity[];
  weeklyVelocity: WeeklyVelocity[];
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
