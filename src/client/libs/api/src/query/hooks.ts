import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import type { CategoryRow, ProjectRow, TaskRow } from '../rows';
import { useSupabase } from './ApiProvider';
import { projectKeys, categoryKeys, taskKeys } from './keys';
import { fetchCategories, fetchProjects, fetchTasks, fetchWeekTasks } from './queries';

/**
 * The first query hooks over real data (S-3.4).
 *
 * They keep `libs/core`'s prototype hook signatures — a bare value, not a
 * `UseQueryResult` — so the feature modules' call sites survive S-3.7's swap
 * unchanged. Loading and error states are deliberately not surfaced yet:
 * nothing renders from these until a surface migrates (S-6.1 first, per the
 * sprint plan), and that migration decides how each screen wants its pending
 * state shown.
 */

export function useTasks(): TaskRow[] {
  const supabase = useSupabase();
  const { data } = useQuery({ queryKey: taskKeys.all, queryFn: () => fetchTasks(supabase) });
  return data ?? [];
}

export function useTask(id: string | null | undefined): TaskRow | null {
  // Derived from the list cache rather than a per-id query: cards and detail
  // panels then share one subscriber set, and invalidating `taskKeys.all`
  // refreshes them all at once.
  const tasks = useTasks();
  return useMemo(() => (id ? (tasks.find((t) => t.id === id) ?? null) : null), [tasks, id]);
}

export function useProjects(): ProjectRow[] {
  const supabase = useSupabase();
  const { data } = useQuery({ queryKey: projectKeys.all, queryFn: () => fetchProjects(supabase) });
  return data ?? [];
}

export function useProject(id: string | null | undefined): ProjectRow | null {
  const projects = useProjects();
  return useMemo(() => (id ? (projects.find((p) => p.id === id) ?? null) : null), [projects, id]);
}

/**
 * The Week Board slice (S-6.1, FR-9): tasks due within one Monday→Sunday
 * range. Keyed under `taskKeys.week(range)` — a prefix of `taskKeys.all`, so a
 * task mutation anywhere invalidates it through the same call.
 */
export function useWeekTasks(range: { from: string; to: string }): TaskRow[] {
  const supabase = useSupabase();
  const { data } = useQuery({
    queryKey: taskKeys.week(range),
    queryFn: () => fetchWeekTasks(supabase, range),
  });
  return data ?? [];
}

/** The global category reference data (FR-37). Static once loaded. */
export function useCategories(): CategoryRow[] {
  const supabase = useSupabase();
  const { data } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => fetchCategories(supabase),
    staleTime: Number.POSITIVE_INFINITY,
  });
  return data ?? [];
}

/**
 * The first write path over real data (S-6.1): create a task from the Week
 * Board composer. The id is minted by the caller (uuidv7 at every create
 * path, per S-3.6) and passed in the input; RLS stamps ownership.
 */
export function useInsertTask() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      title: string;
      due_date?: string | null;
      category_id?: string | null;
      project_id?: string | null;
    }) => {
      // Ownership comes from the session, never from caller-supplied state —
      // RLS would reject a row stamped with someone else's id anyway.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Sign in to create a task.');
      const { error } = await supabase.from('tasks').insert({ ...input, user_id: user.id });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

/**
 * Invalidate the whole task cache — the one refresh any surface needs after a
 * write it drove outside this library's mutation hooks. Kept here so feature
 * modules never touch `@tanstack/react-query` directly.
 */
export function useRefreshTasks(): () => Promise<void> {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
    [queryClient],
  );
}
