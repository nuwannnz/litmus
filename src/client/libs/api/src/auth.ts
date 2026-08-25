import type { LitmusSupabaseClient } from './client';

/**
 * The auth surface (S-4.1, realising FR-5) — thin async wrappers over
 * Supabase Auth, so `supabase-js` stays imported only inside `libs/api` and
 * the app programs against plain promises that reject with readable messages.
 *
 * Concurrency note (the second S-4.1 acceptance criterion): Supabase sessions
 * are per-device JWTs persisted by each client instance — signing in on one
 * device never invalidates another. There is no single-session model to opt
 * out of; nothing extra is required.
 */

/** The signed-in user, or null when no session exists. */
export type AuthAccount = {
  id: string;
  email: string | null;
  fullName: string | null;
};

function toAccount(
  id: string,
  email: string | null | undefined,
  meta: Record<string, unknown> | undefined,
): AuthAccount {
  const fullName = typeof meta?.full_name === 'string' ? meta.full_name : null;
  return { id, email: email ?? null, fullName };
}

/** Sign in with email and password (FR-5). Rejects with the server's message. */
export async function signIn(
  client: LitmusSupabaseClient,
  email: string,
  password: string,
): Promise<AuthAccount> {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Sign-in succeeded without a user — try again.');
  return toAccount(data.user.id, data.user.email, data.user.user_metadata);
}

/**
 * Register with email, password and a display name (FR-4). The name rides in
 * `user_metadata.full_name`, which is what the shell's avatar reads back.
 */
export async function signUp(
  client: LitmusSupabaseClient,
  input: { email: string; password: string; fullName: string },
): Promise<AuthAccount> {
  const { data, error } = await client.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { full_name: input.fullName } },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Registration succeeded without a user — try again.');
  return toAccount(data.user.id, data.user.email, data.user.user_metadata);
}

/** Sign out this device only — other devices keep their sessions. */
export async function signOut(client: LitmusSupabaseClient): Promise<void> {
  const { error } = await client.auth.signOut();
  if (error) throw new Error(error.message);
}

/** The current session's account, or null when signed out / still restoring. */
export async function getAccount(client: LitmusSupabaseClient): Promise<AuthAccount | null> {
  const {
    data: { session },
  } = await client.auth.getSession();
  const user = session?.user;
  if (!user) return null;
  return toAccount(user.id, user.email, user.user_metadata);
}

/**
 * Subscribe to every future session change — sign-ins, token refreshes,
 * sign-outs. Returns the unsubscribe function for effect cleanup.
 */
export function onAccountChange(
  client: LitmusSupabaseClient,
  listener: (account: AuthAccount | null) => void,
): () => void {
  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => {
    const user = session?.user;
    listener(user ? toAccount(user.id, user.email, user.user_metadata) : null);
  });
  return () => subscription.unsubscribe();
}
