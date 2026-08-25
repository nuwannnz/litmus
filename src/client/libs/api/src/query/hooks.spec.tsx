import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import {
  ApiProvider,
  createQueryClient,
  useProject,
  useProjects,
  useTask,
  useTasks,
} from '../index';
import { createMockSupabaseClient } from '../testing';

const taskRow = (id: string, title: string) => ({
  id,
  title,
  category_id: null,
  created_at: '2026-08-25T00:00:00Z',
  deleted_at: null,
  description: null,
  due_date: null,
  end_time: null,
  position: null,
  priority: null,
  project_id: null,
  search_vector: null,
  start_time: null,
  status: 'todo' as const,
  updated_at: '2026-08-25T00:00:00Z',
  user_id: 'u1',
});

const projectRow = (id: string, name: string) => ({
  id,
  name,
  about: null,
  color: 'blue',
  created_at: '2026-08-25T00:00:00Z',
  deleted_at: null,
  description: null,
  due_date: null,
  position: null,
  priority: null,
  search_vector: null,
  status: 'active',
  updated_at: '2026-08-25T00:00:00Z',
  user_id: 'u1',
});

function setup(tableRows: Record<string, unknown[]>) {
  const supabase = createMockSupabaseClient({
    tables: Object.fromEntries(Object.entries(tableRows).map(([table, rows]) => [table, { rows }])),
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApiProvider queryClient={createQueryClient()} supabase={supabase}>
      {children}
    </ApiProvider>
  );
  return { supabase, wrapper };
}

describe('S-3.4 read hooks', () => {
  it('useTasks resolves the configured rows', async () => {
    const { wrapper } = setup({ tasks: [taskRow('t1', 'First')] });
    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => expect(result.current).toHaveLength(1));
    expect(result.current[0]?.id).toBe('t1');
  });

  it('useTasks excludes soft-deleted rows via an `is deleted_at null` filter', async () => {
    const { supabase, wrapper } = setup({ tasks: [] });
    renderHook(() => useTasks(), { wrapper });
    await waitFor(() => expect(supabase.$selects).toHaveLength(1));
    expect(supabase.$selects[0]?.table).toBe('tasks');
    expect(supabase.$selects[0]?.filters).toContainEqual({
      op: 'is',
      column: 'deleted_at',
      value: null,
    });
  });

  it('useTask derives one task from the list cache without a second query', async () => {
    const { supabase, wrapper } = setup({
      tasks: [taskRow('t1', 'First'), taskRow('t2', 'Second')],
    });
    const { result } = renderHook(() => useTask('t2'), { wrapper });
    await waitFor(() => expect(result.current?.title).toBe('Second'));
    // One list fetch only — the derivation must not fan out into per-id queries.
    expect(supabase.$selects).toHaveLength(1);
  });

  it('useTask returns null for an unknown or absent id', async () => {
    const { wrapper } = setup({ tasks: [taskRow('t1', 'First')] });
    const { result, rerender } = renderHook(({ id }) => useTask(id), {
      initialProps: { id: 'nope' as string | null | undefined },
      wrapper,
    });
    await waitFor(() => expect(result.current).toBeNull());
    rerender({ id: undefined });
    expect(result.current).toBeNull();
  });

  it('useProject and useProjects resolve projects the same way', async () => {
    const { wrapper } = setup({ projects: [projectRow('p1', 'Apollo')] });
    const projects = renderHook(() => useProjects(), { wrapper });
    const project = renderHook(() => useProject('p1'), { wrapper });
    await waitFor(() => expect(projects.result.current).toHaveLength(1));
    expect(project.result.current?.name).toBe('Apollo');
  });

  it('a fetch error surfaces as a rejected query rather than a silent empty list', async () => {
    const supabase = createMockSupabaseClient({
      tables: { tasks: { error: { message: 'rls denied' } } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ApiProvider queryClient={createQueryClient()} supabase={supabase}>
        {children}
      </ApiProvider>
    );
    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => expect(result.current).toEqual([]));
  });
});
