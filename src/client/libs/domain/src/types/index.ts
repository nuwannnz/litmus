/** Pastel colour families defined in the design tokens. */
export type ColorName = 'lav' | 'mint' | 'peach' | 'blue' | 'yellow' | 'pink';

/** The single status model shared by Week tasks and Project tasks (PRD FR-36). */
export type TaskStatus = 'todo' | 'progress' | 'done';

export type Priority = 'High' | 'Medium' | 'Low';

/** Flat, workspace-wide task categories (PRD FR-37). */
export type CategoryName =
  'Design' | 'Dev' | 'Marketing' | 'Meeting' | 'Research' | 'Personal' | 'QA' | 'Docs';

export type PersonId = 'NK' | 'AL' | 'JS' | 'ML';

export interface Person {
  id: PersonId;
  name: string;
  role: string;
  color: ColorName;
}

export interface Subtask {
  id: string;
  label: string;
  done: boolean;
}

/**
 * The one task model behind every surface (architecture §3.1): Week Board rows
 * are `where day between monday and sunday`, Project Board rows are
 * `where projectId = :id`, and a task with both simply sits on both.
 */
export interface Task {
  id: string;
  title: string;
  /**
   * ISO `yyyy-mm-dd`, or null when the task carries no due date. Non-null is
   * what puts a task on the Week Board (PRD FR-35) — no copy step involved.
   */
  day: string | null;
  category: CategoryName;
  projectId: string | null;
  time: string;
  timeEnd: string;
  status: TaskStatus;
  priority: Priority;
  assignee: PersonId;
  desc: string;
  noteIds: string[];
  subtasks: Subtask[];
}

export interface Project {
  id: string;
  name: string;
  color: ColorName;
  taskCount: number;
  done: number;
  progress: number;
  /** Number of tasks due in the current week. */
  due: number;
  updated: string;
  team: PersonId[];
  desc: string;
  about: string;
  status: string;
  priority: Priority;
  dueDate: string;
  created: string;
  members: PersonId[];
  noteIds: string[];
}

export interface NoteFolder {
  id: string;
  type: 'folder';
  name: string;
  open: boolean;
  children: NoteNode[];
}

export interface Note {
  id: string;
  type: 'note';
  name: string;
  edited: string;
  projectId: string | null;
  /** Title of the project task this note documents, when there is one. */
  task?: string;
  tags: string[];
  updated: string;
  /** Body markup in the seed shorthand — see `parseNoteBody`. */
  body: string;
}

export type NoteNode = NoteFolder | Note;

export interface WeekDay {
  iso: string;
  /** `Mon`, `Tue`… */
  name: string;
  /** `Monday, Aug 10` */
  long: string;
  num: number;
  isToday: boolean;
}
