import { describe, it, expect } from 'vitest';
import { Task, TaskPriority, TaskStatus } from '../types';

describe('Task Logic & Utility Calculations', () => {
  const sampleTasks: Task[] = [
    {
      id: 1,
      workspaceId: 1,
      title: 'Deploy Kubernetes Ingress Controller',
      description: 'Configure TLS termination and dynamic routing rules',
      status: 'IN_PROGRESS' as TaskStatus,
      priority: 'URGENT' as TaskPriority,
      assigneeId: 1,
      creatorId: 2,
      dueDate: '2026-10-18T12:00:00Z',
      createdAt: '2026-10-10T08:00:00Z',
      updatedAt: '2026-10-12T14:00:00Z',
    },
    {
      id: 2,
      workspaceId: 1,
      title: 'Database Schema Audit & Migration Indexing',
      description: 'Ensure Flyway migrations execute idempotently',
      status: 'TODO' as TaskStatus,
      priority: 'HIGH' as TaskPriority,
      assigneeId: 2,
      creatorId: 1,
      dueDate: '2026-10-25T18:00:00Z',
      createdAt: '2026-10-11T09:00:00Z',
      updatedAt: '2026-10-11T09:00:00Z',
    },
    {
      id: 3,
      workspaceId: 1,
      title: 'E2E Cypress Test Suite Execution',
      description: 'Verify cross-browser compliance',
      status: 'COMPLETED' as TaskStatus,
      priority: 'MEDIUM' as TaskPriority,
      assigneeId: 3,
      creatorId: 1,
      dueDate: '2026-10-15T10:00:00Z',
      createdAt: '2026-10-09T08:00:00Z',
      updatedAt: '2026-10-14T17:00:00Z',
    },
  ];

  it('correctly filters tasks by status', () => {
    const todoTasks = sampleTasks.filter(t => t.status === 'TODO');
    expect(todoTasks.length).toBe(1);
    expect(todoTasks[0].title).toContain('Database Schema');

    const inProgressTasks = sampleTasks.filter(t => t.status === 'IN_PROGRESS');
    expect(inProgressTasks.length).toBe(1);
    expect(inProgressTasks[0].title).toContain('Kubernetes');
  });

  it('correctly filters tasks by priority', () => {
    const urgentTasks = sampleTasks.filter(t => t.priority === 'URGENT');
    expect(urgentTasks.length).toBe(1);
    expect(urgentTasks[0].id).toBe(1);
  });

  it('identifies overdue tasks based on due date and status', () => {
    const referenceDate = new Date('2026-10-19T10:00:00Z');
    
    const isOverdue = (task: Task) => {
      if (task.status === 'COMPLETED' || !task.dueDate) return false;
      return new Date(task.dueDate) < referenceDate;
    };

    expect(isOverdue(sampleTasks[0])).toBe(true); // IN_PROGRESS with due date Oct 18 is overdue
    expect(isOverdue(sampleTasks[1])).toBe(false); // TODO with due date Oct 25 is upcoming
    expect(isOverdue(sampleTasks[2])).toBe(false); // COMPLETED even though due date passed
  });

  it('sorts tasks by priority hierarchy (URGENT > HIGH > MEDIUM > LOW)', () => {
    const priorityWeights: Record<TaskPriority, number> = {
      URGENT: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    const sorted = [...sampleTasks].sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]);
    expect(sorted[0].priority).toBe('URGENT');
    expect(sorted[1].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('MEDIUM');
  });
});
