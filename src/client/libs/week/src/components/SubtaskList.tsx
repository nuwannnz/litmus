import { useState, type FormEvent } from 'react';
import type { Subtask } from '@litmus/domain';
import { CapsLabel, Checkbox, Icon, Progress } from '@litmus/ui';

export interface SubtaskListProps {
  subtasks: Subtask[];
  onToggle: (subtaskId: string) => void;
  onRemove: (subtaskId: string) => void;
  onAdd: (label: string) => void;
}

export function SubtaskList({ subtasks, onToggle, onRemove, onAdd }: SubtaskListProps) {
  const [label, setLabel] = useState('');
  const done = subtasks.filter((s) => s.done).length;
  const pct = subtasks.length ? (done / subtasks.length) * 100 : 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setLabel('');
  };

  return (
    <div className="panel-section">
      <div className="panel-section-head">
        <CapsLabel>Subtasks</CapsLabel>
        <span className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>
          {done} of {subtasks.length}
        </span>
      </div>
      <Progress value={pct} style={{ marginBottom: 8 }} />
      {subtasks.map((subtask) => (
        <div key={subtask.id} className={`subtask ${subtask.done ? 'is-done' : ''}`}>
          <Checkbox
            checked={subtask.done}
            label={subtask.label}
            onToggle={() => onToggle(subtask.id)}
          />
          <span>{subtask.label}</span>
          <button
            type="button"
            className="subtask-del"
            title="Delete subtask"
            aria-label={`Delete ${subtask.label}`}
            onClick={() => onRemove(subtask.id)}
          >
            <Icon name="trash" size="sm" />
          </button>
        </div>
      ))}
      <form className="subtask-add" style={{ marginTop: 6 }} onSubmit={submit}>
        <input
          className="input"
          value={label}
          placeholder="Add subtask…"
          aria-label="Add subtask"
          autoComplete="off"
          onChange={(e) => setLabel(e.target.value)}
        />
      </form>
    </div>
  );
}
