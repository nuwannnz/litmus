import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

/**
 * The Supabase client type the rest of the app programs against.
 *
 * Typed with the generated `Database` schema, so a column renamed in a
 * migration is a typecheck failure here rather than a runtime error.
 */
export type LitmusSupabaseClient = SupabaseClient<Database>;

function readEnv(name: string): string | undefined {
  return import.meta.env[name] as string | undefined;
}

/**
 * Create the app-wide Supabase client from Vite environment variables:
 * `VITE_SUPABASE_URL` plus either `VITE_SUPABASE_ANON_KEY` (the local stack
 * issues the legacy JWT anon key) or `VITE_SUPABASE_PUBLISHABLE_KEY` (hosted
 * environments use an `sb_publishable_…` key instead). The key is public by
 * design — Row Level Security is the security model.
 *
 * Throws when either variable is missing rather than failing later at the
 * first query with an opaque network error.
 */
export function createSupabaseClient(): LitmusSupabaseClient {
  const url = readEnv('VITE_SUPABASE_URL');
  const key = readEnv('VITE_SUPABASE_ANON_KEY') ?? readEnv('VITE_SUPABASE_PUBLISHABLE_KEY');

  if (!url) {
    throw new Error('Missing VITE_SUPABASE_URL — set it in your .env file or environment.');
  }
  if (!key) {
    throw new Error(
      'Missing Supabase public key — set VITE_SUPABASE_ANON_KEY (local) or ' +
        'VITE_SUPABASE_PUBLISHABLE_KEY (hosted) in your .env file or environment.',
    );
  }

  return createClient<Database>(url, key);
}
