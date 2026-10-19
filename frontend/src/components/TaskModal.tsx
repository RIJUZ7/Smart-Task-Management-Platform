import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  User as UserIcon,
  Clock,
  Tag,
  MessageSquare,
  Activity,
  Trash2,
  Send,
  AlertCircle
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskComment, TaskActivity, WorkspaceMember } from '../types';
import { api } from '../api/client';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { UserAvatar } from './UserAvatar';

interface TaskModalProps {
  task: Task | null;
  workspaceId: number;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
  members: WorkspaceMember[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  workspaceId,
  isOpen,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
  members,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form edit fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState<number | undefined>(undefined);
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [labels, setLabels] = useState('');
  const [category, setCategory] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setAssigneeId(task.assignee?.id);
    setDueDate(task.dueDate || '');
    setStartDate(task.startDate || '');
    setLabels(task.labels || '');
    setCategory(task.category || '');
    setEstimatedHours(task.estimatedHours ? task.estimatedHours.toString() : '');
    setError(null);

    // Fetch comments and activity
    loadCommentsAndActivity(task.id);
  }, [task]);

  const loadCommentsAndActivity = async (taskId: number) => {
    try {
      const [comms, acts] = await Promise.all([
        api.getComments(taskId, workspaceId),
        api.getTaskActivities(taskId, workspaceId),
      ]);
      setComments(comms);
      setActivities(acts);
    } catch (err: any) {
      console.error('Failed to load comments/activities', err);
    }
  };

  if (!isOpen || !task) return null;

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);
      await api.updateTask(task.id, workspaceId, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate || undefined,
        startDate: startDate || undefined,
        labels: labels || undefined,
        category: category || undefined,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      });
      await loadCommentsAndActivity(task.id);
      onTaskUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickStatusChange = async (newStatus: TaskStatus) => {
    try {
      setStatus(newStatus);
      await api.updateTaskStatus(task.id, workspaceId, newStatus);
      await loadCommentsAndActivity(task.id);
      onTaskUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const added = await api.addComment(task.id, workspaceId, newComment.trim());
      setComments((prev) => [...prev, added]);
      setNewComment('');
      // Reload activity stream
      const acts = await api.getTaskActivities(task.id, workspaceId);
      setActivities(acts);
      onTaskUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete task ${task.taskNumber}?`)) {
      return;
    }

    try {
      await api.deleteTask(task.id, workspaceId);
      onClose();
      onTaskDeleted();
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 680 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[13px] font-bold text-[#F26B38] bg-[#FFF0E8] px-2 py-0.5 rounded border border-[#F26B38]/30">
              {task.taskNumber}
            </span>
            <StatusBadge status={status} />
            <PriorityBadge priority={priority} />
            {task.isOverdue && (
              <span className="badge badge-urgent">OVERDUE</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#ECEEE8] text-[#6B716C] hover:text-[#202421]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#E1E3DD] px-4 bg-[#FAFAF7]">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-[#F26B38] text-[#F26B38] font-semibold'
                : 'border-transparent text-[#6B716C] hover:text-[#202421]'
            }`}
          >
            Task Specifications
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-[#F26B38] text-[#F26B38] font-semibold'
                : 'border-transparent text-[#6B716C] hover:text-[#202421]'
            }`}
          >
            <MessageSquare size={14} />
            <span>Discussion ({comments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-[#F26B38] text-[#F26B38] font-semibold'
                : 'border-transparent text-[#6B716C] hover:text-[#202421]'
            }`}
          >
            <Activity size={14} />
            <span>Audit Trail ({activities.length})</span>
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 rounded bg-[#FDF1F1] border border-[#BF4545]/20 text-[#BF4545] text-[13px] flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="modal-body overflow-y-auto">
          {activeTab === 'details' && (
            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div>
                <label className="input-label">Task Title</label>
                <input
                  type="text"
                  className="input font-heading font-medium text-[15px]"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title..."
                  required
                />
              </div>

              <div>
                <label className="input-label">Description &amp; Implementation Details</label>
                <textarea
                  className="textarea"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed context, requirements, acceptance criteria..."
                />
              </div>

              {/* Status and Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Status Transition</label>
                  <select
                    className="select font-mono text-[12px]"
                    value={status}
                    onChange={(e) => handleQuickStatusChange(e.target.value as TaskStatus)}
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Priority Level</label>
                  <select
                    className="select font-mono text-[12px]"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              {/* Assignee & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Assigned Team Member</label>
                  <select
                    className="select text-[13px]"
                    value={assigneeId || ''}
                    onChange={(e) => setAssigneeId(e.target.value ? parseInt(e.target.value) : undefined)}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.fullName} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Category</label>
                  <input
                    type="text"
                    className="input font-mono text-[12px]"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. BACKEND, SECURITY, UI"
                  />
                </div>
              </div>

              {/* Dates & Effort */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="input-label">Start Date</label>
                  <input
                    type="date"
                    className="input font-mono text-[12px]"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="input-label">Due Date</label>
                  <input
                    type="date"
                    className="input font-mono text-[12px]"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="input-label">Est. Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="input font-mono text-[12px]"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    placeholder="8.0"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Labels (comma-separated)</label>
                <input
                  type="text"
                  className="input font-mono text-[12px]"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  placeholder="Backend, Security, Docker"
                />
              </div>

              <div className="pt-3 border-t border-[#E1E3DD] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn btn-danger btn-sm flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>Delete Task</span>
                </button>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn btn-primary"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* Existing Comments */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-[#6B716C] text-[13px]">
                    No comments yet. Start the technical discussion below.
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 rounded-md bg-[#FAFAF7] border border-[#E1E3DD] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            name={comment.author.fullName}
                            avatarColor={comment.author.avatarColor}
                            size={22}
                          />
                          <span className="text-[12px] font-semibold text-[#202421]">
                            {comment.author.fullName}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-[#6B716C]">
                          {new Date(comment.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#202421] whitespace-pre-wrap pl-7">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Post Comment Input */}
              <form onSubmit={handlePostComment} className="pt-3 border-t border-[#E1E3DD]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Add operational notes or ask for clarification..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="btn btn-primary"
                  >
                    <Send size={14} />
                    <span>Post</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-[#6B716C] text-[13px]">
                  No logged activity records for this task.
                </div>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 py-2 border-b border-[#ECEEE8] last:border-none text-[12px]"
                  >
                    <UserAvatar
                      name={act.actor.fullName}
                      avatarColor={act.actor.avatarColor}
                      size={24}
                    />
                    <div className="flex-1">
                      <div className="text-[#202421] leading-snug">
                        <span className="font-semibold">{act.actor.fullName}</span>{' '}
                        <span className="text-[#6B716C]">{act.description}</span>
                      </div>
                      <div className="font-mono text-[10px] text-[#6B716C] mt-0.5">
                        {new Date(act.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
