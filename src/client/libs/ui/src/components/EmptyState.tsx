import type { ReactNode } from 'react';
import { Icon, type IconName } from '../icons';

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  body: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <span className="empty-art">
        <Icon name={icon} size="lg" />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
    </div>
  );
}
