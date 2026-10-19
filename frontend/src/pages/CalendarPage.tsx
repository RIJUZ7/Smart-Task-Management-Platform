import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Filter,
  Plus
} from 'lucide-react';
import { Task, WorkspaceMember, TaskStatus } from '../types';
import { api } from '../api/client';
import { useWorkspace } from '../context/WorkspaceContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { TaskModal } from '../components/TaskModal';

interface CalendarPageProps {
  onOpenCreateTask: () => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onOpenCreateTask }) => {
  const { currentWorkspace } = useWorkspace();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Month bounds
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const loadCalendarTasks = async () => {
    if (!currentWorkspace) return;
    try {
      setIsLoading(true);
      // Compute range covering month view plus buffer
      const startDate = new Date(year, month - 1, 20).toISOString().split('T')[0];
      const endDate = new Date(year, month + 2, 10).toISOString().split('T')[0];

      const list = await api.getCalendarTasks(currentWorkspace.id, startDate, endDate);
      setTasks(list);
    } catch (err) {
      console.error('Failed to load calendar tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentWorkspace) {
      api.getMembers(currentWorkspace.id).then(setMembers).catch(console.error);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    loadCalendarTasks();
  }, [currentWorkspace?.id, year, month]);

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Build Month Calendar Days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarCells = [];
  // Prev month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ day: d, isCurrentMonth: false, dateStr });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ day: d, isCurrentMonth: true, dateStr });
  }
  // Next month padding to fill 35 or 42 cells
  const remaining = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ day: d, isCurrentMonth: false, dateStr });
  }

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  const getTasksForDate = (dateStr: string) => {
    return filteredTasks.filter((t) => t.dueDate === dateStr);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  if (!currentWorkspace) {
    return <div className="p-8 text-center text-[#6B716C]">Select a workspace.</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Calendar Header Controls */}
      <div className="panel p-3.5 bg-[#FFFFFF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-[18px] font-bold text-[#202421]">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>

            <div className="flex items-center gap-1 border border-[#E1E3DD] rounded p-0.5 bg-[#F5F5F2]">
              <button
                onClick={handlePrev}
                className="p-1 rounded hover:bg-[#FFFFFF] text-[#6B716C] hover:text-[#202421]"
                title="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleToday}
                className="px-2 py-0.5 text-[11px] font-mono font-medium rounded hover:bg-[#FFFFFF] text-[#202421]"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded hover:bg-[#FFFFFF] text-[#6B716C] hover:text-[#202421]"
                title="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="select font-mono text-[12px] py-1.5 w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="IN_REVIEW">IN_REVIEW</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>

            <button
              onClick={onOpenCreateTask}
              className="btn btn-primary btn-sm font-medium"
            >
              <Plus size={14} />
              <span>Create Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Grid */}
      <div className="panel overflow-hidden">
        {/* Day Header Row */}
        <div className="grid grid-cols-7 border-b border-[#E1E3DD] bg-[#FAFAF7] text-center font-heading text-[11px] font-semibold text-[#6B716C] py-2 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr bg-[#E1E3DD] gap-[1px]">
          {calendarCells.map((cell, idx) => {
            const dayTasks = getTasksForDate(cell.dateStr);
            const isToday = cell.dateStr === todayStr;

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-1.5 flex flex-col transition-colors ${
                  cell.isCurrentMonth ? 'bg-[#FFFFFF]' : 'bg-[#F9FAF7] opacity-60'
                } ${isToday ? 'ring-1 ring-inset ring-[#F26B38]' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.2 rounded ${
                      isToday
                        ? 'bg-[#F26B38] text-white font-bold'
                        : 'text-[#6B716C] font-semibold'
                    }`}
                  >
                    {cell.day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="font-mono text-[10px] text-[#6B716C]">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                </div>

                {/* Day Tasks List */}
                <div className="space-y-1 overflow-y-auto max-h-[85px]">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className={`px-1.5 py-1 rounded text-[11px] font-medium truncate cursor-pointer transition-all border ${
                        t.status === 'COMPLETED'
                          ? 'bg-[#EDF6F2] text-[#34765B] border-[#34765B]/20 line-through opacity-70'
                          : t.isOverdue
                          ? 'bg-[#FDF1F1] text-[#BF4545] border-[#BF4545]/30 font-semibold'
                          : 'bg-[#FAFAF7] hover:bg-[#FFF0E8] text-[#202421] border-[#E1E3DD] hover:border-[#F26B38]/40'
                      }`}
                      title={`${t.taskNumber}: ${t.title}`}
                    >
                      <span className="font-mono text-[10px] mr-1 opacity-75">
                        {t.taskNumber}
                      </span>
                      <span>{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Modal for Details */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          workspaceId={currentWorkspace.id}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={loadCalendarTasks}
          onTaskDeleted={() => {
            setSelectedTask(null);
            loadCalendarTasks();
          }}
          members={members}
        />
      )}
    </div>
  );
};
