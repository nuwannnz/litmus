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

  constructor(
    private readonly table: string,
    private readonly config: FakeTableConfig | undefined,
    private readonly updates: Array<RecordedUpdate>,
    private readonly selects: Array<RecordedSelect>,
  ) {}

  select(): this {
    return this;
  }

  update(patch: Record<string, unknown>): this {
    this.patch = patch;
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
  /** Every completed `.select()` chain, in resolution order. */
  readonly $selects: Array<RecordedSelect>;
}

export interface MockClientOptions {
  tables?: Record<string, FakeTableConfig>;
}

/**
 * Build a mock client whose `from(table)` hands back a chain resolving with
 * the table's configured rows. The `$updates`/`$selects` records are what
 * specs assert on — most importantly `$updates[n].patch`, which must contain
 * only the changed fields (S-3.5).
 */
export function createMockSupabaseClient(options: MockClientOptions = {}): MockSupabaseClient {
  const updates: Array<RecordedUpdate> = [];
  const selects: Array<RecordedSelect> = [];

  const client = {
    from(table: string) {
      return new FakeBuilder(table, options.tables?.[table], updates, selects);
    },
    $updates: updates,
    $selects: selects,
  };

  return client as unknown as MockSupabaseClient;
}
