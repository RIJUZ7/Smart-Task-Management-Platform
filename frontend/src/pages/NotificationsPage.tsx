import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Check,
  Clock,
  ArrowRight,
  AlertTriangle,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import { NotificationItem, NotificationType } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { useWorkspace } from '../context/WorkspaceContext';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'TASK_ASSIGNED':
      case 'TASK_REASSIGNED':
        return <UserCheck size={16} className="text-[#F26B38]" />;
      case 'DEADLINE_APPROACHING':
        return <AlertTriangle size={16} className="text-[#BF4545]" />;
      case 'REVIEW_REQUESTED':
        return <Clock size={16} className="text-[#B77A22]" />;
      case 'COMMENT_ADDED':
        return <MessageSquare size={16} className="text-[#436B8A]" />;
      default:
        return <Bell size={16} className="text-[#6B716C]" />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      {/* Header Panel */}
      <div className="panel p-4 bg-[#FFFFFF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Bell size={20} className="text-[#F26B38]" />
            <div>
              <h2 className="font-heading text-[16px] font-semibold text-[#202421]">
                Notification Center
              </h2>
              <p className="text-[12px] text-[#6B716C]">
                In-app alerts for task assignments, reviews, approaching deadlines, and discussions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-[#E1E3DD] rounded p-0.5 bg-[#F5F5F2]">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                  filter === 'all' ? 'bg-white text-[#202421] font-bold shadow-xs' : 'text-[#6B716C]'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                  filter === 'unread' ? 'bg-white text-[#F26B38] font-bold shadow-xs' : 'text-[#6B716C]'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
              >
                <CheckCheck size={14} />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="panel p-0 bg-[#FFFFFF] divide-y divide-[#E1E3DD]">
        {isLoading && notifications.length === 0 ? (
          <div className="text-center py-12 font-mono text-[12px] text-[#6B716C]">
            Checking notification records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[#6B716C] text-[13px]">
            {filter === 'unread' ? 'No unread notifications.' : 'No notification history recorded.'}
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex items-start justify-between gap-3.5 transition-colors ${
                !item.isRead ? 'bg-[#FFF0E8]/25' : 'hover:bg-[#FAFAF7]'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5 p-1.5 rounded bg-[#F5F5F2] border border-[#E1E3DD] shrink-0">
                  {getIcon(item.type)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#202421]">
                      {item.title}
                    </span>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#F26B38] shrink-0" />
                    )}
                    {item.taskNumber && (
                      <span className="font-mono text-[10px] text-[#F26B38] font-bold bg-[#FFF0E8] px-1.5 py-0.2 rounded border border-[#F26B38]/20">
                        {item.taskNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#6B716C]">
                    {item.message}
                  </p>
                  <div className="font-mono text-[10px] text-[#6B716C] pt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {!item.isRead && (
                <button
                  onClick={() => markAsRead(item.id)}
                  className="btn btn-ghost btn-sm text-[#6B716C] hover:text-[#34765B] shrink-0"
                  title="Mark as read"
                >
                  <Check size={14} />
                  <span className="hidden sm:inline">Mark Read</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
