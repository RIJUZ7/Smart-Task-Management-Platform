import React from 'react';

interface UserAvatarProps {
  name: string;
  avatarColor?: string;
  size?: number;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarColor = '#F26B38',
  size = 28,
  className = '',
}) => {
  const getInitials = (text: string) => {
    if (!text) return 'TF';
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`inline-flex items-center justify-center font-mono font-semibold text-white select-none shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        backgroundColor: avatarColor || '#F26B38',
        fontSize: Math.max(10, Math.floor(size * 0.38)),
        letterSpacing: '0.02em',
      }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};
