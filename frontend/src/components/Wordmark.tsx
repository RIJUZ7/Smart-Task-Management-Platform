import React from 'react';

interface WordmarkProps {
  collapsed?: boolean;
  className?: string;
}

export const Wordmark: React.FC<WordmarkProps> = ({ collapsed = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Connected Nodes Mark */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="4" fill="#242925" />
        <rect x="6" y="6" width="8" height="8" rx="1.5" fill="#F26B38" />
        <rect x="18" y="6" width="8" height="8" rx="1.5" fill="#ECEEE8" />
        <rect x="18" y="18" width="8" height="8" rx="1.5" fill="#436B8A" />
        <rect x="6" y="18" width="8" height="8" rx="1.5" fill="#34765B" />
        {/* Crisp Connection Trackers */}
        <path d="M14 10H18" stroke="#ECEEE8" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M22 14V18" stroke="#ECEEE8" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 22H18" stroke="#ECEEE8" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
      </svg>

      {!collapsed && (
        <div className="flex flex-col">
          <span
            className="font-heading text-[16px] font-bold tracking-tight text-[#202421] leading-none"
            style={{ letterSpacing: '-0.03em' }}
          >
            TASK<span style={{ color: '#F26B38' }}>FORGE</span>
          </span>
          <span
            className="font-mono text-[9px] font-medium uppercase tracking-wider text-[#6B716C] leading-tight"
            style={{ letterSpacing: '0.08em' }}
          >
            Ops Studio
          </span>
        </div>
      )}
    </div>
  );
};
