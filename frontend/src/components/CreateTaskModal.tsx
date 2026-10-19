import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { TaskStatus, TaskPriority, WorkspaceMember } from '../types';
import { api } from '../api/client';

interface CreateTaskModalProps {
  isOpen: boolean;
  workspaceId: number;
  members: WorkspaceMember[];
  onClose: () => void;
  onTaskCreated: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  workspaceId,
  members,
  onClose,
  onTaskCreated,
}) => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await api.createTask({
        workspaceId,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate || undefined,
        startDate: startDate || undefined,
        labels: labels || undefined,
        category: category || undefined,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setAssigneeId(undefined);
      setDueDate('');
      setStartDate('');
      setLabels('');
      setCategory('');
      setEstimatedHours('');

      onTaskCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 580 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-[#F26B38]" />
            <h2 className="font-heading text-[16px] font-semibold text-[#202421]">
              Create Work Item
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#ECEEE8] text-[#6B716C] hover:text-[#202421]"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 rounded bg-[#FDF1F1] border border-[#BF4545]/20 text-[#BF4545] text-[13px] flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-body space-y-4">
          <div>
            <label className="input-label">Task Title *</label>
            <input
              type="text"
              className="input font-medium"
              placeholder="e.g. Audit Redis Connection Lease Strategy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="input-label">Description &amp; Acceptance Criteria</label>
            <textarea
              className="textarea"
              rows={3}
              placeholder="What needs to be done, technical parameters, and validation steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Initial Status</label>
              <select
                className="select font-mono text-[12px]"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="IN_REVIEW">IN_REVIEW</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div>
              <label className="input-label">Priority</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Assignee</label>
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
                placeholder="ENGINEERING, DEVOPS, QA"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

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
                placeholder="6.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="input-label">Labels (comma-separated)</label>
            <input
              type="text"
              className="input font-mono text-[12px]"
              placeholder="Backend, Security, Docker"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-[#E1E3DD] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
