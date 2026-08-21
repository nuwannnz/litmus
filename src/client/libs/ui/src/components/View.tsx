import type { ReactNode } from 'react';

export function View({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={['view', className].filter(Boolean).join(' ')}>{children}</section>;
}

export interface ViewHeaderProps {
  title: ReactNode;
  sub?: ReactNode;
  /** Rendered above the title — breadcrumbs, usually. */
  above?: ReactNode;
  tools?: ReactNode;
}

export function ViewHeader({ title, sub, above, tools }: ViewHeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar-lead">
        {above}
        <h1>{title}</h1>
        {sub && <p className="sub">{sub}</p>}
      </div>
      {tools && <div className="topbar-tools">{tools}</div>}
    </header>
  );
}
