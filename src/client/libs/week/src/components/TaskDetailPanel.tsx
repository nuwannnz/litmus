import { useMemo, useState } from 'react';
import type { Task, TaskStatus } from '@litmus/domain';
import {
  useAllNotes,
  useNoteLookup,
  useProject,
  useProjects,
  useWorkspaceDispatch,
} from '@litmus/core';
import {
  Button,
  CapsLabel,
  DashedButton,
  Editable,
  Icon,
  IconButton,
  LinkedNote,
  NotePickerModal,
  useToast,
} from '@litmus/ui';
import { StatusSwitch } from './StatusSwitch';
import { TaskMetaList } from './TaskMetaList';
import { SubtaskList } from './SubtaskList';

export interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
  onOpenNote: (noteId: string) => void;
}

/** The slide-in Task Detail (PRD FR-17 – FR-22). */
export function TaskDetailPanel({ task, onClose, onOpenNote }: TaskDetailPanelProps) {
  const dispatch = useWorkspaceDispatch();
  const toast = useToast();
  const projects = useProjects();
  const project = useProject(task.projectId);
  const lookupNote = useNoteLookup();
  const allNotes = useAllNotes();
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

  const patch = (changes: Partial<Task>) => {
    dispatch({ type: 'task/patch', id: task.id, patch: changes });
    if (changes.day) toast('Task rescheduled', 'calendar');
  };

  const setStatus = (status: TaskStatus) =>
    dispatch({ type: 'task/patch', id: task.id, patch: { status } });

  const toggleDone = () => {
    dispatch({ type: 'task/toggleDone', id: task.id });
    toast(task.status === 'done' ? 'Task reopened' : 'Task completed');
  };

  const remove = () => {
    dispatch({ type: 'task/remove', id: task.id });
    toast('Task deleted', 'trash');
    onClose();
  };

  const linkNote = (noteId: string) => {
    dispatch({ type: 'task/linkNote', taskId: task.id, noteId });
    setLinking(false);
    toast('Note linked', 'link');
  };

  return (
    <aside className="panel" role="dialog" aria-label="Task detail">
      <header className="panel-head">
        <IconButton icon="arrow-right" label="Close task detail" onClick={onClose} />
        <span className="spacer" />
        <IconButton icon="star" label="Favourite" />
        <IconButton icon="more" label="More actions" />
      </header>

      <div className="panel-body">
        <Editable
          as="h2"
          className="panel-title"
          value={task.title}
          singleLine
          placeholder="Task title"
          onCommit={(title) => title && patch({ title })}
        />

        <div className="panel-section">
          <CapsLabel>Status</CapsLabel>
          <StatusSwitch value={task.status} onChange={setStatus} />
        </div>

        <TaskMetaList task={task} project={project} projects={projects} onPatch={patch} />

        <div className="divider" />

        <div className="panel-section">
          <CapsLabel>Description</CapsLabel>
          <Editable
            as="p"
            className="panel-desc"
            value={task.desc}
            placeholder="Add a description…"
            onCommit={(desc) => patch({ desc })}
          />
        </div>

        <div className="panel-section">
          <CapsLabel>Linked notes</CapsLabel>
          {task.noteIds.map((id) => {
            const note = lookupNote(id);
            return note ? (
              <LinkedNote
                key={id}
                name={note.name}
                meta={note.edited}
                onOpen={() => onOpenNote(id)}
              />
            ) : null;
          })}
          <DashedButton style={{ marginTop: 8 }} onClick={() => setLinking(true)}>
            Link a note
          </DashedButton>
        </div>

        <SubtaskList
          subtasks={task.subtasks}
          onToggle={(subtaskId) => dispatch({ type: 'subtask/toggle', taskId: task.id, subtaskId })}
          onRemove={(subtaskId) => dispatch({ type: 'subtask/remove', taskId: task.id, subtaskId })}
          onAdd={(label) => dispatch({ type: 'subtask/add', taskId: task.id, label })}
        />
      </div>

      <footer className="panel-foot">
        <Button variant="primary" block onClick={toggleDone}>
          <Icon name="check-circle" size="sm" />
          {task.status === 'done' ? 'Mark Incomplete' : 'Mark Complete'}
        </Button>
        <IconButton icon="trash" label="Delete task" className="btn" onClick={remove} />
      </footer>

      {linking && (
        <NotePickerModal
          notes={pickableNotes}
          onPick={linkNote}
          onClose={() => setLinking(false)}
        />
      )}
    </aside>
  );
}
