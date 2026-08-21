import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { IconName } from '@litmus/ui';

export interface Command {
  id: string;
  /** Heading the command is filed under in the palette. */
  group: string;
  label: string;
  icon: IconName;
  /** Right-aligned secondary text. */
  hint?: string;
  run: () => void;
}

interface RegistryValue {
  commands: Command[];
  register: (sourceId: string, commands: Command[]) => void;
  unregister: (sourceId: string) => void;
}

const CommandRegistryContext = createContext<RegistryValue | null>(null);

/**
 * Lets each feature module contribute to the command palette without the shell
 * having to know what modules exist. Sources keep their registration order.
 */
export function CommandRegistryProvider({ children }: { children: ReactNode }) {
  const [sources, setSources] = useState<{ id: string; commands: Command[] }[]>([]);

  const register = useCallback((sourceId: string, commands: Command[]) => {
    setSources((list) => {
      const index = list.findIndex((s) => s.id === sourceId);
      if (index === -1) return [...list, { id: sourceId, commands }];
      const next = [...list];
      next[index] = { id: sourceId, commands };
      return next;
    });
  }, []);

  const unregister = useCallback((sourceId: string) => {
    setSources((list) => list.filter((s) => s.id !== sourceId));
  }, []);

  const commands = useMemo(() => sources.flatMap((s) => s.commands), [sources]);
  const value = useMemo(
    () => ({ commands, register, unregister }),
    [commands, register, unregister],
  );

  return (
    <CommandRegistryContext.Provider value={value}>{children}</CommandRegistryContext.Provider>
  );
}

function useRegistry(): RegistryValue {
  const ctx = useContext(CommandRegistryContext);
  if (!ctx) throw new Error('Command hooks must be used inside a <CommandRegistryProvider>');
  return ctx;
}

/** Every registered command, in source order. Read by the command palette. */
export function useCommands(): Command[] {
  return useRegistry().commands;
}

/**
 * Publishes a module's commands for as long as the calling component is mounted.
 * `commands` must be memoized — it is the effect's dependency.
 */
export function useRegisterCommands(sourceId: string, commands: Command[]): void {
  const { register, unregister } = useRegistry();
  useEffect(() => {
    register(sourceId, commands);
    return () => unregister(sourceId);
  }, [sourceId, commands, register, unregister]);
}
