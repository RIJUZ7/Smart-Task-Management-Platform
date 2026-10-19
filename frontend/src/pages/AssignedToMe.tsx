import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Calendar,
  AlertTriangle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Task, WorkspaceMember, PageResponse } from '../types';
import { api } from '../api/client';
import { useWorkspace } from '../context/WorkspaceContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { TaskModal } from '../components/TaskModal';

interface AssignedToMeProps {
  onOpenCreateTask: () => void;
}

export const AssignedToMe: React.FC<AssignedToMeProps> = ({ onOpenCreateTask }) => {
  const { currentWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  const loadTasks = async () => {
    if (!currentWorkspace) return;
    try {
      setIsLoading(true);
      const res: PageResponse<Task> = await api.getAssignedToMe(currentWorkspace.id, page, 15);
      setTasks(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      console.error('Failed to load assigned tasks', err);
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
    loadTasks();
  }, [currentWorkspace?.id, page]);

  if (!currentWorkspace) {
    return <div className="p-8 text-center text-[#6B716C]">Select a workspace.</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="panel p-4 bg-[#FFFFFF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <UserCheck size={20} className="text-[#F26B38]" />
            <div>
              <h2 className="font-heading text-[16px] font-semibold text-[#202421]">
                My Assigned Execution Queue
              </h2>
              <p className="text-[12px] text-[#6B716C]">
                Tasks directly assigned to your account in {currentWorkspace.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] bg-[#ECEEE8] text-[#202421] px-2.5 py-1 rounded border border-[#E1E3DD]">
              <strong>{totalElements}</strong> Assigned
            </span>
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

      {/* Table */}
      <div className="table-container">
        <table className="taskforge-table">
          <thead>
            <tr>
              <th style={{ width: 100 }}>ID</th>
              <th>Task Summary</th>
              <th style={{ width: 130 }}>Status</th>
              <th style={{ width: 100 }}>Priority</th>
              <th style={{ width: 120 }}>Deadline</th>
              <th style={{ width: 90 }}>Est. Hours</th>
              <th style={{ width: 70 }} className="text-right">Notes</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#6B716C] font-mono text-[12px]">
                  Loading your queue...
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#6B716C]">
                  You have no tasks assigned in this workspace. Excellent work or pick an unassigned ticket.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="cursor-pointer"
                >
                  <td className="font-mono text-[12px] font-bold text-[#F26B38]">
                    {task.taskNumber}
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-medium text-[#202421] text-[13px]">
                        {task.title}
                      </span>
                      {task.category && (
                        <span className="font-mono text-[10px] text-[#6B716C] uppercase">
                          {task.category}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={task.status} />
                  </td>
                  <td>
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td>
                    {task.dueDate ? (
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        {task.isOverdue && (
                          <AlertTriangle size={12} className="text-[#BF4545] shrink-0" />
                        )}
                        <span className={task.isOverdue ? 'text-[#BF4545] font-bold' : 'text-[#6B716C]'}>
                          {task.dueDate}
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] text-[#6B716C]">—</span>
                    )}
                  </td>
                  <td className="font-mono text-[11px] text-[#6B716C]">
                    {task.estimatedHours ? `${task.estimatedHours}h` : '—'}
                  </td>
                  <td className="text-right font-mono text-[11px] text-[#6B716C]">
                    {task.commentsCount > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare size={12} />
                        {task.commentsCount}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-[#E1E3DD] bg-[#FAFAF7] flex items-center justify-between text-[12px] text-[#6B716C]">
          <span className="font-mono">
            Showing <strong className="text-[#202421]">{tasks.length}</strong> of{' '}
            <strong className="text-[#202421]">{totalElements}</strong> assigned items
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              className="p-1.5 rounded border border-[#E1E3DD] bg-[#FFFFFF] hover:bg-[#ECEEE8] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono px-2">
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
              className="p-1.5 rounded border border-[#E1E3DD] bg-[#FFFFFF] hover:bg-[#ECEEE8] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          workspaceId={currentWorkspace.id}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={loadTasks}
          onTaskDeleted={() => {
            setSelectedTask(null);
            loadTasks();
          }}
          members={members}
        />
      )}
    </div>
  );
};
