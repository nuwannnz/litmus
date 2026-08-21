import { STATUSES, STATUS_LABELS, type TaskStatus } from '@litmus/domain';

const DOT_COLOR: Record<TaskStatus, string> = {
  todo: 'var(--text-muted)',
  progress: 'var(--accent)',
  done: 'var(--dot-mint)',
};

export function StatusSwitch({
  value,
  onChange,
}: {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
}) {
  return (
    <div className="status-switch">
      {STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          aria-pressed={status === value}
          onClick={() => onChange(status)}
        >
          <i className="dot" style={{ background: DOT_COLOR[status] }} />
          {STATUS_LABELS[status]}
        </button>
      ))}
    </div>
  );
}
