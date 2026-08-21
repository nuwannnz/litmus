import {
  SEED_NOTES,
  SEED_PROJECTS,
  SEED_PROJECT_TASKS,
  SEED_TASKS,
  type CategoryName,
  type ColorName,
  type NoteNode,
  type Project,
  type ProjectTask,
  type Task,
  type TaskStatus,
} from '@litmus/domain';

export interface WorkspaceState {
  tasks: Task[];
  projects: Project[];
  projectTasks: ProjectTask[];
  notes: NoteNode[];
}

/** Seed data stands in for the API. Swap this for a fetch when the API lands. */
export const initialWorkspaceState = (): WorkspaceState => ({
  tasks: structuredClone(SEED_TASKS),
  projects: structuredClone(SEED_PROJECTS),
  projectTasks: structuredClone(SEED_PROJECT_TASKS),
  notes: structuredClone(SEED_NOTES),
});

export interface NewTaskInput {
  title: string;
  day: string;
  category: CategoryName;
}

export interface NewProjectInput {
  name: string;
  color: ColorName;
  desc: string;
  taskTitles: string[];
}

export type WorkspaceAction =
  | { type: 'task/add'; input: NewTaskInput }
  | { type: 'task/patch'; id: string; patch: Partial<Task> }
  | { type: 'task/move'; id: string; day: string }
  | { type: 'task/toggleDone'; id: string }
  | { type: 'task/remove'; id: string }
  | { type: 'subtask/toggle'; taskId: string; subtaskId: string }
  | { type: 'subtask/add'; taskId: string; label: string }
  | { type: 'subtask/remove'; taskId: string; subtaskId: string }
  | { type: 'task/linkNote'; taskId: string; noteId: string }
  | { type: 'project/add'; id: string; input: NewProjectInput }
  | { type: 'project/linkNote'; projectId: string; noteId: string }
  | { type: 'projectTask/add'; id: string; projectId: string }
  | { type: 'projectTask/setStatus'; id: string; status: TaskStatus }
  | { type: 'projectTask/toggleDone'; id: string }
  | { type: 'note/add'; id: string }
  | { type: 'folder/add'; id: string }
  | { type: 'folder/toggle'; id: string }
  | { type: 'folder/openPath'; ids: string[] }
  | { type: 'note/rename'; id: string; name: string }
  | { type: 'note/setBody'; id: string; body: string };
