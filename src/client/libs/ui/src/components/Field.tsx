import type { ReactNode } from 'react';

export function Label({ children, caps = false }: { children: ReactNode; caps?: boolean }) {
  return <span className={caps ? 'label label--caps' : 'label'}>{children}</span>;
}

export function CapsLabel({ children }: { children: ReactNode }) {
  return <span className="label--caps">{children}</span>;
}

export interface FieldProps {
  label: ReactNode;
  children: ReactNode;
  /** Small-caps label, as used in modals. Auth forms use sentence case. */
  caps?: boolean;
  /** Use a plain `div` when the control is not a single labelable input. */
  as?: 'label' | 'div';
}

export function Field({ label, children, caps = true, as = 'label' }: FieldProps) {
  const Tag = as;
  return (
    <Tag className="field">
      <Label caps={caps}>{label}</Label>
      {children}
    </Tag>
  );
}
