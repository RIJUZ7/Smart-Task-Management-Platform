import React from 'react';
import { TaskStatus } from '../types';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getLabel = () => {
    switch (status) {
      case 'TODO':
        return 'To Do';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'IN_REVIEW':
        return 'In Review';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const getStyleClass = () => {
    switch (status) {
      case 'TODO':
        return 'badge-todo';
      case 'IN_PROGRESS':
        return 'badge-in_progress';
      case 'IN_REVIEW':
        return 'badge-in_review';
      case 'COMPLETED':
        return 'badge-completed';
      default:
        return 'badge-todo';
    }
  };

  return (
    <span className={`badge ${getStyleClass()} ${className}`}>
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          display: 'inline-block',
        }}
      />
      {getLabel()}
    </span>
  );
};
