import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pluralize, uid } from '@litmus/domain';
import { appPaths, useProjects, useWorkspaceDispatch } from '@litmus/core';
import {
  Button,
  EmptyState,
  Icon,
  SearchInput,
  Segmented,
  View,
  ViewHeader,
  useToast,
} from '@litmus/ui';
import { ProjectCard } from './components/ProjectCard';
import { ProjectTable } from './components/ProjectTable';
import { NewProjectModal, type NewProjectDraft } from './components/NewProjectModal';
import './projects.css';

type Layout = 'grid' | 'list';

export function ProjectsPage() {
  const navigate = useNavigate();
  const dispatch = useWorkspaceDispatch();
  const toast = useToast();
  const projects = useProjects();

  const [query, setQuery] = useState('');
  const [layout, setLayout] = useState<Layout>('grid');
  const [creating, setCreating] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => `${p.name} ${p.desc}`.toLowerCase().includes(q));
  }, [projects, query]);

  const totalTasks = projects.reduce((n, p) => n + p.taskCount, 0);
  const open = (projectId: string) => navigate(appPaths.project(projectId));

  const create = (draft: NewProjectDraft) => {
    dispatch({ type: 'project/add', id: uid('p'), input: draft });
    setCreating(false);
    toast(`“${draft.name}” created`, 'folder');
  };

  const newProjectButton = (
    <Button variant="primary" onClick={() => setCreating(true)}>
      <Icon name="plus" size="sm" /> New Project
    </Button>
  );

  return (
    <View>
      <ViewHeader
        title="Projects"
        sub={
          projects.length
            ? `${pluralize(projects.length, 'active project')} · ${pluralize(totalTasks, 'task')}`
            : '0 active projects'
        }
        tools={
          <>
            <SearchInput value={query} onChange={setQuery} placeholder="Search projects" />
            <Segmented
              className="desktop-only"
              value={layout}
              onChange={setLayout}
              options={[
                { value: 'grid', label: 'Grid', icon: 'grid', iconOnly: true },
                { value: 'list', label: 'List', icon: 'rows', iconOnly: true },
              ]}
            />
            {newProjectButton}
          </>
        }
      />

      <div className="projects-body">
        {projects.length === 0 ? (
          <EmptyState
            icon="folder"
            title="No projects yet"
            body="Create a project to group related tasks, track progress, and plan them into your week."
            action={newProjectButton}
          />
        ) : matches.length === 0 ? (
          <EmptyState
            icon="search"
            title="No matches"
            body={`Nothing matches “${query.trim()}”.`}
          />
        ) : layout === 'grid' ? (
          <div className="project-grid">
            {matches.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={() => open(project.id)} />
            ))}
          </div>
        ) : (
          <ProjectTable projects={matches} onOpen={open} />
        )}
      </div>

      {creating && <NewProjectModal onCreate={create} onClose={() => setCreating(false)} />}
    </View>
  );
}
