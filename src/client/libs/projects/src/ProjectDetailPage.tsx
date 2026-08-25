import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { STATUSES, STATUS_LABELS, uuidv7, type TaskStatus } from '@litmus/domain';
import {
  appPaths,
  useAllNotes,
  useNoteLookup,
  useProject,
  useProjectTasks,
  useProjects,
  useWorkspaceDispatch,
} from '@litmus/core';
import {
  Button,
  CountPill,
  Icon,
  NotePickerModal,
  Progress,
  Segmented,
  View,
  ViewHeader,
  useToast,
} from '@litmus/ui';
import { ProjectTaskRow } from './components/ProjectTaskRow';
import { ProjectKanban } from './components/ProjectKanban';
import { ProjectSidebar } from './components/ProjectSidebar';
import './projects.css';

type Tab = 'list' | 'board';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useWorkspaceDispatch();
  const toast = useToast();

  const project = useProject(projectId);
  const tasks = useProjectTasks(projectId);
  const projects = useProjects();
  const allNotes = useAllNotes();
  const lookupNote = useNoteLookup();

  const [tab, setTab] = useState<Tab>('list');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

  const pickableNotes = useMemo(
    () =>
      allNotes.map((note) => ({
        id: note.id,
        name: note.name,
        location: projects.find((p) => p.id === note.projectId)?.name ?? 'Notes',
      })),
    [allNotes, projects],
  );

  if (!project) return <Navigate to={appPaths.projects} replace />;

  const move = (taskId: string, status: TaskStatus) => {
    setDraggingId(null);
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;
    dispatch({ type: 'projectTask/setStatus', id: taskId, status });
    toast(`Moved to ${STATUS_LABELS[status]}`, 'arrow-right');
  };

  const addTask = () => {
    dispatch({ type: 'projectTask/add', id: uuidv7(), projectId: project.id });
    toast(`Task added to ${project.name}`, 'plus');
  };

  const linkNote = (noteId: string) => {
    dispatch({ type: 'project/linkNote', projectId: project.id, noteId });
    setLinking(false);
    toast('Note linked', 'link');
  };

  return (
    <View>
      <ViewHeader
        above={
          <div className="crumbs">
            <button type="button" onClick={() => navigate(appPaths.projects)}>
              Projects
            </button>
            <span>/</span>
            <b>{project.name}</b>
          </div>
        }
        title={project.name}
        tools={
          <>
            <Segmented
              value={tab}
              onChange={setTab}
              options={[
                { value: 'list', label: 'List', icon: 'rows' },
                { value: 'board', label: 'Board', icon: 'kanban' },
              ]}
            />
            <Button className="desktop-only">
              <Icon name="share" size="sm" /> Share
            </Button>
            <Button variant="primary" onClick={addTask}>
              <Icon name="plus" size="sm" /> New Task
            </Button>
          </>
        }
      />

      <div className="detail">
        <div className="detail-main" data-color={project.color}>
          <p className="project-desc">{project.desc}</p>

          <div style={{ margin: '16px 0 4px' }}>
            <div className="progress-row">
              <span>Progress</span>
              <b>
                {project.progress}% · {project.done} of {project.taskCount} tasks done
              </b>
            </div>
            <Progress value={project.progress} />
          </div>

          <div className="stat-row">
            <span className="stat">
              <b>{project.taskCount}</b>
              <span>Tasks</span>
            </span>
            <span className="stat">
              <b>{project.due}</b>
              <span>Due this week</span>
            </span>
            <span className="stat">
              <b>{project.members.length}</b>
              <span>Members</span>
            </span>
            <span className="stat">
              <b>{project.priority}</b>
              <span>Priority</span>
            </span>
          </div>

          <p className="hint">
            <Icon name="bulb" size="sm" /> Tasks with a due date automatically appear on your Week
            board.
          </p>

          {tab === 'list' ? (
            STATUSES.map((status) => {
              const group = tasks.filter((t) => t.status === status);
              if (!group.length) return null;
              return (
                <div key={status} className="group">
                  <div className="group-head">
                    {STATUS_LABELS[status]}
                    <CountPill count={group.length} />
                  </div>
                  {group.map((task) => (
                    <ProjectTaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => dispatch({ type: 'projectTask/toggleDone', id: task.id })}
                    />
                  ))}
                </div>
              );
            })
          ) : (
            <ProjectKanban
              tasks={tasks}
              draggingId={draggingId}
              onDragStateChange={setDraggingId}
              onMove={move}
            />
          )}
        </div>

        <ProjectSidebar
          project={project}
          notes={project.noteIds.map(lookupNote)}
          onOpenNote={(noteId) => navigate(appPaths.note(noteId))}
          onLinkNote={() => setLinking(true)}
        />
      </div>

      {linking && (
        <NotePickerModal
          notes={pickableNotes}
          onPick={linkNote}
          onClose={() => setLinking(false)}
        />
      )}
    </View>
  );
}
