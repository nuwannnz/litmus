import { useState, type FormEvent } from 'react';
import { CATEGORIES, type CategoryName } from '@litmus/domain';
import { Button, Icon, IconButton } from '@litmus/ui';

export interface TaskComposerProps {
  onCreate: (title: string, category: CategoryName) => void;
  onCancel: () => void;
}

/** The inline "add a task" form at the foot of a day column. */
export function TaskComposer({ onCreate, onCancel }: TaskComposerProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryName>('Design');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreate(trimmed, category);
    setTitle('');
  };

  return (
    <form className="composer" onSubmit={submit}>
      <input
        autoFocus
        value={title}
        placeholder="What needs doing?"
        aria-label="Task title"
        autoComplete="off"
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
        }}
      />
      <div className="composer-row">
        <select
          value={category}
          aria-label="Category"
          onChange={(e) => setCategory(e.target.value as CategoryName)}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <Button type="submit" variant="primary">
          Add
        </Button>
        <IconButton icon="x" label="Cancel" iconSize="sm" onClick={onCancel} />
      </div>
    </form>
  );
}

export function AddTaskButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="add-task" onClick={onClick}>
      <Icon name="plus" size="sm" /> Add a task
    </button>
  );
}
