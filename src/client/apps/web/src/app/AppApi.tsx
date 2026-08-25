import { useMemo, type ReactNode } from 'react';
import { ApiProvider, createSupabaseClient } from '@litmus/api';

/**
 * Mounts the data layer for everything under `/app`: one Supabase client,
 * created lazily so the landing and auth screens render even before
 * `VITE_SUPABASE_*` is set (a missing variable throws here, where it is
 * actually needed, rather than at module load).
 */
export function AppApi({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  return <ApiProvider supabase={supabase}>{children}</ApiProvider>;
}
