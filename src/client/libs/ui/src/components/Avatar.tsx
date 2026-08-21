import type { ReactNode } from 'react';
import { PEOPLE, type PersonId } from '@litmus/domain';

export function Avatar({ person, className }: { person: PersonId; className?: string }) {
  const p = PEOPLE[person];
  return (
    <span
      className={['avatar', className].filter(Boolean).join(' ')}
      data-color={p.color}
      title={p.name}
    >
      {p.id}
    </span>
  );
}

export function AvatarStack({ people }: { people: PersonId[] }) {
  return (
    <span className="avatar-stack">
      {people.map((id) => (
        <Avatar key={id} person={id} />
      ))}
    </span>
  );
}

export function AvatarGroup({ children }: { children: ReactNode }) {
  return <span className="avatar-stack">{children}</span>;
}
