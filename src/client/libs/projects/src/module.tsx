import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  appPaths,
  useProjects,
  useRegisterCommands,
  type AppModule,
  type Command,
} from '@litmus/core';
import { ProjectsPage } from './ProjectsPage';
import { ProjectDetailPage } from './ProjectDetailPage';

function ProjectCommands() {
  const navigate = useNavigate();
  const projects = useProjects();

  const commands = useMemo<Command[]>(
    () => [
      {
        id: 'projects:goto',
        group: 'Go to',
        label: 'Projects',
        icon: 'folder',
        run: () => navigate(appPaths.projects),
      },
      ...projects.map<Command>((project) => ({
        id: `projects:open:${project.id}`,
        group: 'Projects',
        label: project.name,
        icon: 'folder',
        hint: `${project.taskCount} tasks`,
        run: () => navigate(appPaths.project(project.id)),
      })),
    ],
    [navigate, projects],
  );

  useRegisterCommands('projects', commands);
  return null;
}

export const projectsModule: AppModule = {
  id: 'projects',
  label: 'Projects',
  icon: 'folder',
  path: 'projects',
  routes: [
    { index: true, element: <ProjectsPage /> },
    { path: ':projectId', element: <ProjectDetailPage /> },
  ],
  Bridge: ProjectCommands,
};
