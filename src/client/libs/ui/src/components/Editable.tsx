import { useEffect, useRef, type ElementType, type FocusEvent, type KeyboardEvent } from 'react';

export interface EditableProps {
  /** The stored value. Written into the DOM only when it changes externally. */
  value: string;
  onCommit: (next: string) => void;
  as?: ElementType;
  className?: string;
  placeholder?: string;
  /** Commit and blur on Enter instead of inserting a line break. */
  singleLine?: boolean;
}

/**
 * A contenteditable that stays uncontrolled while focused, so the caret never
 * jumps, and commits its text on blur.
 */
export function Editable({
  value,
  onCommit,
  as: Tag = 'div',
  className,
  placeholder,
  singleLine = false,
}: EditableProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.textContent !== value) {
      el.textContent = value;
    }
  }, [value]);

  const commit = (e: FocusEvent<HTMLElement>) => {
    const next = e.currentTarget.textContent?.trim() ?? '';
    if (next !== value) onCommit(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (singleLine && e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <Tag
      ref={ref}
      className={className}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label={placeholder}
      data-placeholder={placeholder}
      onBlur={commit}
      onKeyDown={onKeyDown}
    />
  );
}
