import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  UserCheck,
  Users,
  Calendar,
  Activity,
  BarChart3,
  Bell,
  Settings,
  ChevronDown,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { Wordmark } from './Wordmark';
import { UserAvatar } from './UserAvatar';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useNotifications } from '../context/NotificationContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenCreateWorkspace: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenCreateWorkspace,
}) => {
  const { user, logout } = useAuth();
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const { unreadCount } = useNotifications();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/my-tasks', label: 'My Tasks', icon: CheckSquare },
    { to: '/assigned-to-me', label: 'Assigned to Me', icon: UserCheck },
    { to: '/workspace', label: 'Team Workspace', icon: Users },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/activity', label: 'Activity Feed', icon: Activity },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div
      className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#E1E3DD]"
      style={{
        width: collapsed ? 68 : 256,
        transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Top Header & Brand */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#E1E3DD] shrink-0">
        <Wordmark collapsed={collapsed} />
        <button
          onClick={onToggleCollapse}
          className="hidden md:inline-flex p-1.5 rounded hover:bg-[#ECEEE8] text-[#6B716C] hover:text-[#202421] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Workspace Selector */}
      <div className="p-3 border-b border-[#E1E3DD] relative shrink-0">
        {!collapsed ? (
          <div>
            <div className="text-[10px] font-mono font-semibold uppercase text-[#6B716C] px-2 mb-1.5 tracking-wider">
              Active Workspace
            </div>
            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-[#F5F5F2] hover:bg-[#ECEEE8] border border-[#E1E3DD] transition-all text-left"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Briefcase size={14} className="text-[#F26B38] shrink-0" />
                <span className="text-[13px] font-medium text-[#202421] truncate">
                  {currentWorkspace?.name || 'No Workspace'}
                </span>
              </div>
              <ChevronDown size={14} className="text-[#6B716C] shrink-0 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {showWorkspaceMenu && (
              <div className="absolute left-3 right-3 top-[68px] z-50 bg-[#FFFFFF] border border-[#E1E3DD] rounded-md shadow-lg p-1.5">
                <div className="text-[11px] font-mono text-[#6B716C] px-2 py-1">
                  Workspaces ({workspaces.length})
                </div>
                <div className="max-h-48 overflow-y-auto my-1">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setCurrentWorkspace(ws);
                        setShowWorkspaceMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[12px] transition-colors ${
                        currentWorkspace?.id === ws.id
                          ? 'bg-[#FFF0E8] text-[#F26B38] font-semibold'
                          : 'hover:bg-[#ECEEE8] text-[#202421]'
                      }`}
                    >
                      <span className="truncate">{ws.name}</span>
                      <span className="font-mono text-[10px] opacity-75">{ws.userRole}</span>
                    </button>
                  ))}
                </div>
                <div className="pt-1.5 border-t border-[#E1E3DD]">
                  <button
                    onClick={() => {
                      setShowWorkspaceMenu(false);
                      onOpenCreateWorkspace();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[12px] font-medium text-[#F26B38] hover:bg-[#FFF0E8] transition-colors"
                  >
                    <Plus size={13} />
                    <span>Create Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded bg-[#F5F5F2] hover:bg-[#ECEEE8] border border-[#E1E3DD] text-[#F26B38]"
              title={currentWorkspace?.name || 'Workspace'}
            >
              <Briefcase size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#FFF0E8] text-[#F26B38] font-semibold shadow-xs'
                    : 'text-[#6B716C] hover:text-[#202421] hover:bg-[#ECEEE8]'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && !!item.badge && item.badge > 0 && (
                <span className="ml-auto font-mono text-[10px] bg-[#F26B38] text-white px-1.5 py-0.2 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
              {collapsed && !!item.badge && item.badge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 14,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: '#F26B38',
                  }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-[#E1E3DD] shrink-0 bg-[#FAFAF7]">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <UserAvatar
                name={user?.fullName || 'User'}
                avatarColor={user?.avatarColor || '#F26B38'}
                size={30}
              />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[13px] font-medium text-[#202421] truncate">
                  {user?.fullName || 'Authenticated User'}
                </span>
                <span className="text-[11px] font-mono text-[#6B716C] truncate">
                  {user?.jobTitle || user?.username}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded hover:bg-[#ECEEE8] text-[#6B716C] hover:text-[#BF4545] transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UserAvatar
              name={user?.fullName || 'User'}
              avatarColor={user?.avatarColor || '#F26B38'}
              size={28}
            />
            <button
              onClick={logout}
              className="p-1.5 rounded hover:bg-[#ECEEE8] text-[#6B716C] hover:text-[#BF4545]"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#242925]/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-[270px] max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
