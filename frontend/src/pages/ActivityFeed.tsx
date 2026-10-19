import React, { useState, useEffect } from 'react';
import {
  Activity,
  Filter,
  RefreshCw,
  PlusCircle,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { TaskActivity, ActivityAction } from '../types';
import { api } from '../api/client';
import { useWorkspace } from '../context/WorkspaceContext';
import { UserAvatar } from '../components/UserAvatar';

export const ActivityFeed: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadActivities = async () => {
    if (!currentWorkspace) return;
    try {
      setIsLoading(true);
      const list = await api.getWorkspaceActivities(currentWorkspace.id, 50);
      setActivities(list);
    } catch (err) {
      console.error('Failed to load activities', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [currentWorkspace?.id]);

  const filtered = activities.filter((a) => {
    if (actionFilter && a.action !== actionFilter) return false;
    return true;
  });

  const getActionBadge = (action: ActivityAction) => {
    switch (action) {
      case 'CREATED':
        return <span className="badge badge-completed">CREATED</span>;
      case 'STATUS_CHANGED':
        return <span className="badge badge-in_progress">STATUS</span>;
      case 'PRIORITY_CHANGED':
        return <span className="badge badge-urgent">PRIORITY</span>;
      case 'ASSIGNED':
      case 'REASSIGNED':
        return <span className="badge badge-medium">ASSIGNMENT</span>;
      case 'COMMENT_ADDED':
        return <span className="badge badge-todo">COMMENT</span>;
      default:
        return <span className="badge badge-todo">{action}</span>;
    }
  };

  if (!currentWorkspace) {
    return <div className="p-8 text-center text-[#6B716C]">Select a workspace.</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
      {/* Top Filter Bar */}
      <div className="panel p-3.5 bg-[#FFFFFF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Activity size={18} className="text-[#F26B38]" />
            <div>
              <h2 className="font-heading text-[16px] font-semibold text-[#202421]">
                Workspace Audit Trail &amp; Activity Log
              </h2>
              <p className="text-[12px] text-[#6B716C]">
                Chronological operations history generated from live database mutations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="select font-mono text-[12px] py-1.5 w-auto"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="">All Action Types</option>
              <option value="CREATED">CREATED</option>
              <option value="STATUS_CHANGED">STATUS_CHANGED</option>
              <option value="PRIORITY_CHANGED">PRIORITY_CHANGED</option>
              <option value="ASSIGNED">ASSIGNED / REASSIGNED</option>
              <option value="COMMENT_ADDED">COMMENT_ADDED</option>
              <option value="UPDATED">UPDATED</option>
            </select>

            <button
              onClick={loadActivities}
              disabled={isLoading}
              className="btn btn-secondary btn-sm"
              title="Refresh Activity"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="panel p-5 bg-[#FFFFFF]">
        {isLoading ? (
          <div className="text-center py-12 font-mono text-[12px] text-[#6B716C]">
            Fetching server audit stream...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[#6B716C]">
            No recorded operations found for selected action filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-start gap-3.5 pb-4 border-b border-[#ECEEE8] last:border-none last:pb-0"
              >
                <UserAvatar
                  name={item.actor.fullName}
                  avatarColor={item.actor.avatarColor}
                  size={32}
                />

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-[#202421]">
                      {item.actor.fullName}
                    </span>
                    {getActionBadge(item.action)}
                    <span className="font-mono text-[11px] font-bold text-[#F26B38] bg-[#FFF0E8] px-1.5 py-0.2 rounded border border-[#F26B38]/20">
                      {item.taskNumber}
                    </span>
                    <span className="text-[13px] font-medium text-[#202421] truncate max-w-sm">
                      {item.taskTitle}
                    </span>
                  </div>

                  <p className="text-[13px] text-[#6B716C] leading-relaxed">
                    {item.description}
                  </p>

                  {item.oldValue && item.newValue && (
                    <div className="mt-1 font-mono text-[11px] bg-[#F5F5F2] px-2 py-1 rounded inline-flex items-center gap-1.5 border border-[#E1E3DD]">
                      <span className="text-[#BF4545] line-through">{item.oldValue}</span>
                      <ArrowRight size={12} className="text-[#6B716C]" />
                      <span className="text-[#34765B] font-semibold">{item.newValue}</span>
                    </div>
                  )}

                  <div className="font-mono text-[10px] text-[#6B716C] mt-1.5">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
