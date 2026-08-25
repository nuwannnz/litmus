import { describe, expect, it } from 'vitest';

import { SEED_TASKS } from './tasks';
import { formatShortDate } from '../utils/date';

describe('seed tasks', () => {
  it('FR-35: a project task given a due date sits in an ISO day column like any other task', () => {
    const datedProjectTasks = SEED_TASKS.filter((t) => t.projectId !== null && t.day !== null);
    expect(datedProjectTasks.length).toBeGreaterThan(0);
    for (const task of datedProjectTasks) expect(task.day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('FR-39: every seeded task has a home — a project, a due date, or both', () => {
    for (const task of SEED_TASKS) {
      expect(task.projectId !== null || task.day !== null).toBe(true);
    }
  });

  it('renders a due date as the short `Mon D` label used on cards and rows', () => {
    expect(formatShortDate('2026-08-15')).toBe('Aug 15');
  });
});
