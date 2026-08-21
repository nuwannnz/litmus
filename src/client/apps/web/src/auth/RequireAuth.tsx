import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { appPaths } from '@litmus/core';
import { useAuth } from './AuthProvider';

/** Gate for everything under `/app`. Sends signed-out visitors to the login screen. */
export function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={appPaths.login} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
