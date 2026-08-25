#!/usr/bin/env bash
# Runs every pgTAP test in this directory against the local stack.
#
# Usage:
#   npx supabase stop   # optional, guarantees a clean state
#   npx supabase db reset
#   supabase/tests/run_tests.sh
#
# Requires the API database port (54322 by default, see [db] in
# supabase/config.toml) and psql on PATH. Tests run as the postgres
# superuser — they arrange fixtures directly and then drop to
# `authenticated`/`anon` roles to exercise RLS, exactly what a superuser
# connection is needed for.
set -euo pipefail

DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
here="$(cd "$(dirname "$0")" && pwd)"

failed=0
for test_file in "$here"/*_test.sql; do
  echo "== $(basename "$test_file")"
  if ! psql "$DB_URL" -v ON_ERROR_STOP=1 -q -f "$test_file"; then
    failed=1
    echo "== $(basename "$test_file") FAILED"
  fi
done

exit "$failed"
