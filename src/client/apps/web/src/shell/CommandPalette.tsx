import { useEffect, useMemo, useRef, useState } from 'react';
import { useCommands, type Command } from '@litmus/core';
import { Icon, Scrim } from '@litmus/ui';

export interface CommandPaletteProps {
  onClose: () => void;
}

const MAX_RESULTS = 12;

/** ⌘K launcher. Its contents come from whatever modules have registered. */
export function CommandPalette({ onClose }: CommandPaletteProps) {
  const commands = useCommands();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q ? commands.filter((c) => c.label.toLowerCase().includes(q)) : commands;
    return matched.slice(0, MAX_RESULTS);
  }, [commands, query]);

  const active = Math.min(index, Math.max(0, results.length - 1));

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector('.palette-item.is-active')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const run = (command: Command | undefined) => {
    if (!command) return;
    onClose();
    command.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(results[active]);
    }
  };

  let lastGroup = '';

  return (
    <Scrim onDismiss={onClose} alignTop>
      <div className="palette" role="dialog" aria-label="Command palette">
        <div className="palette-input">
          <Icon name="search" />
          <input
            autoFocus
            value={query}
            placeholder="Search tasks, projects, notes or type a command…"
            aria-label="Search commands"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd>esc</kbd>
        </div>

        <div className="palette-list" ref={listRef}>
          {results.length ? (
            results.map((command, i) => {
              const heading = command.group !== lastGroup ? command.group : null;
              lastGroup = command.group;
              return (
                <div key={command.id}>
                  {heading && <div className="palette-group">{heading}</div>}
                  <button
                    type="button"
                    className={`palette-item ${i === active ? 'is-active' : ''}`}
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => run(command)}
                  >
                    <Icon name={command.icon} />
                    <span>{command.label}</span>
                    {command.hint && <span className="s">{command.hint}</span>}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="muted" style={{ padding: 16 }}>
              No results.
            </p>
          )}
        </div>

        <div className="palette-foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> Navigate
          </span>
          <span>
            <kbd>↵</kbd> Select
          </span>
          <span>
            <kbd>esc</kbd> Close
          </span>
        </div>
      </div>
    </Scrim>
  );
}
