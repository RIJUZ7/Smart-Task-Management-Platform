import React from 'react';
import { TaskPriority } from '../types';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const getStyleClass = () => {
    switch (priority) {
      case 'LOW':
        return 'badge-low';
      case 'MEDIUM':
        return 'badge-medium';
      case 'HIGH':
        return 'badge-high';
      case 'URGENT':
        return 'badge-urgent';
      default:
        return 'badge-low';
    }
  };

  return (
    <span className={`badge ${getStyleClass()} ${className}`}>
      {priority}
    </span>
  );
};
