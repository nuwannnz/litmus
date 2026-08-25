import { Navigate, Outlet, type RouteObject } from 'react-router-dom';
import { appPaths } from '@litmus/core';
import { LandingPage } from '../marketing/LandingPage';
import { LoginPage } from '../auth/pages/LoginPage';
import { RegisterPage } from '../auth/pages/RegisterPage';
import { ForgotPasswordPage } from '../auth/pages/ForgotPasswordPage';
import { RequireAuth } from '../auth/RequireAuth';
import { AuthProvider } from '../auth/AuthProvider';
import { AppShell } from '../shell/AppShell';
import { AppApi } from './AppApi';
import { APP_MODULES } from './modules';

const firstModule = APP_MODULES[0];

// One pathless layout route supplies the data layer and session context to
// every screen — auth included, since login/register drive both.
export const routes: RouteObject[] = [
  {
    element: (
      <AppApi>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </AppApi>
    ),
    children: [
      { path: appPaths.landing, element: <LandingPage /> },
      { path: appPaths.login, element: <LoginPage /> },
      { path: appPaths.register, element: <RegisterPage /> },
      { path: appPaths.forgotPassword, element: <ForgotPasswordPage /> },
      {
        element: <RequireAuth />,
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
    ],
  },
];
