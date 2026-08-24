import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library only auto-registers its cleanup when Vitest runs with
// `globals: true`. This workspace imports `describe`/`it`/`expect` explicitly
// instead, so the unmount between tests is registered explicitly too — without
// it every render would stack up in the same jsdom document.
afterEach(cleanup);
