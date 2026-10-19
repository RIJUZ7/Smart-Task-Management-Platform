import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, WorkspaceMember, PageResponse } from '../types';
import { api } from '../api/client';
import { useWorkspace } from '../context/WorkspaceContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { UserAvatar } from '../components/UserAvatar';
import { TaskModal } from '../components/TaskModal';

interface MyTasksProps {
  onOpenCreateTask: () => void;
}

export const MyTasks: React.FC<MyTasksProps> = ({ onOpenCreateTask }) => {
  const { currentWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [sortField, setSortField] = useState('dueDate,asc');

  // Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  const loadTasks = async () => {
    if (!currentWorkspace) return;
    try {
      setIsLoading(true);
      const res: PageResponse<Task> = await api.getTasks({
        workspaceId: currentWorkspace.id,
        status: statusFilter ? (statusFilter as TaskStatus) : undefined,
        priority: priorityFilter ? (priorityFilter as TaskPriority) : undefined,
        search: search.trim() || undefined,
        page,
        size: 15,
        sort: sortField,
      });
      setTasks(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      console.error('Failed to load tasks', err);
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
  }, [currentWorkspace?.id, page, statusFilter, priorityFilter, sortField]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      loadTasks();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  if (!currentWorkspace) {
    return <div className="p-8 text-center text-[#6B716C]">Select a workspace to view tasks.</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Top Filter and Actions Toolbar */}
      <div className="panel p-3.5 bg-[#FFFFFF]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              className="input pl-9 text-[13px]"
              placeholder="Search by title, TF number, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B716C]" />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="select font-mono text-[12px] py-1.5 w-auto"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Statuses</option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="IN_REVIEW">IN_REVIEW</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>

            <select
              className="select font-mono text-[12px] py-1.5 w-auto"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Priorities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>

            <select
              className="select font-mono text-[12px] py-1.5 w-auto"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="dueDate,asc">Deadline (Earliest)</option>
              <option value="dueDate,desc">Deadline (Latest)</option>
              <option value="priority,desc">Priority (High to Low)</option>
              <option value="createdAt,desc">Created (Newest)</option>
              <option value="updatedAt,desc">Recently Updated</option>
            </select>

            <button
              onClick={onOpenCreateTask}
              className="btn btn-primary btn-sm ml-auto sm:ml-0 font-medium"
            >
              <Plus size={14} />
              <span>Create Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Task Table View */}
      <div className="table-container">
        <table className="taskforge-table">
          <thead>
            <tr>
              <th style={{ width: 100 }}>ID</th>
              <th>Task Summary</th>
              <th style={{ width: 130 }}>Status</th>
              <th style={{ width: 100 }}>Priority</th>
              <th style={{ width: 160 }}>Assignee</th>
              <th style={{ width: 120 }}>Deadline</th>
              <th style={{ width: 80 }} className="text-right">Notes</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#6B716C] font-mono text-[12px]">
                  Querying workspace index...
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#6B716C]">
                  No matching work items found in workspace for the current filter criteria.
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
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          name={task.assignee.fullName}
                          avatarColor={task.assignee.avatarColor}
                          size={22}
                        />
                        <span className="text-[12px] text-[#202421] truncate max-w-[120px]">
                          {task.assignee.fullName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[12px] text-[#6B716C] italic">Unassigned</span>
                    )}
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

        {/* Server-Side Pagination Bar */}
        <div className="p-3 border-t border-[#E1E3DD] bg-[#FAFAF7] flex items-center justify-between text-[12px] text-[#6B716C]">
          <span className="font-mono">
            Showing <strong className="text-[#202421]">{tasks.length}</strong> of{' '}
            <strong className="text-[#202421]">{totalElements}</strong> work items
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

      {/* Task Modal Details */}
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
