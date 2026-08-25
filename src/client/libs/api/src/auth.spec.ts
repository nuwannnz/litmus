import { describe, expect, it } from 'vitest';

import { getAccount, signIn, signOut, signUp } from './auth';
import { createMockSupabaseClient } from './testing';

const user = { id: 'u1', email: 'jane@example.com', user_metadata: { full_name: 'Jane Doe' } };

describe('S-4.1 auth wrappers', () => {
  it('signIn resolves the account with its display name', async () => {
    const client = createMockSupabaseClient({ user });
    const account = await signIn(client, 'jane@example.com', 'pw');
    expect(account).toEqual({ id: 'u1', email: 'jane@example.com', fullName: 'Jane Doe' });
  });

  it('signIn rejects with the server message on bad credentials', async () => {
    const client = createMockSupabaseClient({ user: null, authError: 'Invalid login credentials' });
    await expect(signIn(client, 'jane@example.com', 'wrong')).rejects.toThrow(
      'Invalid login credentials',
    );
  });

  it('signUp carries the full name into user metadata (FR-4)', async () => {
    const client = createMockSupabaseClient({});
    const account = await signUp(client, {
      email: 'new@example.com',
      password: 'pw',
      fullName: 'New Person',
    });
    expect(account.fullName).toBe('New Person');
    expect(account.email).toBe('new@example.com');
  });

  it('signUp rejects with the server message when registration fails', async () => {
    const client = createMockSupabaseClient({ authError: 'User already registered' });
    await expect(
      signUp(client, { email: 'taken@example.com', password: 'pw', fullName: 'X' }),
    ).rejects.toThrow('User already registered');
  });

  it('getAccount resolves null without a session and the account with one', async () => {
    const signedOut = createMockSupabaseClient({ user: null });
    await expect(getAccount(signedOut)).resolves.toBeNull();

    const signedIn = createMockSupabaseClient({ user });
    await expect(getAccount(signedIn)).resolves.toEqual({
      id: 'u1',
      email: 'jane@example.com',
      fullName: 'Jane Doe',
    });
  });

  it('signOut resolves silently and surfaces server errors', async () => {
    const ok = createMockSupabaseClient({ user });
    await expect(signOut(ok)).resolves.toBeUndefined();

    const failing = createMockSupabaseClient({ user, authError: 'network down' });
    await expect(signOut(failing)).rejects.toThrow('network down');
  });
});
