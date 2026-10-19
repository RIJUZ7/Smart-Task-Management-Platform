import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Briefcase,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Save,
  Clock
} from 'lucide-react';
import { WorkspaceMember, WorkspaceRole } from '../types';
import { api } from '../api/client';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/UserAvatar';

export const TeamWorkspace: React.FC = () => {
  const { currentWorkspace, refreshWorkspaces } = useWorkspace();
  const { user } = useAuth();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Workspace metadata edit
  const [wsName, setWsName] = useState('');
  const [wsDescription, setWsDescription] = useState('');
  const [isUpdatingWs, setIsUpdatingWs] = useState(false);

  // Add Member form
  const [showAddMember, setShowAddMember] = useState(false);
  const [addUsernameOrEmail, setAddUsernameOrEmail] = useState('');
  const [addRole, setAddRole] = useState<WorkspaceRole>('MEMBER');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAdmin = currentWorkspace?.userRole === 'ADMIN';
  const isManager = currentWorkspace?.userRole === 'MANAGER' || isAdmin;

  const loadData = async () => {
    if (!currentWorkspace) return;
    try {
      setIsLoading(true);
      const mems = await api.getMembers(currentWorkspace.id);
      setMembers(mems);
      setWsName(currentWorkspace.name);
      setWsDescription(currentWorkspace.description || '');
    } catch (err) {
      console.error('Failed to load workspace members', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentWorkspace?.id]);

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !isAdmin) return;

    try {
      setIsUpdatingWs(true);
      setError(null);
      await api.updateWorkspace(currentWorkspace.id, {
        name: wsName.trim(),
        description: wsDescription.trim(),
      });
      await refreshWorkspaces();
      setSuccess('Workspace parameters updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update workspace');
    } finally {
      setIsUpdatingWs(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !addUsernameOrEmail.trim()) return;

    try {
      setIsAddingMember(true);
      setError(null);
      await api.addMember(currentWorkspace.id, {
        usernameOrEmail: addUsernameOrEmail.trim(),
        role: addRole,
      });
      setAddUsernameOrEmail('');
      setShowAddMember(false);
      setSuccess('Member added to workspace');
      setTimeout(() => setSuccess(null), 3000);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRoleChange = async (targetUserId: number, newRole: WorkspaceRole) => {
    if (!currentWorkspace || !isAdmin) return;
    try {
      setError(null);
      await api.updateMemberRole(currentWorkspace.id, targetUserId, newRole);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (targetUserId: number, memberName: string) => {
    if (!currentWorkspace || !isAdmin) return;
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      return;
    }

    try {
      setError(null);
      await api.removeMember(currentWorkspace.id, targetUserId);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to remove member');
    }
  };

  if (!currentWorkspace) {
    return <div className="p-8 text-center text-[#6B716C]">Select a workspace.</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Notifications / Alerts */}
      {error && (
        <div className="p-3.5 rounded bg-[#FDF1F1] border border-[#BF4545]/20 text-[#BF4545] text-[13px] flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded bg-[#EDF6F2] border border-[#34765B]/20 text-[#34765B] text-[13px] flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Workspace Overview Header Panel */}
      <div className="panel p-5 bg-[#FFFFFF]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-[#F26B38] bg-[#FFF0E8] px-2 py-0.5 rounded border border-[#F26B38]/30">
                {currentWorkspace.slug}
              </span>
              <span className="badge badge-admin">{currentWorkspace.userRole} ROLE</span>
            </div>
            <h2 className="text-[20px] font-heading font-bold text-[#202421]">
              {currentWorkspace.name}
            </h2>
            <p className="text-[13px] text-[#6B716C] max-w-2xl">
              {currentWorkspace.description || 'No description provided for this operational workspace.'}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 bg-[#FAFAF7] p-3 rounded border border-[#E1E3DD] text-[12px] shrink-0">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#6B716C]">Members</div>
              <div className="text-[16px] font-heading font-bold text-[#202421]">
                {members.length}
              </div>
            </div>
            <div className="w-[1px] h-8 bg-[#E1E3DD]" />
            <div>
              <div className="text-[10px] font-mono uppercase text-[#6B716C]">Total Tasks</div>
              <div className="text-[16px] font-heading font-bold text-[#202421]">
                {currentWorkspace.taskCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Parameters Form (Admins only) */}
      {isAdmin && (
        <div className="panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Briefcase size={15} className="text-[#436B8A]" />
              <h3 className="font-heading text-[14px] font-semibold text-[#202421]">
                Workspace Parameters (Admin)
              </h3>
            </div>
            <span className="font-mono text-[11px] text-[#6B716C]">
              Configuration Profile
            </span>
          </div>

          <form onSubmit={handleUpdateWorkspace} className="panel-body space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Workspace Display Name</label>
                <input
                  type="text"
                  className="input font-medium"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label">Workspace Slug (Immutable)</label>
                <input
                  type="text"
                  disabled
                  className="input font-mono text-[12px] bg-[#F5F5F2] cursor-not-allowed text-[#6B716C]"
                  value={currentWorkspace.slug}
                />
              </div>
            </div>

            <div>
              <label className="input-label">Mission Statement / Description</label>
              <textarea
                className="textarea"
                rows={2}
                value={wsDescription}
                onChange={(e) => setWsDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingWs}
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
              >
                <Save size={13} />
                <span>{isUpdatingWs ? 'Saving...' : 'Save Parameters'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members Directory */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#F26B38]" />
            <h3 className="font-heading text-[14px] font-semibold text-[#202421]">
              Team Members &amp; Workload Directory
            </h3>
          </div>

          {isManager && (
            <button
              onClick={() => setShowAddMember(true)}
              className="btn btn-primary btn-sm flex items-center gap-1.5 font-medium"
            >
              <UserPlus size={14} />
              <span>Add Member</span>
            </button>
          )}
        </div>

        {/* Member Table */}
        <div className="table-container border-none rounded-none">
          <table className="taskforge-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role in Workspace</th>
                <th>Assigned Tasks</th>
                <th>Completed</th>
                <th>Joined</th>
                {isAdmin && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isCurrentUser = member.userId === user?.id;
                return (
                  <tr key={member.userId}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          name={member.fullName}
                          avatarColor={member.avatarColor}
                          size={28}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-[#202421] text-[13px]">
                            {member.fullName} {isCurrentUser && <span className="text-[#F26B38] font-mono text-[11px]">(You)</span>}
                          </span>
                          <span className="font-mono text-[11px] text-[#6B716C]">
                            {member.jobTitle || member.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {isAdmin && !isCurrentUser ? (
                        <select
                          className="select font-mono text-[11px] py-1 px-2 w-32"
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.userId, e.target.value as WorkspaceRole)}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="MANAGER">MANAGER</option>
                          <option value="MEMBER">MEMBER</option>
                        </select>
                      ) : (
                        <span className={`badge ${
                          member.role === 'ADMIN' ? 'badge-admin' : member.role === 'MANAGER' ? 'badge-manager' : 'badge-member'
                        }`}>
                          {member.role}
                        </span>
                      )}
                    </td>

                    <td>
                      <span className="font-mono text-[12px] font-semibold text-[#202421]">
                        {member.assignedTasksCount}
                      </span>
                    </td>

                    <td>
                      <span className="font-mono text-[12px] font-semibold text-[#34765B]">
                        {member.completedTasksCount}
                      </span>
                    </td>

                    <td className="font-mono text-[11px] text-[#6B716C]">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </td>

                    {isAdmin && (
                      <td className="text-right">
                        {!isCurrentUser ? (
                          <button
                            onClick={() => handleRemoveMember(member.userId, member.fullName)}
                            className="p-1 rounded hover:bg-[#FDF1F1] text-[#6B716C] hover:text-[#BF4545] transition-colors"
                            title="Remove member"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <span className="font-mono text-[11px] text-[#6B716C] italic">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <UserPlus size={16} className="text-[#F26B38]" />
                <h3 className="font-heading text-[15px] font-semibold text-[#202421]">
                  Add Workspace Member
                </h3>
              </div>
              <button
                onClick={() => setShowAddMember(false)}
                className="p-1 rounded hover:bg-[#ECEEE8] text-[#6B716C]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="modal-body space-y-4">
              <div>
                <label className="input-label">Username or Work Email *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. sophia.chen or sophia@taskforge.dev"
                  value={addUsernameOrEmail}
                  onChange={(e) => setAddUsernameOrEmail(e.target.value)}
                  required
                  autoFocus
                />
                <span className="text-[11px] text-[#6B716C] mt-1 block">
                  User must have registered an account on TASKFORGE.
                </span>
              </div>

              <div>
                <label className="input-label">Initial Role Assignment</label>
                <select
                  className="select font-mono text-[12px]"
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as WorkspaceRole)}
                >
                  <option value="MEMBER">MEMBER (View tasks, manage assigned)</option>
                  <option value="MANAGER">MANAGER (Create, assign, review progress)</option>
                  {isAdmin && <option value="ADMIN">ADMIN (Full workspace governance)</option>}
                </select>
              </div>

              <div className="pt-3 border-t border-[#E1E3DD] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingMember}
                  className="btn btn-primary"
                >
                  {isAddingMember ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
