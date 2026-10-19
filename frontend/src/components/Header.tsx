import React from 'react';
import { Menu, Plus, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenCreateTask: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenCreateTask,
  title,
}) => {
  const { currentWorkspace } = useWorkspace();
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  return (
    <header className="h-14 bg-[#FFFFFF] border-b border-[#E1E3DD] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-1.5 rounded hover:bg-[#ECEEE8] text-[#202421]"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2.5">
          <h1 className="text-[17px] font-heading font-semibold text-[#202421] tracking-tight">
            {title}
          </h1>
          {currentWorkspace && (
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] bg-[#ECEEE8] text-[#6B716C] px-2 py-0.5 rounded border border-[#E1E3DD]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34765B]" />
              {currentWorkspace.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick New Task Action */}
        <button
          onClick={onOpenCreateTask}
          className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-xs font-semibold"
          id="btn-quick-new-task"
        >
          <Plus size={14} />
          <span>New Task</span>
        </button>

        {/* Notifications Icon with Badge */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-md hover:bg-[#ECEEE8] text-[#6B716C] hover:text-[#202421] transition-colors"
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 font-mono text-[9px] bg-[#F26B38] text-white px-1 rounded-full font-bold leading-tight">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Avatar */}
        <Link to="/settings" title="Profile Settings">
          <UserAvatar
            name={user?.fullName || 'User'}
            avatarColor={user?.avatarColor || '#F26B38'}
            size={30}
          />
        </Link>
      </div>
    </header>
  );
};
