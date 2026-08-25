import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getAccount,
  onAccountChange,
  signIn as apiSignIn,
  signOut as apiSignOut,
  signUp as apiSignUp,
  useSupabase,
} from '@litmus/api';

/**
 * S-4.1 — real sessions over Supabase Auth. The fake localStorage session is
 * gone: the session is Supabase's JWT pair, persisted per device by the
 * client library itself, so signing in on one device never ends another's
 * session. `initializing` covers the restore-from-storage moment before the
 * first session read resolves.
 */

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
}

interface AuthValue {
  user: AuthUser | null;
  /** True until the initial session lookup settles — gates route guards. */
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'U';

function toUser(account: { email: string | null; fullName: string | null }): AuthUser {
  const fallback = account.email?.split('@')[0] ?? 'Account';
  const name = account.fullName ?? fallback;
  return { name, email: account.email ?? '', initials: initials(name) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabase();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Restore any persisted session once, then follow every future change —
  // sign-ins elsewhere in this tab, token refreshes, sign-outs.
  useEffect(() => {
    let active = true;
    void getAccount(supabase)
      .then((account) => {
        if (active) setUser(account ? toUser(account) : null);
      })
      .finally(() => {
        if (active) setInitializing(false);
      });
    const unsubscribe = onAccountChange(supabase, (account) =>
      setUser(account ? toUser(account) : null),
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setUser(toUser(await apiSignIn(supabase, email, password)));
    },
    [supabase],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      setUser(toUser(await apiSignUp(supabase, { fullName: name, email, password })));
    },
    [supabase],
  );

  const signOut = useCallback(async () => apiSignOut(supabase), [supabase]);

  const value = useMemo(
    () => ({ user, initializing, signIn, signUp, signOut }),
    [user, initializing, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>');
  return ctx;
}
