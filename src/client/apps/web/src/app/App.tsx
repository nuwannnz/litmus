import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { CommandRegistryProvider, WorkspaceProvider } from '@litmus/core';
import { IconSprite, ThemeProvider, ToastProvider } from '@litmus/ui';
import { routes } from './routes';

const router = createBrowserRouter(routes);

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <WorkspaceProvider>
          <CommandRegistryProvider>
            <IconSprite />
            <RouterProvider router={router} />
          </CommandRegistryProvider>
        </WorkspaceProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
