import { NavLink } from 'react-router-dom';
import { appPaths, type AppModule } from '@litmus/core';
import { Icon, IconButton } from '@litmus/ui';
import { useAuth } from '../auth/AuthProvider';
import { ThemeToggle } from '../components/ThemeToggle';

export interface RailProps {
  modules: AppModule[];
  onOpenPalette: () => void;
}

/**
 * Primary navigation: a vertical rail on desktop, a tab bar on phones.
 * `NavLink` sets `aria-current="page"` itself, which is what the styling keys off.
 */
export function Rail({ modules, onOpenPalette }: RailProps) {
  const { user, signOut } = useAuth();

  return (
    <nav className="rail" aria-label="Primary">
      <NavLink
        className="rail-logo desktop-only"
        to={appPaths.landing}
        title="Back to the landing page"
      >
        <Icon name="grid" size="lg" style={{ strokeWidth: 2 }} />
      </NavLink>

      <div className="rail-nav">
        {modules.map((module) => (
          <NavLink key={module.id} to={`${appPaths.app}/${module.path}`} className="rail-item">
            <Icon name={module.icon} size="lg" />
            <span>{module.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="rail-foot desktop-only">
        <ThemeToggle />
        <IconButton icon="command" label="Command palette (⌘K)" onClick={onOpenPalette} />
        <button
          type="button"
          className="avatar rail-avatar"
          data-color="peach"
          title={`${user?.name ?? 'Account'} — sign out`}
          aria-label="Sign out"
          onClick={signOut}
        >
          {user?.initials ?? 'NK'}
        </button>
      </div>
    </nav>
  );
}
