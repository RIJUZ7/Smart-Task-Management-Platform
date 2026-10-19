import React, { useState } from 'react';
import { X, Briefcase, AlertCircle } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createWorkspace } = useWorkspace();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate slug from name if not manually modified
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }
    if (!slug.trim()) {
      setError('Workspace slug is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await createWorkspace(name.trim(), slug.trim(), description.trim() || undefined);
      setName('');
      setSlug('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-[#F26B38]" />
            <h2 className="font-heading text-[16px] font-semibold text-[#202421]">
              Create Operations Workspace
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
            <label className="input-label">Workspace Name *</label>
            <input
              type="text"
              className="input font-medium"
              placeholder="e.g. Platform Reliability &amp; SRE"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="input-label">Workspace Slug (URL / identifier) *</label>
            <input
              type="text"
              className="input font-mono text-[12px]"
              placeholder="platform-reliability-sre"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              required
            />
            <span className="text-[11px] text-[#6B716C] mt-1 block">
              Unique lowercase hyphenated slug used for workspace routing.
            </span>
          </div>

          <div>
            <label className="input-label">Mission / Description</label>
            <textarea
              className="textarea"
              rows={3}
              placeholder="Workspace objective, team mandate, and focus area..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              {isSubmitting ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
