import type { MouseEvent } from 'react';
import { Icon } from '../icons';

export interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}

/** The pastel tick box. A real button so it is reachable by keyboard. */
export function Checkbox({ checked, onToggle, label, className }: CheckboxProps) {
  const handle = (e: MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };
  return (
    <button
      type="button"
      className={['check', className].filter(Boolean).join(' ')}
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={handle}
    >
      <Icon name="check" />
    </button>
  );
}

/** Non-interactive tick box, for previews and read-only lists. */
export function CheckMark({ checked }: { checked: boolean }) {
  return (
    <span className="check" aria-checked={checked} role="img" aria-label={checked ? 'Done' : 'Not done'}>
      <Icon name="check" />
    </span>
  );
}
