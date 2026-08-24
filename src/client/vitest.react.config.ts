/// <reference types='vitest' />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import type { UserConfig } from 'vite';

/**
 * The one React test setup, shared by every library that renders.
 *
 * `libs/domain` is pure TypeScript and keeps its own `environment: 'node'`
 * config; everything from `libs/ui` rightwards needs the same three things —
 * JSX compiled by `@vitejs/plugin-react`, a DOM to render into, and Testing
 * Library's matchers and between-test cleanup. Those live here instead of
 * being copied into five sibling `vite.config.ts` files, so raising the jsdom
 * version or adding a global stub stays a one-line change in one place.
 *
 * A library opts in with a two-line config of its own:
 *
 *     export default defineConfig(reactLibTestConfig({ name: '@litmus/ui', dir: 'libs/ui' }));
 *
 * `@nx/vite`'s inference then gives that project a `test` target, and
 * `npm test` (`nx run-many -t test`) picks it up with no further registration.
 */
export interface ReactLibTestOptions {
  /** The project's package name, used as the Vitest project label. */
  name: string;
  /** The project's path from the workspace root, e.g. `libs/ui`. */
  dir: string;
}

export function reactLibTestConfig({ name, dir }: ReactLibTestOptions): UserConfig {
  // Vite resolves both of these against the *consuming* config's directory, so
  // they are written as a climb back out of `dir` rather than as `node:url`
  // gymnastics — which would drag `@types/node` into every library's program.
  const toWorkspaceRoot = '../'.repeat(dir.split('/').length);

  return {
    cacheDir: `${toWorkspaceRoot}node_modules/.vite/${dir}`,
    // `nxViteTsPaths` resolves the `@litmus/*` aliases out of
    // `tsconfig.base.json`, so a library under test imports its dependencies
    // exactly as it does at build time — from source, with no per-library
    // alias table to keep in step.
    plugins: [react(), nxViteTsPaths()],
    test: {
      name,
      watch: false,
      environment: 'jsdom',
      setupFiles: [`${toWorkspaceRoot}vitest.react.setup.ts`],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      reporters: ['default'],
    },
  };
}
