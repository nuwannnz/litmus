import { useCallback, useMemo } from 'react';
import {
  findNote,
  flattenNotes,
  type Note,
  type Project,
  type ProjectTask,
  type Task,
} from '@litmus/domain';
import { useWorkspace } from './WorkspaceProvider';

export function useTasks(): Task[] {
  return useWorkspace().tasks;
}

export function useTask(id: string | null | undefined): Task | null {
  const { tasks } = useWorkspace();
  return useMemo(() => (id ? (tasks.find((t) => t.id === id) ?? null) : null), [tasks, id]);
}

export function useProjects(): Project[] {
  return useWorkspace().projects;
}

export function useProject(id: string | null | undefined): Project | null {
  const { projects } = useWorkspace();
  return useMemo(() => (id ? (projects.find((p) => p.id === id) ?? null) : null), [projects, id]);
}

/** Look a project up by id without subscribing to a single project. */
export function useProjectLookup(): (id: string | null | undefined) => Project | null {
  const { projects } = useWorkspace();
  return useCallback((id) => (id ? (projects.find((p) => p.id === id) ?? null) : null), [projects]);
}

export function useProjectTasks(projectId: string | null | undefined): ProjectTask[] {
  const { projectTasks } = useWorkspace();
  return useMemo(
    () => (projectId ? projectTasks.filter((t) => t.projectId === projectId) : []),
    [projectTasks, projectId],
  );
}

export function useNoteTree() {
  return useWorkspace().notes;
}

export function useNote(id: string | null | undefined): Note | null {
  const { notes } = useWorkspace();
  return useMemo(() => (id ? findNote(notes, id) : null), [notes, id]);
}

export function useAllNotes(): Note[] {
  const { notes } = useWorkspace();
  return useMemo(() => flattenNotes(notes), [notes]);
}

export function useNoteLookup(): (id: string) => Note | null {
  const { notes } = useWorkspace();
  return useCallback((id: string) => findNote(notes, id), [notes]);
}
