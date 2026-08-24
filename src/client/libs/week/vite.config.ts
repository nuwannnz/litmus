/// <reference types='vitest' />
import { defineConfig } from 'vite';

import { reactLibTestConfig } from '../../vitest.react.config';

// Test-only config: `libs/week` is consumed from source, so it has no build target.
export default defineConfig(reactLibTestConfig({ name: '@litmus/week', dir: 'libs/week' }));
