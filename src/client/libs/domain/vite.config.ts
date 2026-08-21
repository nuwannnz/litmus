/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

// Test-only config: `libs/domain` is consumed from source, so it has no build target.
export default defineConfig({
  cacheDir: '../../node_modules/.vite/libs/domain',
  plugins: [nxViteTsPaths()],
  test: {
    name: '@litmus/domain',
    watch: false,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    reporters: ['default'],
  },
});
