import type { ColorName } from '@litmus/domain';

export interface ProgressProps {
  /** 0–100. */
  value: number;
  color?: ColorName;
  className?: string;
  style?: React.CSSProperties;
}

export function Progress({ value, color, className, style }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={['progress', className].filter(Boolean).join(' ')}
      data-color={color}
      style={style}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}
