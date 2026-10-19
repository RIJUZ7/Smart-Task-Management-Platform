import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wordmark } from '../components/Wordmark';
import { useAuth } from '../context/AuthContext';
import { Lock, User as UserIcon, Mail, Briefcase, AlertCircle, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim() || !fullName.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        jobTitle: jobTitle.trim() || undefined,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F2] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[460px] bg-[#FFFFFF] border border-[#E1E3DD] rounded-lg shadow-panel p-8">
        <div className="flex flex-col items-center mb-6 text-center">
          <Wordmark className="mb-2" />
          <h2 className="text-[18px] font-heading font-semibold text-[#202421]">
            Create Engineer Account
          </h2>
          <p className="text-[13px] text-[#6B716C] mt-0.5">
            Initializes user workspace with automatic admin privileges
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded bg-[#FDF1F1] border border-[#BF4545]/20 text-[#BF4545] text-[13px] flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="input-label">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                className="input pl-9"
                placeholder="Rachel Zane"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <UserIcon
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B716C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="input-label">Username *</label>
              <input
                type="text"
                className="input font-mono text-[12px]"
                placeholder="rachel.zane"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="input-label">Job Title / Role</label>
              <div className="relative">
                <input
                  type="text"
                  className="input pl-8"
                  placeholder="Lead Systems Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
                <Briefcase
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B716C]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="input-label">Work Email *</label>
            <div className="relative">
              <input
                type="email"
                className="input pl-9"
                placeholder="rachel@taskforge.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B716C]"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Password * (min 6 characters)</label>
            <div className="relative">
              <input
                type="password"
                className="input pl-9"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B716C]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-2.5 font-semibold text-[14px] mt-2 shadow-xs"
            id="btn-register"
          >
            {isLoading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="mt-6 text-center text-[13px] text-[#6B716C]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#F26B38] font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
