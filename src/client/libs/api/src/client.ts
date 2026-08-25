import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * The Supabase client type the rest of the app programs against.
 *
 * Deliberately generic-free today: generated `database.types.ts` arrives in
 * S-3.2 and swaps in as `SupabaseClient<LitmusDatabase>` here — a one-line
 * change, because every consumer already goes through this alias.
 */
export type LitmusSupabaseClient = SupabaseClient;

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

  return createClient(url, key);
}
