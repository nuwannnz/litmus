import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { ProjectRow, TaskRow } from '../rows';
import { useSupabase } from './ApiProvider';
import { projectKeys, taskKeys } from './keys';
import { fetchProjects, fetchTasks } from './queries';

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
