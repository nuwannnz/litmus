import { useMemo, useState } from 'react';
import { Icon } from '../icons';
import { Scrim } from './Modal';

export interface PickableNote {
  id: string;
  name: string;
  /** Where the note lives — a project name, or `Notes` when unfiled. */
  location: string;
}

export interface NotePickerModalProps {
  notes: PickableNote[];
  onPick: (noteId: string) => void;
  onClose: () => void;
  title?: string;
}

/**
 * The "link a note" picker. Presentational on purpose — the Week panel, the
 * Project sidebar and the Note editor each pass their own list in.
 */
export function NotePickerModal({
  notes,
  onPick,
  onClose,
  title = 'Search notes to link…',
}: NotePickerModalProps) {
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? notes.filter((n) => n.name.toLowerCase().includes(q)) : notes;
  }, [notes, query]);

  return (
    <Scrim onDismiss={onClose}>
      <div className="modal modal--wide" role="dialog" aria-label="Link a note">
        <div className="palette-input">
          <Icon name="search" />
          <input
            autoFocus
            value={query}
            placeholder={title}
            aria-label={title}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd>esc</kbd>
        </div>
        <div className="palette-list">
          <div className="palette-group">Recent notes</div>
          {matches.length ? (
            matches.map((note) => (
              <button
                key={note.id}
                type="button"
                className="palette-item"
                onClick={() => onPick(note.id)}
              >
                <Icon name="file" />
                <span>{note.name}</span>
                <span className="s">{note.location}</span>
              </button>
            ))
          ) : (
            <p className="muted" style={{ padding: 14 }}>
              No notes match.
            </p>
          )}
        </div>
        <div className="palette-foot">
          <kbd>↵</kbd> Select <kbd>esc</kbd> Close
        </div>
      </div>
    </Scrim>
  );
}
