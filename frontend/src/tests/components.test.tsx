import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { UserAvatar } from '../components/UserAvatar';
import { Wordmark } from '../components/Wordmark';

describe('Design System UI Components', () => {
  it('renders StatusBadge correctly for all task states', () => {
    const { rerender } = render(<StatusBadge status="TODO" />);
    expect(screen.getByText('To Do')).toBeInTheDocument();

    rerender(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();

    rerender(<StatusBadge status="IN_REVIEW" />);
    expect(screen.getByText('In Review')).toBeInTheDocument();

    rerender(<StatusBadge status="COMPLETED" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders PriorityBadge with appropriate labels and classes', () => {
    const { rerender } = render(<PriorityBadge priority="LOW" />);
    expect(screen.getByText('LOW')).toBeInTheDocument();

    rerender(<PriorityBadge priority="MEDIUM" />);
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();

    rerender(<PriorityBadge priority="HIGH" />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();

    rerender(<PriorityBadge priority="URGENT" />);
    expect(screen.getByText('URGENT')).toBeInTheDocument();
  });

  it('renders UserAvatar with initials and name title', () => {
    render(<UserAvatar name="Alex Turner" />);
    expect(screen.getByText('AT')).toBeInTheDocument();
    expect(screen.getByTitle('Alex Turner')).toBeInTheDocument();
  });

  it('renders UserAvatar single word or two initials properly', () => {
    render(<UserAvatar name="Elena" />);
    expect(screen.getByText('EL')).toBeInTheDocument();
  });

  it('renders Wordmark with TASKFORGE branding and Ops Studio', () => {
    render(<Wordmark />);
    expect(screen.getByText(/TASK/)).toBeInTheDocument();
    expect(screen.getByText(/FORGE/)).toBeInTheDocument();
    expect(screen.getByText('Ops Studio')).toBeInTheDocument();
  });

  it('renders Wordmark collapsed without text', () => {
    render(<Wordmark collapsed={true} />);
    expect(screen.queryByText('Ops Studio')).not.toBeInTheDocument();
  });
});
