import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';
import type { IconName } from '@litmus/ui';

/**
 * The contract between the shell and a feature module. The shell builds the
 * navigation rail and the router from these, so it never imports a module's
 * internals — which is what makes lifting a module into its own Nx app cheap.
 */
export interface AppModule {
  /** Stable id, also used as the command-registry source id. */
  id: string;
  /** Label shown in the navigation rail. */
  label: string;
  icon: IconName;
  /** Route segment under the shell, e.g. `week`. */
  path: string;
  /** Routes relative to the shell's own path. */
  routes: RouteObject[];
  /**
   * Rendered inside the shell for the module's whole lifetime. Use it to
   * publish commands with `useRegisterCommands`, not to render anything.
   */
  Bridge?: ComponentType;
}
