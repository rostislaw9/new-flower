#!/bin/bash
#
# Sync all production tables to local database.
#
# Usage:
#   ./scripts/sync-prod-to-local.sh          # uses .env for local DB
#   ./scripts/sync-prod-to-local.sh --dry-run # show what would be done without executing
#
# Requires: libpq (pg_dump, psql) on PATH
#   brew install libpq && export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
#
# Production DB URL should be set in PRODUCTION_DATABASE_URL env var,
# or a .env.production.local file in the project root.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

# --- Load production DB URL ---
PROD_URL=""
if [[ -n "${PRODUCTION_DATABASE_URL:-}" ]]; then
  PROD_URL="$PRODUCTION_DATABASE_URL"
elif [[ -f "$PROJECT_DIR/.env.production.local" ]]; then
  PROD_URL=$(grep '^PRODUCTION_DATABASE_URL=' "$PROJECT_DIR/.env.production.local" | sed 's/^PRODUCTION_DATABASE_URL=//' | tr -d '"' || true)
  if [[ -z "$PROD_URL" ]]; then
    PROD_URL=$(grep '^DATABASE_URL=' "$PROJECT_DIR/.env.production.local" | sed 's/^DATABASE_URL=//' | tr -d '"' || true)
  fi
fi

if [[ -z "$PROD_URL" ]]; then
  echo "ERROR: Set PRODUCTION_DATABASE_URL env var or create .env.production.local with DATABASE_URL"
  exit 1
fi

# --- Load local DB URL from .env ---
LOCAL_URL=$(grep '^DATABASE_URL=' "$PROJECT_DIR/.env" | sed 's/^DATABASE_URL=//' | tr -d '"')
if [[ -z "$LOCAL_URL" ]]; then
  echo "ERROR: Could not find DATABASE_URL in .env"
  exit 1
fi

# --- Tables in dependency order (parents before children) ---
TABLES=(
  "appointments"
  "gallery_items"
  "reviews"
  "about_bios"
  "about_bio_translations"
  "about_journeys"
  "about_journey_translations"
  "faq_groups"
  "faq_group_translations"
  "faq_questions"
  "faq_translations"
)

# --- Find pg_dump / psql ---
PG_DUMP=""
PSQL=""
for bin in pg_dump psql; do
  path=$(command -v "$bin" 2>/dev/null || true)
  if [[ -z "$path" ]]; then
    path="/opt/homebrew/opt/libpq/bin/$bin"
  fi
  if [[ ! -x "$path" ]]; then
    echo "ERROR: $bin not found. Install with: brew install libpq"
    exit 1
  fi
  if [[ "$bin" == "pg_dump" ]]; then
    PG_DUMP="$path"
  else
    PSQL="$path"
  fi
done

echo "Production: $(echo "$PROD_URL" | sed 's/:[^:@]*@/:***@/')"
echo "Local:      $(echo "$LOCAL_URL" | sed 's/:[^:@]*@/:***@/')"
echo "Tables:     ${TABLES[*]}"
echo ""

if $DRY_RUN; then
  echo "[DRY RUN] Would dump ${#TABLES[@]} tables from production and import to local."
  exit 0
fi

# --- Extract connection params from URL ---
parse_url() {
  local url="$1"
  # postgresql://user:pass@host:port/db
  local stripped="${url#postgresql://}"
  stripped="${stripped#postgres://}"
  local creds="${stripped%%@*}"
  local rest="${stripped#*@}"
  PG_USER="${creds%%:*}"
  PG_PASS="${creds#*:}"
  local hostport="${rest%%/*}"
  PG_HOST="${hostport%%:*}"
  local portpart="${hostport#*:}"
  PG_PORT="${portpart%%/*}"
  PG_DB="${rest#*/}"
}

parse_url "$PROD_URL"
PROD_USER="$PG_USER"
PROD_PASS="$PG_PASS"
PROD_HOST="$PG_HOST"
PROD_PORT="$PG_PORT"
PROD_DBNAME="$PG_DB"

parse_url "$LOCAL_URL"
LOCAL_USER="$PG_USER"
LOCAL_PASS="$PG_PASS"
LOCAL_HOST="$PG_HOST"
LOCAL_PORT="$PG_PORT"
LOCAL_DBNAME="$PG_DB"

DUMP_FILE="/tmp/prod_sync_dump.sql"

echo "Dumping from production..."
PGPASSWORD="$PROD_PASS" "$PG_DUMP" \
  --host="$PROD_HOST" \
  --port="$PROD_PORT" \
  --username="$PROD_USER" \
  --dbname="$PROD_DBNAME" \
  --data-only \
  --column-inserts \
  --no-owner \
  --no-privileges \
  $(printf -- '--table=public.%s ' "${TABLES[@]}") \
  -f "$DUMP_FILE"

echo "Dump saved to $DUMP_FILE"
echo ""

echo "Clearing local tables..."
for table in $(printf '%s\n' "${TABLES[@]}" | tail -r); do
  echo "  TRUNCATE $table CASCADE"
  PGPASSWORD="$LOCAL_PASS" "$PSQL" \
    --host="$LOCAL_HOST" \
    --port="$LOCAL_PORT" \
    --username="$LOCAL_USER" \
    --dbname="$LOCAL_DBNAME" \
    -c "TRUNCATE \"$table\" CASCADE;" 2>/dev/null || true
done

echo ""
echo "Importing to local..."
PGPASSWORD="$LOCAL_PASS" "$PSQL" \
  --host="$LOCAL_HOST" \
  --port="$LOCAL_PORT" \
  --username="$LOCAL_USER" \
  --dbname="$LOCAL_DBNAME" \
  -f "$DUMP_FILE" 2>&1 | grep -E "^(INSERT|ERROR)" | tail -5

echo ""
echo "Verifying row counts:"
for table in "${TABLES[@]}"; do
  count=$(PGPASSWORD="$LOCAL_PASS" "$PSQL" \
    --host="$LOCAL_HOST" \
    --port="$LOCAL_PORT" \
    --username="$LOCAL_USER" \
    --dbname="$LOCAL_DBNAME" \
    -t -c "SELECT count(*) FROM \"$table\";" 2>/dev/null | tr -d ' ')
  printf "  %-25s %s rows\n" "$table" "$count"
done

echo ""
echo "Done. Production data synced to local."
