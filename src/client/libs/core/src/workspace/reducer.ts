import {
  CURRENT_USER,
  isFolder,
  isNote,
  mapNode,
  openFolders,
  uid,
  type Project,
  type Task,
} from '@litmus/domain';
import type { WorkspaceAction, WorkspaceState } from './state';

const patchTask = (state: WorkspaceState, id: string, patch: (t: Task) => Task): WorkspaceState => ({
  ...state,
  tasks: state.tasks.map((t) => (t.id === id ? patch(t) : t)),
});

/** Keeps `done` and `progress` in step after a project task changes status. */
function recount(project: Project, delta: number): Project {
  const done = Math.max(0, Math.min(project.taskCount, project.done + delta));
  return {
    ...project,
    done,
    progress: project.taskCount ? Math.round((done / project.taskCount) * 100) : 0,
  };
}

const applyRecount = (state: WorkspaceState, projectId: string, delta: number): Project[] =>
  delta === 0
    ? state.projects
    : state.projects.map((p) => (p.id === projectId ? recount(p, delta) : p));

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'task/add': {
      const task: Task = {
        id: uid('t'),
        title: action.input.title,
        day: action.input.day,
        category: action.input.category,
        projectId: null,
        time: '',
        timeEnd: '',
        status: 'todo',
        priority: 'Medium',
        assignee: CURRENT_USER,
        desc: '',
        noteIds: [],
        subtasks: [],
      };
      return { ...state, tasks: [...state.tasks, task] };
    }

    case 'task/patch':
      return patchTask(state, action.id, (t) => ({ ...t, ...action.patch }));

    case 'task/move':
      return patchTask(state, action.id, (t) => ({ ...t, day: action.day }));

    case 'task/toggleDone':
      return patchTask(state, action.id, (t) => {
        const done = t.status !== 'done';
        return {
          ...t,
          status: done ? 'done' : 'todo',
          subtasks: done ? t.subtasks.map((s) => ({ ...s, done: true })) : t.subtasks,
        };
      });

    case 'task/remove':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };

    case 'subtask/toggle':
      return patchTask(state, action.taskId, (t) => ({
        ...t,
        subtasks: t.subtasks.map((s) =>
          s.id === action.subtaskId ? { ...s, done: !s.done } : s,
        ),
      }));

    case 'subtask/add':
      return patchTask(state, action.taskId, (t) => ({
        ...t,
        subtasks: [...t.subtasks, { id: uid('s'), label: action.label, done: false }],
      }));

    case 'subtask/remove':
      return patchTask(state, action.taskId, (t) => ({
        ...t,
        subtasks: t.subtasks.filter((s) => s.id !== action.subtaskId),
      }));

    case 'task/linkNote':
      return patchTask(state, action.taskId, (t) =>
        t.noteIds.includes(action.noteId)
          ? t
          : { ...t, noteIds: [...t.noteIds, action.noteId] },
      );

    case 'project/add': {
      const { name, color, desc, taskTitles } = action.input;
      const description = desc.trim() || 'No description yet.';
      const project: Project = {
        id: action.id,
        name,
        color,
        taskCount: taskTitles.length,
        done: 0,
        progress: 0,
        due: 0,
        updated: 'just now',
        team: [CURRENT_USER],
        desc: description,
        about: description,
        status: 'Active',
        priority: 'Medium',
        dueDate: '—',
        created: 'Today',
        members: [CURRENT_USER],
        noteIds: [],
      };
      return {
        ...state,
        projects: [project, ...state.projects],
        projectTasks: [
          ...state.projectTasks,
          ...taskTitles.map((title) => ({
            id: uid('pt'),
            projectId: project.id,
            title,
            category: 'Design' as const,
            status: 'todo' as const,
            due: '',
            assignee: CURRENT_USER,
          })),
        ],
      };
    }

    case 'project/linkNote':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId && !p.noteIds.includes(action.noteId)
            ? { ...p, noteIds: [...p.noteIds, action.noteId] }
            : p,
        ),
      };

    case 'projectTask/add': {
      const project = state.projects.find((p) => p.id === action.projectId);
      if (!project) return state;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === project.id ? recount({ ...p, taskCount: p.taskCount + 1 }, 0) : p,
        ),
        projectTasks: [
          ...state.projectTasks,
          {
            id: action.id,
            projectId: project.id,
            title: 'New task',
            category: 'Design',
            status: 'todo',
            due: '',
            assignee: project.members[0] ?? CURRENT_USER,
          },
        ],
      };
    }

    case 'projectTask/setStatus':
    case 'projectTask/toggleDone': {
      const task = state.projectTasks.find((t) => t.id === action.id);
      if (!task) return state;
      const next =
        action.type === 'projectTask/setStatus'
          ? action.status
          : task.status === 'done'
            ? 'todo'
            : 'done';
      if (next === task.status) return state;
      const delta = next === 'done' ? 1 : task.status === 'done' ? -1 : 0;
      return {
        ...state,
        projects: applyRecount(state, task.projectId, delta),
        projectTasks: state.projectTasks.map((t) =>
          t.id === task.id ? { ...t, status: next } : t,
        ),
      };
    }

    case 'note/add':
      return {
        ...state,
        notes: [
          ...state.notes,
          {
            id: action.id,
            type: 'note',
            name: 'Untitled note',
            edited: 'Edited just now',
            projectId: null,
            tags: ['#new'],
            updated: 'Updated today',
            body: '<p>Start writing…</p>',
          },
        ],
      };

    case 'folder/add':
      return {
        ...state,
        notes: [
          ...state.notes,
          { id: action.id, type: 'folder', name: 'New folder', open: true, children: [] },
        ],
      };

    case 'folder/toggle':
      return {
        ...state,
        notes: mapNode(state.notes, action.id, (node) =>
          isFolder(node) ? { ...node, open: !node.open } : node,
        ),
      };

    case 'folder/openPath':
      return { ...state, notes: openFolders(state.notes, action.ids) };

    case 'note/rename':
      return {
        ...state,
        notes: mapNode(state.notes, action.id, (node) =>
          isNote(node)
            ? { ...node, name: action.name || 'Untitled', edited: 'Edited just now' }
            : { ...node, name: action.name || 'Untitled' },
        ),
      };

    case 'note/setBody':
      return {
        ...state,
        notes: mapNode(state.notes, action.id, (node) =>
          isNote(node) ? { ...node, body: action.body, edited: 'Edited just now' } : node,
        ),
      };

    default:
      return state;
  }
}
