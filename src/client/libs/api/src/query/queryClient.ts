import { QueryClient } from '@tanstack/react-query';

/**
 * The app-wide TanStack Query client factory.
 *
 * Defaults chosen for a single-user app on real-time-capable backend:
 * short staleness keeps revisited screens instant without going stale mid-task;
 * window-focus refetch stays ON as the belt-and-braces sync path (Realtime
 * connections drop and phones suspend — architecture §5.3); one retry, because
 * PostgREST errors are rarely transient and the offline queue (EP-11) owns
 * replay semantics later.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: true,
      },
    },
  });
}
