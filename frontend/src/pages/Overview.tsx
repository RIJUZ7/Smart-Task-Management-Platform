import React, { useState, useEffect } from 'react';
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { OverviewDashboard, Task, WorkspaceMember } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { UserAvatar } from '../components/UserAvatar';
import { TaskModal } from '../components/TaskModal';

interface OverviewProps {
  onOpenCreateTask: () => void;
}

export const Overview: React.FC<OverviewProps> = ({ onOpenCreateTask }) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [data, setData] = useState<OverviewDashboard | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!currentWorkspace) return;
    try {
      setIsLoading(true);
      const [overview, mems] = await Promise.all([
        api.getDashboardOverview(currentWorkspace.id),
        api.getMembers(currentWorkspace.id),
      ]);
      setData(overview);
      setMembers(mems);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentWorkspace?.id]);

  if (!currentWorkspace) {
    return (
      <div className="p-8 text-center text-[#6B716C]">
        No active workspace selected. Please create or choose a workspace from the sidebar.
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="p-8 flex items-center justify-center text-[#6B716C] font-mono text-[13px]">
        Loading operational command telemetry...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Precision Hero Greeting & Status Strip */}
      <div className="panel p-5 bg-[#FFFFFF]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#F26B38] font-semibold bg-[#FFF0E8] px-2 py-0.5 rounded border border-[#F26B38]/20">
                SYSTEM OPERATIONAL
              </span>
              <span className="text-[12px] font-mono text-[#6B716C]">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h2 className="text-[22px] font-heading font-bold text-[#202421]">
              Welcome back, {user?.fullName.split(' ')[0]}.
            </h2>
            <p className="text-[13px] text-[#6B716C]">
              Workspace <strong className="text-[#202421]">{currentWorkspace.name}</strong> has{' '}
              <span className="font-mono font-semibold text-[#202421]">{data?.totalTasks || 0}</span> work items tracked across execution pipelines.
            </p>
          </div>

          {/* Overall Completion Metric Strip */}
          <div className="flex items-center gap-6 bg-[#FAFAF7] p-3.5 rounded-md border border-[#E1E3DD]">
            <div>
              <div className="text-[11px] font-mono uppercase text-[#6B716C]">Completion Velocity</div>
              <div className="flex items-baseline gap-2">
                <span className="text-[24px] font-heading font-bold text-[#202421]">
                  {data?.completionProgressPct || 0}%
                </span>
                <span className="text-[11px] font-mono text-[#34765B]">
                  ({data?.completedCount}/{data?.totalTasks} Closed)
                </span>
              </div>
              <div className="w-36 h-2 bg-[#ECEEE8] rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-[#34765B] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, data?.completionProgressPct || 0)}%` }}
                />
              </div>
            </div>

            <button
              onClick={onOpenCreateTask}
              className="btn btn-primary btn-sm shrink-0 font-medium"
            >
              + Create Task
            </button>
          </div>
        </div>
      </div>

      {/* Structured Operational Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Due Today */}
        <div className="panel p-4 bg-[#FFFFFF]">
          <div className="flex items-center justify-between text-[#6B716C] mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Due Today</span>
            <Calendar size={16} className="text-[#436B8A]" />
          </div>
          <div className="text-[26px] font-heading font-bold text-[#202421]">
            {data?.dueTodayCount || 0}
          </div>
          <p className="text-[12px] text-[#6B716C] mt-1">
            Tasks scheduled for completion today
          </p>
        </div>

        {/* Overdue */}
        <div className="panel p-4 bg-[#FFFFFF]">
          <div className="flex items-center justify-between text-[#6B716C] mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Overdue Tasks</span>
            <AlertTriangle size={16} className={data?.overdueCount ? 'text-[#BF4545]' : 'text-[#6B716C]'} />
          </div>
          <div className={`text-[26px] font-heading font-bold ${data?.overdueCount ? 'text-[#BF4545]' : 'text-[#202421]'}`}>
            {data?.overdueCount || 0}
          </div>
          <p className="text-[12px] text-[#6B716C] mt-1">
            {data?.overdueCount ? 'Action required: Missed deadlines' : 'No overdue work items'}
          </p>
        </div>

        {/* Awaiting Review */}
        <div className="panel p-4 bg-[#FFFFFF]">
          <div className="flex items-center justify-between text-[#6B716C] mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">In Review</span>
            <Clock size={16} className="text-[#B77A22]" />
          </div>
          <div className="text-[26px] font-heading font-bold text-[#202421]">
            {data?.awaitingReviewCount || 0}
          </div>
          <p className="text-[12px] text-[#6B716C] mt-1">
            Pending architectural and QA signoff
          </p>
        </div>

        {/* Total Completed */}
        <div className="panel p-4 bg-[#FFFFFF]">
          <div className="flex items-center justify-between text-[#6B716C] mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold">Total Completed</span>
            <CheckCircle2 size={16} className="text-[#34765B]" />
          </div>
          <div className="text-[26px] font-heading font-bold text-[#34765B]">
            {data?.completedCount || 0}
          </div>
          <p className="text-[12px] text-[#6B716C] mt-1">
            Successfully merged &amp; accepted
          </p>
        </div>
      </div>

      {/* Core Center Grid: Velocity Chart + Urgent/Due Today Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Completion Velocity Chart */}
        <div className="panel lg:col-span-2 flex flex-col">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#F26B38]" />
              <h3 className="font-heading text-[14px] font-semibold text-[#202421]">
                Weekly Completion Velocity Trend
              </h3>
            </div>
            <span className="font-mono text-[11px] text-[#6B716C]">
              Past 5 Rolling Weeks
            </span>
          </div>

          <div className="panel-body flex-1 min-h-[220px]">
            {data?.weeklyVelocity && data.weeklyVelocity.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.weeklyVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F26B38" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#F26B38" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECEEE8" vertical={false} />
                  <XAxis
                    dataKey="weekLabel"
                    tick={{ fill: '#6B716C', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={{ stroke: '#E1E3DD' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#6B716C', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={{ stroke: '#E1E3DD' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E1E3DD',
                      borderRadius: 4,
                      fontSize: 12,
                      fontFamily: 'Inter',
                      boxShadow: '0 4px 12px rgba(32,36,33,0.08)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completedCount"
                    name="Completed Tasks"
                    stroke="#F26B38"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#velocityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#6B716C] text-[13px]">
                No velocity telemetry recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Due Today & Overdue Spotlight */}
        <div className="panel flex flex-col">
          <div className="panel-header">
            <h3 className="font-heading text-[14px] font-semibold text-[#202421]">
              Deadlines &amp; Urgent Queue
            </h3>
            <span className="font-mono text-[11px] text-[#6B716C]">
              {(data?.dueTodayTasks.length || 0) + (data?.overdueTasks.length || 0)} Items
            </span>
          </div>

          <div className="panel-body p-0 flex-1 divide-y divide-[#E1E3DD] overflow-y-auto max-h-[260px]">
            {data?.overdueTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className="p-3 hover:bg-[#FDF1F1]/50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex flex-col overflow-hidden pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#BF4545] bg-[#FDF1F1] px-1.5 py-0.2 rounded">
                      {t.taskNumber}
                    </span>
                    <span className="text-[13px] font-medium text-[#202421] truncate">
                      {t.title}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#BF4545] mt-0.5">
                    Overdue: Due {t.dueDate}
                  </span>
                </div>
                <PriorityBadge priority={t.priority} />
              </div>
            ))}

            {data?.dueTodayTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className="p-3 hover:bg-[#FAFAF7] cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex flex-col overflow-hidden pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#436B8A] bg-[#EDF3F7] px-1.5 py-0.2 rounded">
                      {t.taskNumber}
                    </span>
                    <span className="text-[13px] font-medium text-[#202421] truncate">
                      {t.title}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#436B8A] mt-0.5">
                    Due Today
                  </span>
                </div>
                <PriorityBadge priority={t.priority} />
              </div>
            ))}

            {(!data?.overdueTasks.length && !data?.dueTodayTasks.length) && (
              <div className="p-6 text-center text-[#6B716C] text-[13px]">
                No pending overdue or due-today items in this workspace.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recently Updated Tasks + Live Team Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Updated Work Items */}
        <div className="panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-[#436B8A]" />
              <h3 className="font-heading text-[14px] font-semibold text-[#202421]">
                Recently Updated Tasks
              </h3>
            </div>
            <span className="font-mono text-[11px] text-[#6B716C]">
              Latest Pipeline Changes
            </span>
          </div>

          <div className="divide-y divide-[#E1E3DD]">
            {data?.recentlyUpdatedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="p-3.5 hover:bg-[#FAFAF7] cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                  <span className="font-mono text-[11px] font-semibold text-[#6B716C] shrink-0">
                    {task.taskNumber}
                  </span>
                  <div className="flex flex-col truncate">
                    <span className="text-[13px] font-medium text-[#202421] truncate">
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-[#6B716C]">
                      <span>{task.category || 'GENERAL'}</span>
                      {task.assignee && (
                        <>
                          <span>•</span>
                          <span>{task.assignee.fullName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Workspace Activity Feed */}
        <div className="panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-[#34765B]" />
              <h3 className="font-heading text-[14px] font-semibold text-[#202421]">
                Live Team Operations Stream
              </h3>
            </div>
            <span className="font-mono text-[11px] text-[#6B716C]">
              Server-Verified Events
            </span>
          </div>

          <div className="p-4 space-y-3.5 max-h-[340px] overflow-y-auto">
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-[12px]">
                  <UserAvatar
                    name={act.actor.fullName}
                    avatarColor={act.actor.avatarColor}
                    size={24}
                  />
                  <div className="flex-1">
                    <div className="text-[#202421] leading-snug">
                      <strong className="font-semibold">{act.actor.fullName}</strong>{' '}
                      <span className="text-[#6B716C]">{act.description}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-[#6B716C] mt-0.5">
                      <span className="text-[#F26B38]">{act.taskNumber}</span>
                      <span>•</span>
                      <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#6B716C] text-[13px]">
                No operational activity recorded in this workspace.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Modal for Quick View / Edit */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          workspaceId={currentWorkspace.id}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={() => {
            loadData();
          }}
          onTaskDeleted={() => {
            setSelectedTask(null);
            loadData();
          }}
          members={members}
        />
      )}
    </div>
  );
};
