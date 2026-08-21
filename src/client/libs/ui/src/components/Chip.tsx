import type { ReactNode } from 'react';
import type { ColorName } from '@litmus/domain';

export interface ChipProps {
  color?: ColorName;
  /** Show the saturated colour dot before the label. */
  dot?: boolean;
  /** Borderless variant used for secondary metadata. */
  plain?: boolean;
  className?: string;
  children: ReactNode;
}

export function Chip({ color, dot = false, plain = false, className, children }: ChipProps) {
  return (
    <span
      className={['chip', plain ? 'chip--plain' : '', className].filter(Boolean).join(' ')}
      data-color={color}
    >
      {dot && <i className="dot" />}
      {children}
    </span>
  );
}

export function Dot({ color, className }: { color?: ColorName; className?: string }) {
  return <i className={['dot', className].filter(Boolean).join(' ')} data-color={color} />;
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}
