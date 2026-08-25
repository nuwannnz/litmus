import { describe, expect, it } from 'vitest';

import type { TaskRow } from './rows';
import { createMockSupabaseClient } from './testing';
import { updateProject, updateTask, type TaskPatch } from './index';

const taskRow: TaskRow = {
  id: 't1',
  title: 'First',
  category_id: null,
  created_at: '2026-08-25T00:00:00Z',
  deleted_at: null,
  description: null,
  due_date: '2026-08-25',
  end_time: null,
  position: null,
  priority: null,
  project_id: null,
  search_vector: null,
  start_time: null,
  status: 'todo',
  updated_at: '2026-08-25T00:00:00Z',
  user_id: 'u1',
};

describe('FR-8: partial-update discipline', () => {
  it('sends exactly the changed fields — nothing more', async () => {
    const supabase = createMockSupabaseClient();
    await updateTask(supabase, 't1', { status: 'done' });
    expect(supabase.$updates).toHaveLength(1);
    expect(supabase.$updates[0]?.patch).toEqual({ status: 'done' });
    expect(supabase.$updates[0]?.table).toBe('tasks');
    expect(supabase.$updates[0]?.filters).toEqual([{ op: 'eq', column: 'id', value: 't1' }]);
  });

  it('a multi-field edit still sends only the fields that changed', async () => {
    const supabase = createMockSupabaseClient();
    await updateTask(supabase, 't1', { title: 'Renamed', priority: 'High' });
    expect(supabase.$updates[0]?.patch).toEqual({ title: 'Renamed', priority: 'High' });
  });

  it('rejects an empty patch rather than issuing a no-op write', async () => {
    const supabase = createMockSupabaseClient();
    await expect(updateTask(supabase, 't1', {})).rejects.toThrow(/empty task patch/);
    expect(supabase.$updates).toHaveLength(0);
  });

  it('surfaces a database error as a rejection', async () => {
    const supabase = createMockSupabaseClient({
      tables: { tasks: { error: { message: 'check constraint violated' } } },
    });
    await expect(updateTask(supabase, 't1', { status: 'done' })).rejects.toThrow(
      'check constraint violated',
    );
  });

  it('patches projects the same way', async () => {
    const supabase = createMockSupabaseClient();
    await updateProject(supabase, 'p1', { name: 'Apollo', color: 'mint' });
    expect(supabase.$updates[0]?.patch).toEqual({ name: 'Apollo', color: 'mint' });
    expect(supabase.$updates[0]?.table).toBe('projects');
  });

  it('FR-8: writing a whole task row back is a compile error, not a runtime hazard', async () => {
    const supabase = createMockSupabaseClient();
    // The `never` columns on TaskPatch make a full-row write unrepresentable:
    // if this ever stops being a type error, `@ts-expect-error` itself fails
    // the build.
    const wholeRowRejected = () => {
      // @ts-expect-error — a TaskRow carries id/user_id/audit columns, which
      // the patch surface declares `never` on purpose (S-3.5).
      updateTask(supabase, taskRow.id, taskRow);
    };
    expect(wholeRowRejected).toBeDefined();
  });

  it('a partial built from form state stays legal while untouched fields stay absent', async () => {
    const supabase = createMockSupabaseClient();
    const changes: TaskPatch = {};
    if (taskRow.title !== 'Renamed') changes.title = 'Renamed';
    if (taskRow.status !== 'done') changes.status = 'done';
    await updateTask(supabase, 't1', changes);
    expect(supabase.$updates[0]?.patch).toEqual({ title: 'Renamed', status: 'done' });
  });
});
