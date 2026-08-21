import { Link } from 'react-router-dom';
import { appPaths } from '@litmus/core';
import { Button } from '@litmus/ui';
import { Brand } from '../../components/Brand';
import { ThemeToggle } from '../../components/ThemeToggle';

export function SiteNav() {
  return (
    <header className="site-nav">
      <Brand />
      <nav className="links">
        <a href="#modules">Features</a>
        <a href="#modules">Modules</a>
        <a href="#why">Pricing</a>
        <a href="#why">Changelog</a>
      </nav>
      <div className="actions">
        <ThemeToggle />
        <Link className="btn btn--ghost" to={appPaths.login}>
          Log in
        </Link>
        <Link to={appPaths.register}>
          <Button variant="primary">Get started</Button>
        </Link>
      </div>
    </header>
  );
}
