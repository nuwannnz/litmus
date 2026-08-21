import { useEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Icon, type IconName } from '@litmus/ui';

interface Position {
  left: number;
  top: number;
}

const COMMANDS: { icon: IconName; command: string; arg?: string; label: string }[] = [
  { icon: 'bold', command: 'bold', label: 'Bold' },
  { icon: 'italic', command: 'italic', label: 'Italic' },
  { icon: 'strike', command: 'strikeThrough', label: 'Strikethrough' },
  { icon: 'underline', command: 'underline', label: 'Underline' },
];

const BAR_WIDTH = 200;

/**
 * Floating formatting toolbar that follows a text selection inside the editor.
 * `execCommand` is deprecated but is what the prototype demonstrates; it will be
 * replaced when the editor moves onto a real rich-text engine.
 */
export function FormatBar({ scopeRef }: { scopeRef: RefObject<HTMLElement | null> }) {
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    const onSelectionChange = () => {
      const selection = document.getSelection();
      const scope = scopeRef.current;
      const anchor = selection?.anchorNode;
      if (!selection || selection.isCollapsed || !scope || !anchor || !scope.contains(anchor)) {
        setPosition(null);
        return;
      }
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      setPosition({
        left: Math.max(12, rect.left + rect.width / 2 - BAR_WIDTH / 2),
        top: Math.max(12, rect.top - 46),
      });
    };

    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [scopeRef]);

  if (!position) return null;

  const run = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
  };

  return createPortal(
    <div className="format-bar" style={{ left: position.left, top: position.top }}>
      {COMMANDS.map(({ icon, command, label }) => (
        <button
          key={command}
          type="button"
          title={label}
          aria-label={label}
          onMouseDown={(e) => {
            e.preventDefault();
            run(command);
          }}
        >
          <Icon name={icon} size="sm" />
        </button>
      ))}
      <span className="sep" />
      <button
        type="button"
        title="Link"
        aria-label="Link"
        onMouseDown={(e) => {
          e.preventDefault();
          run('createLink', '#');
        }}
      >
        <Icon name="link" size="sm" />
      </button>
      <button
        type="button"
        title="Code block"
        aria-label="Code block"
        onMouseDown={(e) => {
          e.preventDefault();
          run('formatBlock', 'pre');
        }}
      >
        <Icon name="code" size="sm" />
      </button>
    </div>,
    document.body,
  );
}
