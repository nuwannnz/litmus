import { Navigate, type RouteObject } from 'react-router-dom';
import { appPaths } from '@litmus/core';
import { LandingPage } from '../marketing/LandingPage';
import { LoginPage } from '../auth/pages/LoginPage';
import { RegisterPage } from '../auth/pages/RegisterPage';
import { ForgotPasswordPage } from '../auth/pages/ForgotPasswordPage';
import { RequireAuth } from '../auth/RequireAuth';
import { AppShell } from '../shell/AppShell';
import { AppApi } from './AppApi';
import { APP_MODULES } from './modules';

const firstModule = APP_MODULES[0];

export const routes: RouteObject[] = [
  { path: appPaths.landing, element: <LandingPage /> },
  { path: appPaths.login, element: <LoginPage /> },
  { path: appPaths.register, element: <RegisterPage /> },
  { path: appPaths.forgotPassword, element: <ForgotPasswordPage /> },
  {
    // The data layer lives inside the authenticated tree: queries assume a
    // signed-in user (RLS scopes everything), and the landing/auth screens
    // have no need for a Supabase connection.
    element: (
      <AppApi>
        <RequireAuth />
      </AppApi>
    ),
    children: [
      {
        path: appPaths.app,
        element: <AppShell modules={APP_MODULES} />,
        children: [
          {
            index: true,
            element: <Navigate to={firstModule ? firstModule.path : ''} replace />,
          },
          ...APP_MODULES.map((module) => ({
            path: module.path,
            children: module.routes,
          })),
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={appPaths.landing} replace /> },
];
