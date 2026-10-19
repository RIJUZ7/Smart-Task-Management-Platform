import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wordmark } from '../components/Wordmark';
import { useAuth } from '../context/AuthContext';
import { Lock, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState('alex.turner');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      setError('Please provide your username and password');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await login(usernameOrEmail.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (user: string) => {
    setUsernameOrEmail(user);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F2] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[420px] bg-[#FFFFFF] border border-[#E1E3DD] rounded-lg shadow-panel p-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Wordmark className="mb-2" />
          <p className="text-[13px] text-[#6B716C] mt-1 font-body">
            Industrial Workflow Studio &amp; Team Operations
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded bg-[#FDF1F1] border border-[#BF4545]/20 text-[#BF4545] text-[13px] flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Username or Email</label>
            <div className="relative">
              <input
                type="text"
                className="input pl-9"
                placeholder="alex.turner or alex@taskforge.dev"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
              />
              <UserIcon
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B716C]"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Password</label>
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
            id="btn-login"
          >
            {isLoading ? 'Authenticating...' : 'Sign in to Console'}
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Quick Demo Access Badges */}
        <div className="mt-6 pt-5 border-t border-[#E1E3DD]">
          <div className="text-[11px] font-mono text-[#6B716C] uppercase tracking-wider mb-2 text-center">
            Quick Demo Accounts (pass: password123)
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('alex.turner')}
              className="px-2 py-1.5 text-[11px] font-mono bg-[#F5F5F2] hover:bg-[#ECEEE8] rounded border border-[#E1E3DD] text-[#202421] text-left truncate"
            >
              alex.turner <span className="text-[#F26B38] font-bold">(Admin)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('elena.rostova')}
              className="px-2 py-1.5 text-[11px] font-mono bg-[#F5F5F2] hover:bg-[#ECEEE8] rounded border border-[#E1E3DD] text-[#202421] text-left truncate"
            >
              elena.rostova <span className="text-[#436B8A]">(Mgr)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('marcus.vance')}
              className="px-2 py-1.5 text-[11px] font-mono bg-[#F5F5F2] hover:bg-[#ECEEE8] rounded border border-[#E1E3DD] text-[#202421] text-left truncate"
            >
              marcus.vance <span className="text-[#34765B]">(DevOps)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('sophia.chen')}
              className="px-2 py-1.5 text-[11px] font-mono bg-[#F5F5F2] hover:bg-[#ECEEE8] rounded border border-[#E1E3DD] text-[#202421] text-left truncate"
            >
              sophia.chen <span className="text-[#B77A22]">(QA)</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-[13px] text-[#6B716C]">
          Need an account?{' '}
          <Link to="/register" className="text-[#F26B38] font-medium hover:underline">
            Register team account
          </Link>
        </div>
      </div>
    </div>
  );
};
