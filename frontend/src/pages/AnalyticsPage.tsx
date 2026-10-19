import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { AnalyticsOverview } from '../types';
import { api } from '../api/client';
import { useWorkspace } from '../context/WorkspaceContext';
import { UserAvatar } from '../components/UserAvatar';

export const AnalyticsPage: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    if (!currentWorkspace) return;
    try {
      setIsLoading(true);
      const res = await api.getAnalyticsOverview(currentWorkspace.id);
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [currentWorkspace?.id]);

  if (!currentWorkspace) {
    return <div className="p-8 text-center text-[#6B716C]">Select a workspace.</div>;
  }

  // Format Status for Pie Chart
  const statusPieData = data?.taskDistributionByStatus
    ? [
        { name: 'To Do', value: data.taskDistributionByStatus.TODO || 0, color: '#6B716C' },
        { name: 'In Progress', value: data.taskDistributionByStatus.IN_PROGRESS || 0, color: '#F26B38' },
        { name: 'In Review', value: data.taskDistributionByStatus.IN_REVIEW || 0, color: '#436B8A' },
        { name: 'Completed', value: data.taskDistributionByStatus.COMPLETED || 0, color: '#34765B' },
      ].filter((item) => item.value > 0)
    : [];

  // Format Priority for Bar Chart
  const priorityBarData = data?.taskDistributionByPriority
    ? [
        { name: 'Low', count: data.taskDistributionByPriority.LOW || 0, fill: '#6B716C' },
        { name: 'Medium', count: data.taskDistributionByPriority.MEDIUM || 0, fill: '#436B8A' },
        { name: 'High', count: data.taskDistributionByPriority.HIGH || 0, fill: '#B77A22' },
        { name: 'Urgent', count: data.taskDistributionByPriority.URGENT || 0, fill: '#BF4545' },
      ]
    : [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Overview Stat Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="panel p-4 bg-[#FFFFFF]">
          <span className="text-[11px] font-mono uppercase text-[#6B716C] font-semibold">Total Tasks</span>
          <div className="text-[24px] font-heading font-bold text-[#202421] mt-1">
            {data?.totalTasks || 0}
          </div>
          <span className="text-[11px] font-mono text-[#6B716C]">All recorded items</span>
        </div>

        <div className="panel p-4 bg-[#FFFFFF]">
          <span className="text-[11px] font-mono uppercase text-[#6B716C] font-semibold">Completed</span>
          <div className="text-[24px] font-heading font-bold text-[#34765B] mt-1">
            {data?.completedTasks || 0}
          </div>
          <span className="text-[11px] font-mono text-[#34765B]">Passed validation</span>
        </div>

        <div className="panel p-4 bg-[#FFFFFF]">
          <span className="text-[11px] font-mono uppercase text-[#6B716C] font-semibold">Active In-Flight</span>
          <div className="text-[24px] font-heading font-bold text-[#F26B38] mt-1">
            {data?.activeTasks || 0}
          </div>
          <span className="text-[11px] font-mono text-[#F26B38]">In backlog / progress</span>
        </div>

        <div className="panel p-4 bg-[#FFFFFF]">
          <span className="text-[11px] font-mono uppercase text-[#6B716C] font-semibold">Overdue</span>
          <div className={`text-[24px] font-heading font-bold mt-1 ${data?.overdueTasks ? 'text-[#BF4545]' : 'text-[#202421]'}`}>
            {data?.overdueTasks || 0}
          </div>
          <span className="text-[11px] font-mono text-[#BF4545]">Past deadline</span>
        </div>

        <div className="panel p-4 bg-[#FFFFFF] col-span-2 md:col-span-1">
          <span className="text-[11px] font-mono uppercase text-[#6B716C] font-semibold">Completion Rate</span>
          <div className="text-[24px] font-heading font-bold text-[#202421] mt-1">
            {data?.completionRate || 0}%
          </div>
          <span className="text-[11px] font-mono text-[#436B8A]">Closed ratio</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Completion Velocity */}
        <div className="panel p-5 bg-[#FFFFFF]">
          <div className="panel-header -mx-5 -mt-5 mb-4 border-b border-[#E1E3DD]">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#F26B38]" />
              <h3 className="font-heading text-[14px] font-semibold text-[#202421]">
                Rolling Weekly Throughput (Completed vs Created)
              </h3>
            </div>
          </div>

          <div className="h-64">
            {data?.tasksCompletedPerWeek && data.tasksCompletedPerWeek.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.tasksCompletedPerWeek} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter', paddingTop: 10 }} />
                  <Bar dataKey="createdCount" name="Created Work Items" fill="#436B8A" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="completedCount" name="Completed Work Items" fill="#F26B38" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#6B716C] text-[13px]">
                No task records available for velocity calculation.
              </div>
            )}
          </div>
        </div>

        {/* Task Distribution By Status (Donut) */}
        <div className="panel p-5 bg-[#FFFFFF]">
          <div className="panel-header -mx-5 -mt-5 mb-4 border-b border-[#E1E3DD]">
            <div className="flex items-center gap-2">
              <PieIcon size={16} className="text-[#436B8A]" />
              <h3 className="font-heading text-[14px] font-semibold text-[#202421]">
                Task Distribution by Pipeline Status
              </h3>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E1E3DD',
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-[#6B716C] text-[13px]">No task records found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Team Member Workload Breakdown Table */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#34765B]" />
            <h3 className="font-heading text-[14px] font-semibold text-[#202421]">
              Team Member Workload &amp; Capacity
            </h3>
          </div>
          <span className="font-mono text-[11px] text-[#6B716C]">
            Live Authorized Telemetry
          </span>
        </div>

        <div className="table-container border-none rounded-none">
          <table className="taskforge-table">
            <thead>
              <tr>
                <th>Engineer / Team Member</th>
                <th>Total Assigned</th>
                <th>In Progress</th>
                <th>Completed</th>
                <th>Overdue</th>
                <th style={{ width: 140 }}>Completion Progress</th>
              </tr>
            </thead>
            <tbody>
              {data?.workloadByMember && data.workloadByMember.length > 0 ? (
                data.workloadByMember.map((m) => {
                  const pct = m.totalTasks > 0 ? Math.round((m.completedTasks / m.totalTasks) * 100) : 0;
                  return (
                    <tr key={m.userId}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <UserAvatar name={m.name} avatarColor={m.avatarColor} size={28} />
                          <div className="flex flex-col">
                            <span className="font-medium text-[#202421] text-[13px]">{m.name}</span>
                            <span className="font-mono text-[11px] text-[#6B716C]">{m.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="font-mono text-[12px] font-semibold text-[#202421]">
                          {m.totalTasks}
                        </span>
                      </td>

                      <td>
                        <span className="font-mono text-[12px] text-[#F26B38] font-semibold">
                          {m.inProgressTasks}
                        </span>
                      </td>

                      <td>
                        <span className="font-mono text-[12px] text-[#34765B] font-semibold">
                          {m.completedTasks}
                        </span>
                      </td>

                      <td>
                        <span className={`font-mono text-[12px] font-semibold ${m.overdueTasks > 0 ? 'text-[#BF4545]' : 'text-[#6B716C]'}`}>
                          {m.overdueTasks}
                        </span>
                      </td>

                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[#ECEEE8] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#F26B38] rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-[#6B716C] w-9 text-right">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#6B716C]">
                    No assigned member workloads recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
