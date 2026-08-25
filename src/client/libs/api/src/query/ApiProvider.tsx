import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { LitmusSupabaseClient } from '../client';
import { createQueryClient } from './queryClient';

const SupabaseContext = createContext<LitmusSupabaseClient | null>(null);

export interface ApiProviderProps {
  /** The app-wide Supabase client — usually `createSupabaseClient()`'s result. */
  supabase: LitmusSupabaseClient;
  /** Optional pre-built query client; tests pass their own for isolation. */
  queryClient?: QueryClient;
  children: ReactNode;
}

/**
 * The one provider the data layer needs: it hands every query hook and
 * mutation the Supabase client through context, so nothing imports a module
 * singleton and tests inject a mock at this boundary instead (architecture
 * §7.2).
 */
export function ApiProvider({ supabase, queryClient, children }: ApiProviderProps) {
  const defaultQueryClient = useMemo(() => createQueryClient(), []);
  return (
    <SupabaseContext.Provider value={supabase}>
      <QueryClientProvider client={queryClient ?? defaultQueryClient}>
        {children}
      </QueryClientProvider>
    </SupabaseContext.Provider>
  );
}

/** The Supabase client from context. Throws when used outside `ApiProvider`. */
export function useSupabase(): LitmusSupabaseClient {
  const supabase = useContext(SupabaseContext);
  if (!supabase) {
    throw new Error('useSupabase must be used inside <ApiProvider>.');
  }
  return supabase;
}
