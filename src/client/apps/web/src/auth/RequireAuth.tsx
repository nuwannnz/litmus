import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { appPaths } from '@litmus/core';
import { useAuth } from './AuthProvider';

/** Gate for everything under `/app`. Sends signed-out visitors to the login screen. */
export function RequireAuth() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  // Wait for the persisted-session restore before judging — otherwise a page
  // reload bounces a signed-in user to login.
  if (initializing) {
    return (
      <div className="session-loading" role="status" aria-live="polite">
        Restoring your session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to={appPaths.login} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
