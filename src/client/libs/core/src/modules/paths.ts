/**
 * Every in-app URL in one place. Modules link to each other through this map
 * rather than by hard-coding another module's route shape.
 */
export const appPaths = {
  landing: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  app: '/app',
  week: '/app/week',
  task: (taskId: string) => `/app/week?task=${encodeURIComponent(taskId)}`,
  projects: '/app/projects',
  project: (projectId: string) => `/app/projects/${encodeURIComponent(projectId)}`,
  notes: '/app/notes',
  note: (noteId: string) => `/app/notes/${encodeURIComponent(noteId)}`,
} as const;
