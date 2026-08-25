import type { LitmusSupabaseClient } from './client';

/**
 * Test double for `LitmusSupabaseClient` — the S-3.8 harness.
 *
 * Mocks at the **module boundary**, not at HTTP (architecture §7.2): a fake
 * PostgREST builder chain good enough for everything `libs/api` does today,
 * with no MSW and no wire format. Real database behaviour stays with pgTAP
 * (§7.3); this file only has to answer "what would supabase-js have sent, and
 * what comes back?".
 *
 * Import it from `@litmus/api/testing`, never from app code.
 */

/** A minimal stand-in for PostgREST's error payload. */
export interface FakePostgrestError {
  message: string;
  code: string;
  details: string | null;
  hint: string | null;
}

export interface FakeTableConfig {
  /** Rows a `.select()` resolves with. */
  rows?: unknown[];
  /** When set, any query against the table rejects with this instead. */
  error?: Partial<FakePostgrestError>;
}

export interface RecordedUpdate {
  table: string;
  /** Exactly what `.update()` was handed — partial-update discipline's proof. */
  patch: Record<string, unknown>;
  filters: Array<{ op: string; column: string; value: unknown }>;
}

export interface RecordedInsert {
  table: string;
  /** Exactly what `.insert()` was handed, session fields included. */
  row: Record<string, unknown>;
}

export interface RecordedSelect {
  table: string;
  filters: Array<{ op: string; column: string; value: unknown }>;
}

interface FilterCall {
  op: string;
  column: string;
  value: unknown;
}

class FakeBuilder {
  readonly filters: FilterCall[] = [];
  patch: Record<string, unknown> | undefined;
  row: Record<string, unknown> | undefined;

  constructor(
    private readonly table: string,
    private readonly config: FakeTableConfig | undefined,
    private readonly updates: Array<RecordedUpdate>,
    private readonly inserts: Array<RecordedInsert>,
    private readonly selects: Array<RecordedSelect>,
  ) {}

  select(): this {
    return this;
  }

  update(patch: Record<string, unknown>): this {
    this.patch = patch;
    return this;
  }

  insert(row: Record<string, unknown>): this {
    this.row = row;
    return this;
  }

  eq(column: string, value: unknown): this {
    this.filters.push({ op: 'eq', column, value });
    return this;
  }

  is(column: string, value: unknown): this {
    this.filters.push({ op: 'is', column, value });
    return this;
  }

  gte(column: string, value: unknown): this {
    this.filters.push({ op: 'gte', column, value });
    return this;
  }

  lte(column: string, value: unknown): this {
    this.filters.push({ op: 'lte', column, value });
    return this;
  }

  order(): this {
    // Ordering is the database's problem; nothing asserts on it yet.
    return this;
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?:
      ((value: { data: unknown[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    const flush = (): { data: unknown[]; error: null } => {
      if (this.patch !== undefined) {
        this.updates.push({
          table: this.table,
          patch: this.patch,
          filters: [...this.filters],
        });
      } else if (this.row !== undefined) {
        this.inserts.push({ table: this.table, row: this.row });
      } else {
        this.selects.push({ table: this.table, filters: [...this.filters] });
      }
      if (this.config?.error) {
        throw new Error(this.config.error.message ?? 'fake postgrest error');
      }
      return { data: this.config?.rows ?? [], error: null };
    };
    return Promise.resolve().then(flush).then(onfulfilled, onrejected);
  }
}

export interface MockSupabaseClient extends LitmusSupabaseClient {
  /** Every `.update()` flushed through the fake, in call order. */
  readonly $updates: Array<RecordedUpdate>;
  /** Every `.insert()` flushed through the fake, in call order. */
  readonly $inserts: Array<RecordedInsert>;
  /** Every completed `.select()` chain, in resolution order. */
  readonly $selects: Array<RecordedSelect>;
}

export interface MockAuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

export interface MockClientOptions {
  tables?: Record<string, FakeTableConfig>;
  /**
   * The signed-in user the fake auth service resolves with — set it when a
   * spec exercises a path that needs a session (RLS-scoped inserts, auth
   * wrappers).
   */
  user?: MockAuthUser | null;
  /** When set, every credential-bearing auth call rejects with this message. */
  authError?: string;
}

/**
 * Build a mock client whose `from(table)` hands back a chain resolving with
 * the table's configured rows. The `$updates`/`$inserts`/`$selects` records
 * are what specs assert on — most importantly `$updates[n].patch`, which must
 * contain only the changed fields (S-3.5).
 */
export function createMockSupabaseClient(options: MockClientOptions = {}): MockSupabaseClient {
  const updates: Array<RecordedUpdate> = [];
  const inserts: Array<RecordedInsert> = [];
  const selects: Array<RecordedSelect> = [];

  const user = options.user ?? null;
  const session = user ? { user } : null;
  const fail = () => (options.authError ? { message: options.authError } : null);

  const client = {
    from(table: string) {
      return new FakeBuilder(table, options.tables?.[table], updates, inserts, selects);
    },
    auth: {
      getUser: async () => ({
        data: { user },
        error: user ? null : { message: 'no session', status: 401 },
      }),
      getSession: async () => ({ data: { session }, error: null }),
      signInWithPassword: async (credentials: { email: string }) => ({
        data: { user: fail() ? null : { ...user, email: credentials.email, id: user?.id ?? 'u1' } },
        error: fail(),
      }),
      signUp: async (input: { email: string; options?: { data?: Record<string, unknown> } }) => ({
        data: {
          user: fail()
            ? null
            : {
                id: 'u-new',
                email: input.email,
                user_metadata: input.options?.data,
              },
        },
        error: fail(),
      }),
      signOut: async () => ({ error: fail() }),
      onAuthStateChange: (
        listener: (event: string, session: unknown) => void,
      ): { data: { subscription: { unsubscribe: () => void } } } => {
        void listener;
        return { data: { subscription: { unsubscribe: () => undefined } } };
      },
    },
    $updates: updates,
    $inserts: inserts,
    $selects: selects,
  };

  return client as unknown as MockSupabaseClient;
}
