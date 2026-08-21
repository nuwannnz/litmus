import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const lib = (name: string) => fileURLToPath(new URL(`../../libs/${name}/src`, import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  cacheDir: '../../node_modules/.vite/web',
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@litmus/ui/styles.css', replacement: `${lib('ui')}/styles/index.css` },
      { find: '@litmus/ui', replacement: `${lib('ui')}/index.ts` },
      { find: '@litmus/domain', replacement: `${lib('domain')}/index.ts` },
      { find: '@litmus/core', replacement: `${lib('core')}/index.ts` },
      { find: '@litmus/week', replacement: `${lib('week')}/index.ts` },
      { find: '@litmus/projects', replacement: `${lib('projects')}/index.ts` },
      { find: '@litmus/notes', replacement: `${lib('notes')}/index.ts` },
    ],
  },
  server: { port: 4200, host: 'localhost' },
  preview: { port: 4300, host: 'localhost' },
  build: { outDir: '../../dist/apps/web', emptyOutDir: true, sourcemap: true },
});
