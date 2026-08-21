import { Link } from 'react-router-dom';
import { appPaths } from '@litmus/core';
import { Icon } from '@litmus/ui';
import '../styles/brand.css';

/** Wordmark used by the landing nav, the footer and every auth screen. */
export function Brand() {
  return (
    <Link className="brand" to={appPaths.landing}>
      <span className="brand-mark">
        <Icon name="grid" size="sm" style={{ strokeWidth: 2.2 }} />
      </span>
      Litmus
    </Link>
  );
}
