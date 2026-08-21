import type { ReactNode } from 'react';
import { AvatarStack } from '@litmus/ui';
import { Brand } from '../../components/Brand';
import { PreviewTaskCard } from '../../components/PreviewTaskCard';
import '../auth.css';

export interface AuthLayoutProps {
  title: string;
  lede: string;
  /** Headline and copy for the gradient panel on the right. */
  asideTitle: string;
  asideBody: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({
  title,
  lede,
  asideTitle,
  asideBody,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="auth">
      <section className="auth-form">
        <div className="auth-inner">
          <Brand />
          <h1>{title}</h1>
          <p className="lede">{lede}</p>
          {children}
          {footer && <p className="auth-alt">{footer}</p>}
        </div>
      </section>

      <aside className="auth-aside">
        <h2>{asideTitle}</h2>
        <p>{asideBody}</p>
        <div className="trust">
          <AvatarStack people={['NK', 'AL', 'JS']} />
          Trusted by 12,000+ focused teams
        </div>

        <PreviewTaskCard
          className="float float--a"
          title="Finalize onboarding flow"
          category="Design"
          color="lav"
          meta="2:00 PM · 2/5"
        />
        <PreviewTaskCard
          className="float float--b"
          title="Sprint retro & planning"
          category="Meeting"
          color="yellow"
          meta="10:00 AM · 0/3"
        />
      </aside>
    </div>
  );
}
