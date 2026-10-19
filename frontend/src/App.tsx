import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CreateWorkspaceModal } from './components/CreateWorkspaceModal';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Overview } from './pages/Overview';
import { MyTasks } from './pages/MyTasks';
import { AssignedToMe } from './pages/AssignedToMe';
import { TeamWorkspace } from './pages/TeamWorkspace';
import { CalendarPage } from './pages/CalendarPage';
import { ActivityFeed } from './pages/ActivityFeed';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './api/client';
import { WorkspaceMember } from './types';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Operational Overview',
  '/my-tasks': 'My Tasks & Pipeline',
  '/assigned-to-me': 'Assigned to Me',
  '/workspace': 'Team Workspace & Directory',
  '/calendar': 'Operational Calendar',
  '/activity': 'Activity Feed & Audit Trail',
  '/analytics': 'Productivity & Throughput Analytics',
  '/notifications': 'Notification Center',
  '/settings': 'Account & Studio Settings',
};

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('taskforge_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  useEffect(() => {
    if (currentWorkspace) {
      api.getMembers(currentWorkspace.id).then(setMembers).catch(console.error);
    }
  }, [currentWorkspace?.id]);

  const handleToggleCollapse = () => {
    const next = !isSidebarCollapsed;
    setIsSidebarCollapsed(next);
    localStorage.setItem('taskforge_sidebar_collapsed', String(next));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F2] flex items-center justify-center font-mono text-[13px] text-[#6B716C]">
        Connecting to TASKFORGE engine...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentTitle = PAGE_TITLES[location.pathname] || 'TASKFORGE Studio';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F5F2]">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onOpenCreateWorkspace={() => setIsCreateWorkspaceOpen(true)}
      />

      {/* Main Operational Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          title={currentTitle}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          onOpenCreateTask={() => setIsCreateTaskOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Overview onOpenCreateTask={() => setIsCreateTaskOpen(true)} />} />
            <Route path="/my-tasks" element={<MyTasks onOpenCreateTask={() => setIsCreateTaskOpen(true)} />} />
            <Route path="/assigned-to-me" element={<AssignedToMe onOpenCreateTask={() => setIsCreateTaskOpen(true)} />} />
            <Route path="/workspace" element={<TeamWorkspace />} />
            <Route path="/calendar" element={<CalendarPage onOpenCreateTask={() => setIsCreateTaskOpen(true)} />} />
            <Route path="/activity" element={<ActivityFeed />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Modals */}
      {currentWorkspace && (
        <CreateTaskModal
          isOpen={isCreateTaskOpen}
          workspaceId={currentWorkspace.id}
          members={members}
          onClose={() => setIsCreateTaskOpen(false)}
          onTaskCreated={() => {
            // Re-render handled by current view or query
            window.dispatchEvent(new CustomEvent('taskforge:taskCreated'));
          }}
        />
      )}

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;
