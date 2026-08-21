import { useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  appPaths,
  useRegisterCommands,
  type AppModule,
  type Command,
} from '@litmus/core';
import { useHotkeys, useTheme, useToast } from '@litmus/ui';
import { Rail } from './Rail';
import { CommandPalette } from './CommandPalette';
import './shell.css';

export interface AppShellProps {
  modules: AppModule[];
}

/** The authenticated frame: navigation rail, module outlet, command palette. */
export function AppShell({ modules }: AppShellProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useHotkeys({
    'mod+k': (e) => {
      e.preventDefault();
      setPaletteOpen((open) => !open);
    },
  });

  return (
    <div className="app">
      <Rail modules={modules} onOpenPalette={() => setPaletteOpen(true)} />
      <main className="main">
        <Outlet />
      </main>

      <ShellCommands modules={modules} />
      {modules.map((module) =>
        module.Bridge ? <module.Bridge key={module.id} /> : null,
      )}

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}

/** Shell-owned commands: navigation shortcuts modules do not provide themselves. */
function ShellCommands({ modules }: { modules: AppModule[] }) {
  const navigate = useNavigate();
  const { toggleTheme, theme } = useTheme();
  const toast = useToast();

  const commands = useMemo<Command[]>(
    () => [
      {
        id: 'shell:theme',
        group: 'Actions',
        label: 'Toggle dark mode',
        icon: theme === 'dark' ? 'sun' : 'moon',
        run: () => {
          toggleTheme();
          toast(theme === 'dark' ? 'Light mode' : 'Dark mode', theme === 'dark' ? 'sun' : 'moon');
        },
      },
    ],
    [theme, toggleTheme, toast],
  );

  useRegisterCommands('shell', commands);

  // 1 / 2 / 3 jump straight to a module, in rail order.
  useHotkeys(
    Object.fromEntries(
      modules.map((module, i) => [
        String(i + 1),
        () => navigate(`${appPaths.app}/${module.path}`),
      ]),
    ),
  );

  useHotkeys({
    d: () => {
      toggleTheme();
      toast(theme === 'dark' ? 'Light mode' : 'Dark mode', theme === 'dark' ? 'sun' : 'moon');
    },
  });

  return null;
}
