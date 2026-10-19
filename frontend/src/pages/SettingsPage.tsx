import React, { useState } from 'react';
import {
  Settings,
  User as UserIcon,
  Lock,
  Palette,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { UserAvatar } from '../components/UserAvatar';

const AVATAR_COLORS = [
  '#F26B38', // Orange (Primary)
  '#436B8A', // Blue
  '#34765B', // Green
  '#B77A22', // Amber
  '#242925', // Deep Charcoal
  '#BF4545', // Red
];

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Profile form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || '#F26B38');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setProfileError('Full name cannot be empty');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      setProfileError(null);
      const updated = await api.updateProfile({
        fullName: fullName.trim(),
        jobTitle: jobTitle.trim() || undefined,
        avatarColor,
      });
      updateUser(updated);
      setProfileSuccess('Profile parameters saved successfully');
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in both current and new password');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordError(null);
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Password successfully updated and rehashed with BCrypt');
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="panel p-4 bg-[#FFFFFF]">
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-[#F26B38]" />
          <div>
            <h2 className="font-heading text-[16px] font-semibold text-[#202421]">
              Account &amp; Studio Preferences
            </h2>
            <p className="text-[12px] text-[#6B716C]">
              Manage engineer identity, authentication credentials, and theme tokens
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <UserIcon size={16} className="text-[#436B8A]" />
            <h3 className="font-heading text-[14px] font-semibold text-[#202421]">
              Engineer Profile Details
            </h3>
          </div>
          <span className="font-mono text-[11px] text-[#6B716C]">
            ID #{user?.id}
          </span>
        </div>

        {profileSuccess && (
          <div className="mx-5 mt-4 p-3 rounded bg-[#EDF6F2] border border-[#34765B]/20 text-[#34765B] text-[13px] flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{profileSuccess}</span>
          </div>
        )}
        {profileError && (
          <div className="mx-5 mt-4 p-3 rounded bg-[#FDF1F1] border border-[#BF4545]/20 text-[#BF4545] text-[13px] flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="panel-body space-y-4">
          <div className="flex items-center gap-4 pb-3 border-b border-[#ECEEE8]">
            <UserAvatar
              name={fullName || user?.fullName || 'User'}
              avatarColor={avatarColor}
              size={52}
            />
            <div>
              <div className="text-[13px] font-semibold text-[#202421]">
                {fullName || user?.fullName}
              </div>
              <div className="font-mono text-[11px] text-[#6B716C]">
                @{user?.username} • {user?.email}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Full Name *</label>
              <input
                type="text"
                className="input font-medium"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="input-label">Role / Job Title</label>
              <input
                type="text"
                className="input"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Lead Platform Engineer"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Identity Avatar Accent</label>
            <div className="flex items-center gap-2.5 mt-1.5">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  className={`w-7 h-7 rounded border-2 transition-transform ${
                    avatarColor === color ? 'border-[#242925] scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="btn btn-primary btn-sm flex items-center gap-1.5 font-medium"
            >
              <Save size={13} />
              <span>{isUpdatingProfile ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security: Change Password */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#34765B]" />
            <h3 className="font-heading text-[14px] font-semibold text-[#202421]">
              Account Authentication &amp; Password
            </h3>
          </div>
          <span className="font-mono text-[11px] text-[#6B716C]">
            BCrypt-Enforced Hash
          </span>
        </div>

        {passwordSuccess && (
          <div className="mx-5 mt-4 p-3 rounded bg-[#EDF6F2] border border-[#34765B]/20 text-[#34765B] text-[13px] flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{passwordSuccess}</span>
          </div>
        )}
        {passwordError && (
          <div className="mx-5 mt-4 p-3 rounded bg-[#FDF1F1] border border-[#BF4545]/20 text-[#BF4545] text-[13px] flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="panel-body space-y-4">
          <div>
            <label className="input-label">Current Password *</label>
            <input
              type="password"
              className="input max-w-md"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="input-label">New Password *</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="input-label">Confirm New Password *</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
            >
              <Lock size={13} />
              <span>{isChangingPassword ? 'Verifying...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Industrial Workflow Studio Design Token System Specs */}
      <div className="panel p-5 bg-[#FFFFFF]">
        <div className="flex items-center gap-2 mb-3">
          <Palette size={16} className="text-[#F26B38]" />
          <h3 className="font-heading text-[14px] font-semibold text-[#202421]">
            Industrial Workflow Studio Design System Specs
          </h3>
        </div>
        <p className="text-[13px] text-[#6B716C] mb-4">
          Standardized tokens applied across tables, charts, dialogs, and navigation grids:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px] font-mono">
          <div className="p-2.5 rounded bg-[#F5F5F2] border border-[#E1E3DD]">
            <div className="w-4 h-4 rounded bg-[#F26B38] mb-1" />
            <div className="text-[#202421] font-semibold">Primary Action</div>
            <div className="text-[#6B716C]">#F26B38</div>
          </div>

          <div className="p-2.5 rounded bg-[#F5F5F2] border border-[#E1E3DD]">
            <div className="w-4 h-4 rounded bg-[#242925] mb-1" />
            <div className="text-[#202421] font-semibold">Deep Charcoal</div>
            <div className="text-[#6B716C]">#242925</div>
          </div>

          <div className="p-2.5 rounded bg-[#F5F5F2] border border-[#E1E3DD]">
            <div className="w-4 h-4 rounded bg-[#436B8A] mb-1" />
            <div className="text-[#202421] font-semibold">Secondary Blue</div>
            <div className="text-[#6B716C]">#436B8A</div>
          </div>

          <div className="p-2.5 rounded bg-[#F5F5F2] border border-[#E1E3DD]">
            <div className="w-4 h-4 rounded bg-[#34765B] mb-1" />
            <div className="text-[#202421] font-semibold">Success Green</div>
            <div className="text-[#6B716C]">#34765B</div>
          </div>
        </div>
      </div>
    </div>
  );
};
