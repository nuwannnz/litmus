import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Flat ESLint config for the whole workspace.
 *
 * Layering is enforced by `@nx/enforce-module-boundaries` against the project
 * tags declared in each project's `package.json` (`nx.tags`). The rule below is
 * the executable form of the dependency direction documented in
 * `src/client/CLAUDE.md`:
 *
 *     domain -> api -> ui -> core -> feature modules -> apps/web
 *
 * A layer may depend on everything to its left and nothing to its right, and
 * because all three feature modules share the single tag `type:feature` — which
 * is absent from their own allow-list — a feature module cannot import another
 * feature module either. The rule also rejects reaching into another project by
 * relative path, so the shell can only see a module through its entry point;
 * subpath imports (`@litmus/week/src/...`) are already shut out by each
 * library's `exports` map and by `tsconfig.base.json`'s path aliases.
 */
export default tseslint.config(
  {
    // Build output, caches and generated assets are never linted.
    ignores: ['**/dist', '**/node_modules', '**/.nx', '**/vite.config.*.timestamp*'],
  },

  // ---------------------------------------------------------------- boundaries
  {
    plugins: { '@nx': nx },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          // Workspace-level tooling config is not a library and carries no
          // tag, so the two files every project is allowed to reach up and
          // import by relative path are listed here: the ESLint config itself,
          // and the shared React/jsdom Vitest config each renderable lib's
          // `vite.config.ts` composes.
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
            '^.*/vitest\\.react\\.config(\\.[cm]?ts)?$',
          ],
          depConstraints: [
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:core',
                'type:ui',
                'type:api',
                'type:domain',
              ],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:core', 'type:ui', 'type:api', 'type:domain'],
            },
            {
              sourceTag: 'type:core',
              onlyDependOnLibsWithTags: ['type:ui', 'type:api', 'type:domain'],
            },
            { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:api', 'type:domain'] },
            { sourceTag: 'type:api', onlyDependOnLibsWithTags: ['type:domain'] },
            { sourceTag: 'type:domain', onlyDependOnLibsWithTags: [] },
          ],
        },
      ],
    },
  },

  // ------------------------------------------------------------ TypeScript/JS
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Unused code is a real signal, but leading-underscore names are the
      // conventional way to say "deliberately ignored" (rest-spread omits,
      // unused catch bindings, placeholder callback args).
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // ------------------------------------------------------------------- React
  {
    files: ['**/*.{tsx,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      // The codebase is TypeScript end to end; prop types are the type
      // annotations, so the runtime propTypes rules have nothing to add and
      // would fire on every component in the workspace.
      'react/prop-types': 'off',
    },
  },

  // ---------------------------------------------------------------- data layer
  // `supabase-js` is reachable only through `@litmus/api` — feature, core, UI
  // and app code never import it directly, which keeps the data layer
  // swappable and mockable (`docs/architecture.md` §5.1).
  {
    files: ['apps/**/*.{ts,tsx}', 'libs/**/*.{ts,tsx}'],
    ignores: ['libs/api/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@supabase/supabase-js',
              message: 'Data access goes through @litmus/api.',
            },
          ],
          patterns: [
            {
              group: ['@supabase/*'],
              message: 'Data access goes through @litmus/api.',
            },
          ],
        },
      ],
    },
  },

  // Config files and tooling run in Node, not the browser.
  {
    files: ['**/*.config.{ts,mts,js,mjs,cjs}', 'eslint.config.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },

  // Prettier owns formatting; disable every stylistic rule that would argue
  // with it. Must stay last so it wins over the configs above.
  prettier,
);
