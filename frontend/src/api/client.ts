import {
  User,
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
  Task,
  TaskStatus,
  TaskPriority,
  TaskComment,
  TaskActivity,
  NotificationItem,
  AnalyticsOverview,
  OverviewDashboard,
  PageResponse
} from '../types';

const API_BASE = 'http://localhost:8080/api';

function getToken(): string | null {
  return localStorage.getItem('taskforge_token');
}

export function setToken(token: string): void {
  localStorage.setItem('taskforge_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('taskforge_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear token if expired
    if (!endpoint.includes('/auth/login')) {
      removeToken();
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.message) {
        errorMessage = errorJson.message;
      }
      if (errorJson.details) {
        const detailsStr = Object.entries(errorJson.details).map(([k, v]) => `${k}: ${v}`).join(', ');
        errorMessage += ` (${detailsStr})`;
      }
    } catch {
      // fallback
    }
    throw new Error(errorMessage);
  }

  // Check if response has content
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

export const api = {
  // Auth
  login: (data: { usernameOrEmail: string; password: string }) =>
    request<{ token: string; tokenType: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: { username: string; email: string; password: string; fullName: string; jobTitle?: string }) =>
    request<{ token: string; tokenType: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<User>('/users/me'),

  updateProfile: (data: { fullName: string; jobTitle?: string; avatarColor?: string }) =>
    request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/users/me/password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Workspaces
  getWorkspaces: () => request<Workspace[]>('/workspaces'),

  getWorkspace: (id: number) => request<Workspace>(`/workspaces/${id}`),

  createWorkspace: (data: { name: string; slug: string; description?: string }) =>
    request<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateWorkspace: (id: number, data: { name: string; description?: string }) =>
    request<Workspace>(`/workspaces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getMembers: (workspaceId: number) =>
    request<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`),

  addMember: (workspaceId: number, data: { usernameOrEmail: string; role: WorkspaceRole }) =>
    request<WorkspaceMember>(`/workspaces/${workspaceId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMemberRole: (workspaceId: number, userId: number, role: WorkspaceRole) =>
    request<{ message: string }>(`/workspaces/${workspaceId}/members/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  removeMember: (workspaceId: number, userId: number) =>
    request<{ message: string }>(`/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
    }),

  // Tasks
  getTasks: (params: {
    workspaceId: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: number;
    search?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    page?: number;
    size?: number;
    sort?: string;
  }) => {
    const query = new URLSearchParams();
    query.set('workspaceId', params.workspaceId.toString());
    if (params.status) query.set('status', params.status);
    if (params.priority) query.set('priority', params.priority);
    if (params.assigneeId) query.set('assigneeId', params.assigneeId.toString());
    if (params.search) query.set('search', params.search);
    if (params.dueDateFrom) query.set('dueDateFrom', params.dueDateFrom);
    if (params.dueDateTo) query.set('dueDateTo', params.dueDateTo);
    if (params.page !== undefined) query.set('page', params.page.toString());
    if (params.size !== undefined) query.set('size', params.size.toString());
    if (params.sort) query.set('sort', params.sort);

    return request<PageResponse<Task>>(`/tasks?${query.toString()}`);
  },

  getTask: (taskId: number, workspaceId: number) =>
    request<Task>(`/tasks/${taskId}?workspaceId=${workspaceId}`),

  createTask: (data: {
    workspaceId: number;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: number;
    startDate?: string;
    dueDate?: string;
    labels?: string;
    category?: string;
    estimatedHours?: number;
  }) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (taskId: number, workspaceId: number, data: Partial<Task> & { assigneeId?: number }) =>
    request<Task>(`/tasks/${taskId}?workspaceId=${workspaceId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateTaskStatus: (taskId: number, workspaceId: number, status: TaskStatus) =>
    request<Task>(`/tasks/${taskId}/status?workspaceId=${workspaceId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deleteTask: (taskId: number, workspaceId: number) =>
    request<{ message: string }>(`/tasks/${taskId}?workspaceId=${workspaceId}`, {
      method: 'DELETE',
    }),

  getMyTasks: (workspaceId?: number, page = 0, size = 20) => {
    const q = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (workspaceId) q.set('workspaceId', workspaceId.toString());
    return request<PageResponse<Task>>(`/tasks/my?${q.toString()}`);
  },

  getAssignedToMe: (workspaceId?: number, page = 0, size = 20) => {
    const q = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (workspaceId) q.set('workspaceId', workspaceId.toString());
    return request<PageResponse<Task>>(`/tasks/assigned-to-me?${q.toString()}`);
  },

  getCalendarTasks: (workspaceId: number, start: string, end: string) =>
    request<Task[]>(`/tasks/calendar?workspaceId=${workspaceId}&start=${start}&end=${end}`),

  // Comments
  getComments: (taskId: number, workspaceId: number) =>
    request<TaskComment[]>(`/tasks/${taskId}/comments?workspaceId=${workspaceId}`),

  addComment: (taskId: number, workspaceId: number, content: string) =>
    request<TaskComment>(`/tasks/${taskId}/comments?workspaceId=${workspaceId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  // Activities
  getTaskActivities: (taskId: number, workspaceId: number) =>
    request<TaskActivity[]>(`/tasks/${taskId}/activity?workspaceId=${workspaceId}`),

  getWorkspaceActivities: (workspaceId: number, limit = 30) =>
    request<TaskActivity[]>(`/workspaces/${workspaceId}/activity?limit=${limit}`),

  // Notifications
  getNotifications: (page = 0, size = 30) =>
    request<NotificationItem[]>(`/notifications?page=${page}&size=${size}`),

  getUnreadNotifications: () => request<NotificationItem[]>('/notifications/unread'),

  getUnreadNotificationCount: () => request<{ unreadCount: number }>('/notifications/count'),

  markNotificationAsRead: (id: number) =>
    request<NotificationItem>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsAsRead: () =>
    request<{ message: string }>('/notifications/mark-all-read', { method: 'POST' }),

  // Analytics
  getAnalyticsOverview: (workspaceId: number) =>
    request<AnalyticsOverview>(`/analytics/overview?workspaceId=${workspaceId}`),

  getDashboardOverview: (workspaceId: number) =>
    request<OverviewDashboard>(`/analytics/dashboard?workspaceId=${workspaceId}`),
};
