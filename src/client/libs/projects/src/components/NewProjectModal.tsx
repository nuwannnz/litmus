import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { COLORS, type ColorName } from '@litmus/domain';
import { Button, CheckMark, Field, Icon, Modal } from '@litmus/ui';

export interface NewProjectDraft {
  name: string;
  color: ColorName;
  desc: string;
  taskTitles: string[];
}

export interface NewProjectModalProps {
  onCreate: (draft: NewProjectDraft) => void;
  onClose: () => void;
}

export function NewProjectModal({ onCreate, onClose }: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<ColorName>('mint');
  const [desc, setDesc] = useState('');
  const [taskTitles, setTaskTitles] = useState<string[]>([]);
  const [draftTask, setDraftTask] = useState('');

  const addTask = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const title = draftTask.trim();
    if (!title) return;
    setTaskTitles((list) => [...list, title]);
    setDraftTask('');
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate({ name: trimmed, color, desc, taskTitles });
  };

  return (
    <Modal
      title="New Project"
      wide
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!name.trim()}>
            <Icon name="check" size="sm" /> Create Project
          </Button>
        </>
      }
    >
      <Field label="Project name">
        <input
          autoFocus
          className="input"
          value={name}
          placeholder="e.g. Website Redesign"
          autoComplete="off"
          required
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <Field as="div" label="Colour">
        <div className="row gap-10">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className="color-swatch"
              data-color={c}
              aria-pressed={c === color}
              aria-label={c}
              onClick={() => setColor(c)}
            >
              {c === color && <Icon name="check" size="sm" />}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Description">
        <textarea
          className="textarea"
          value={desc}
          placeholder="What is this project about?"
          onChange={(e) => setDesc(e.target.value)}
        />
      </Field>

      <Field as="div" label="Tasks">
        {taskTitles.map((title, i) => (
          <div key={`${title}-${i}`} className="ptask modal-task">
            <CheckMark checked={false} />
            <span className="t">{title}</span>
            <button
              type="button"
              className="subtask-del"
              aria-label={`Remove ${title}`}
              onClick={() => setTaskTitles((list) => list.filter((_, index) => index !== i))}
            >
              <Icon name="x" size="sm" />
            </button>
          </div>
        ))}
        <input
          className="input input--compact"
          value={draftTask}
          placeholder="Add a task and press Enter"
          aria-label="Add a task"
          autoComplete="off"
          onChange={(e) => setDraftTask(e.target.value)}
          onKeyDown={addTask}
        />
      </Field>
    </Modal>
  );
}
