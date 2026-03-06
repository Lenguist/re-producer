## Supabase: Connect, Migrations, and our Process

This document describes exactly how we connect to Supabase, apply migrations to Dev and Prod, and keep schemas in sync. It reflects the lessons learned in 2025-11-21 retro.

### Prerequisites
- Supabase CLI installed
  - Prefer a stable CLI. If `db pull` is needed, pin to a known-good version (e.g., 2.54.3). Otherwise, we can rely on `pg_dump` for schema snapshots.
- Postgres client tools v17
  - macOS: `brew install postgresql@17`
  - Ensure `pg_dump --version` shows 17.x and is first on PATH.
- Environment
  - `SUPABASE_DEV_DB_POOLER_URL`
  - `SUPABASE_PROD_DB_POOLER_URL`
  - These are Session Pooler URLs (IPv4-friendly). Use them for all CLI/psql work.

### One-time setup on a new machine
1) Login and link the project:
```
supabase login
supabase link
```

2) Verify connectivity and ledger visibility:
```
supabase migration list --db-url "$SUPABASE_DEV_DB_POOLER_URL"
supabase migration list --db-url "$SUPABASE_PROD_DB_POOLER_URL"
```

### Migration policy (mandatory)
- **CRITICAL: Always use 14-digit timestamps:** Format `YYYYMMDDHHMMSS_description.sql` (exactly 14 digits)
  - ✅ Good: `20251201033045_canonical_paper_model.sql` (actual time: 03:30:45), `20251201034500_fix_upsert.sql` (actual time: 03:45:00)
  - ❌ Bad: `20251201_canonical_paper_model.sql` (8 digits - CLI can't match reliably)
  - ❌ Bad: `2025120101_fix_upsert.sql` (10 digits - CLI can't match reliably)
- **CRITICAL: Use ACTUAL current datetime, NOT placeholders:**
  - ✅ Good: `20251202033045_add_title_normalization.sql` (actual time: Dec 2, 2025 at 03:30:45)
  - ❌ Bad: `20251202000000_add_title_normalization.sql` (midnight placeholder - will conflict if another migration uses same date)
  - ❌ Bad: `20251202003000_add_title_normalization.sql` (round hour placeholder - may conflict)
  - **Always run `date +"%Y%m%d%H%M%S"` to get the current timestamp before creating a migration file**
  - **Never use `000000` or other placeholder values for the time portion**
  - Use hours/minutes/seconds to create unique timestamps for multiple migrations per day
  - Even for the first migration of the day, use the actual current time, not `000000`
- Do not keep "short" duplicates (e.g., `20251116_*`) if the 14-digit versions exist.
- Write idempotent SQL where possible (especially for Storage policies) using guarded `DO $$ BEGIN ... END $$;`.
- Never apply manual SQL directly in Prod without reconciling the migration ledger via `supabase migration repair`.
- RLS + GRANTs: always add base privileges (SELECT/INSERT/UPDATE/DELETE) alongside RLS policies for roles like `authenticated`.

### Normal workflow
1) **Get current timestamp first:**
   ```bash
   date +"%Y%m%d%H%M%S"
   ```
   This will output something like `20251202033045` - use this EXACT value.

2) Create a new migration file in `supabase/migrations/` with **14-digit timestamp format**: `YYYYMMDDHHMMSS_description.sql`
   - Example: `20251202033045_add_title_normalization.sql` (using the actual timestamp from step 1)
   - ❌ **NEVER use placeholder times like `000000` or `030000`** - these will cause conflicts
   - ✅ **ALWAYS use the actual current time** from `date +"%Y%m%d%H%M%S"`
   - Always use full 14-digit timestamp with actual hours/minutes/seconds
   - Use hours/minutes/seconds to create unique timestamps for multiple migrations per day

2) Apply to Dev:
```
supabase migration up --db-url "$SUPABASE_DEV_DB_POOLER_URL"
```
If CLI asks to `--include-all`, re-run with that flag.

3) **CRITICAL: Verify migration matching:**
```
supabase migration list --db-url "$SUPABASE_DEV_DB_POOLER_URL"
```
**Check that your new migration shows in BOTH "Local" and "Remote" columns.** If it only shows in one column, the CLI can't match it - fix this before proceeding (see "If migration matching fails" below).

4) Update Dev schema snapshot (pure Postgres, no shadow DB):
```
pg_dump --schema-only --no-owner --no-privileges \
  "$SUPABASE_DEV_DB_POOLER_URL" > supabase/schema/dev_schema.sql
```
Review changes:
```
git diff supabase/schema/dev_schema.sql
```

5) Promote to Prod:
```
supabase migration up --db-url "$SUPABASE_PROD_DB_POOLER_URL"
```

6) **CRITICAL: Verify Prod migration matching:**
```
supabase migration list --db-url "$SUPABASE_PROD_DB_POOLER_URL"
```
**Check that your new migration shows in BOTH "Local" and "Remote" columns.** If unmatched, fix before proceeding.

7) Update Prod schema snapshot:
```
pg_dump --schema-only --no-owner --no-privileges \
  "$SUPABASE_PROD_DB_POOLER_URL" > supabase/schema/prod_schema.sql
```

8) **CRITICAL: Compare Dev and Prod schemas:**
```
# Check key differences (constraints, indexes, foreign keys)
grep -A 2 "user_papers.*UNIQUE" supabase/schema/dev_schema.sql supabase/schema/prod_schema.sql
grep -A 2 "papers_openalex_id_unique" supabase/schema/dev_schema.sql supabase/schema/prod_schema.sql
```
Verify that both schemas have the same constraints, indexes, and foreign keys. If they differ, the migration may not have been applied correctly to Prod (see "If migration is in ledger but not applied" below).

9) Commit everything together:
```
git add supabase/migrations/YYYYMMDDHHMMSS_description.sql
git add supabase/schema/dev_schema.sql
git add supabase/schema/prod_schema.sql
git commit -m "Migration: description"
```

### Keeping schemas in Git
- We commit:
  - `supabase/migrations/*` (the canonical change history)
  - `supabase/snapshots/<the one auto-generated baseline>.sql` (never edited)
  - `supabase/schema/dev_schema.sql` and `supabase/schema/prod_schema.sql` (our readable snapshots for AI/diffs)
- Do not place our own dumps in `supabase/snapshots/`.

### When db pull is required
`db pull` can fail on some CLI versions due to shadow DB + Storage issues. Options:
- Prefer snapshots via `pg_dump` (recommended).
- Or pin CLI to a working version (e.g., Docker):
```
docker run --rm -v $(pwd):/workspace -w /workspace \
  supabase/cli:2.54.3 db pull --db-url "$SUPABASE_DEV_DB_POOLER_URL"
```
- Or restrict to schemas to avoid Storage (if supported by your CLI version):
```
supabase db pull --db-url "$SUPABASE_DEV_DB_POOLER_URL" --schema public
```

### If migration matching fails

**Symptom:** `supabase migration list` shows a migration in "Remote" column but not in "Local", or vice versa.

**Diagnosis:**
1. Check what's in the remote ledger:
```
psql "$SUPABASE_DEV_DB_POOLER_URL" -c "SELECT version, name FROM supabase_migrations.schema_migrations WHERE version = 'YYYYMMDDHHMMSS';"
```
2. Verify local file exists and uses **14-digit timestamp format**: `YYYYMMDDHHMMSS_description.sql`
3. Check if filename matches ledger name (CLI extracts name as everything after first underscore)

**Fix options:**
1. **If migration file uses short timestamp (8 or 10 digits):**
   - Get current timestamp: `date +"%Y%m%d%H%M%S"`
   - Rename file to use 14-digit timestamp with ACTUAL time: `mv 20251201_*.sql 20251202033045_*.sql` (use actual timestamp, not `000000`)
   - Update remote ledger:
     ```
     psql "$SUPABASE_DEV_DB_POOLER_URL" -c "DELETE FROM supabase_migrations.schema_migrations WHERE version = 'OLD_VERSION';"
     psql "$SUPABASE_DEV_DB_POOLER_URL" -c "INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('YYYYMMDDHHMMSS');"
     ```
   - Repeat for Prod if needed
   - Re-verify: `supabase migration list --db-url "$SUPABASE_DEV_DB_POOLER_URL"`

1b. **If you get "duplicate key value violates unique constraint" error:**
   - This means another migration already uses the same timestamp
   - Check existing migrations: `ls -1 supabase/migrations/ | grep YYYYMMDD`
   - Get a NEW unique timestamp: `date +"%Y%m%d%H%M%S"`
   - Rename your migration file to use the new timestamp
   - Re-run the migration command

2. **If migration is applied but CLI can't match (14-digit timestamp already):**
   - Try repair: `supabase migration repair --db-url "$SUPABASE_DEV_DB_POOLER_URL" --status applied YYYYMMDDHHMMSS`
   - If still failing, this may be a CLI bug - document and continue (migration is working, just CLI tracking is broken)

3. **If migration file doesn't match ledger name:**
   - Rename file to match ledger entry name exactly
   - Or use `supabase migration repair` to update ledger entry

**Prevention:**
- **ALWAYS run `date +"%Y%m%d%H%M%S"` first to get the actual current timestamp**
- **NEVER use placeholder times like `000000`, `030000`, etc.** - these cause duplicate key errors
- Always use 14-digit timestamps (`YYYYMMDDHHMMSS_*`) with actual current time from the start
- Verify matching immediately after applying each migration
- Don't proceed to next migration until current one shows as matched
- Don't promote to Prod until Dev migration is matched

### If migration is in ledger but not actually applied

**Symptom:** Migration shows as applied in `supabase migration list`, but schema changes are missing when comparing dev/prod schemas.

**Diagnosis:**
1. Compare dev and prod schema snapshots:
```
grep -A 2 "user_papers.*UNIQUE" supabase/schema/dev_schema.sql supabase/schema/prod_schema.sql
grep -A 2 "papers_openalex_id_unique" supabase/schema/dev_schema.sql supabase/schema/prod_schema.sql
```
2. If schemas differ, the migration SQL was likely never executed (only ledger entry was created)

**Fix:**
1. Apply migration SQL directly (since ledger already shows it as applied):
```
psql "$SUPABASE_PROD_DB_POOLER_URL" -f supabase/migrations/YYYYMMDDHHMMSS_description.sql
```
2. Re-dump schema and verify changes are present:
```
pg_dump --schema-only --no-owner --no-privileges \
  "$SUPABASE_PROD_DB_POOLER_URL" > supabase/schema/prod_schema.sql
```
3. Compare schemas again to confirm they match

**Prevention:**
- Always compare dev/prod schemas after promoting migrations
- Don't trust ledger entries alone - verify actual schema changes
- Use schema snapshots to catch missing migrations early

### Repairing the migration ledger (only if needed)
- If remote ledger and local files diverge (e.g., duplicate IDs), reconcile:
  - Decide the canonical IDs (we use suffixed).
  - Mark non-canonical short IDs as reverted:
```
supabase migration repair --db-url "$SUPABASE_DEV_DB_POOLER_URL"  --status reverted 20251116 20251118
supabase migration repair --db-url "$SUPABASE_PROD_DB_POOLER_URL" --status reverted 20251116 20251118
```
  - Ensure canonical suffixed IDs are applied (one-by-one if needed):
```
supabase migration repair --db-url "$SUPABASE_DEV_DB_POOLER_URL"  --status applied 2025111601
supabase migration repair --db-url "$SUPABASE_DEV_DB_POOLER_URL"  --status applied 2025111801
supabase migration repair --db-url "$SUPABASE_DEV_DB_POOLER_URL"  --status applied 2025111802
supabase migration repair --db-url "$SUPABASE_DEV_DB_POOLER_URL"  --status applied 2025111803

supabase migration repair --db-url "$SUPABASE_PROD_DB_POOLER_URL" --status applied 2025111601
supabase migration repair --db-url "$SUPABASE_PROD_DB_POOLER_URL" --status applied 2025111801
supabase migration repair --db-url "$SUPABASE_PROD_DB_POOLER_URL" --status applied 2025111802
supabase migration repair --db-url "$SUPABASE_PROD_DB_POOLER_URL" --status applied 2025111803
```
  - Remove any local ghost files (short IDs) so local folder exactly matches the remote ledger.
  - Re-verify:
```
supabase migration list --db-url "$SUPABASE_DEV_DB_POOLER_URL"
supabase migration list --db-url "$SUPABASE_PROD_DB_POOLER_URL"
```

### Grants + RLS checklist
- For every table accessed by `authenticated`:
  - Add base GRANTs, e.g.:
    - `GRANT SELECT ON TABLE public.my_table TO authenticated;`
    - `GRANT INSERT, UPDATE, DELETE ON TABLE public.my_table TO authenticated;`
  - Define RLS policies that enforce per-user constraints.
- If you see 42501 (insufficient_privilege), check GRANTs first, then RLS.

### Connection notes
- Always use Session Pooler URLs for CLI/psql to avoid IPv6 issues and to benefit from pooled connections.
- Example:
```
psql "$SUPABASE_DEV_DB_POOLER_URL"   -c '\dt'
psql "$SUPABASE_PROD_DB_POOLER_URL"  -c '\dt'
```

### TL;DR
- **Migrations: Always use 14-digit timestamps** (`YYYYMMDDHHMMSS_description.sql`) with **ACTUAL current time**.
  - **CRITICAL:** Run `date +"%Y%m%d%H%M%S"` first, then use that exact timestamp
  - **NEVER use placeholders like `000000` or `030000`** - these cause duplicate key errors
- **Workflow:** Get timestamp → Create → Apply → **Verify matching** → Dump schema → Prod → **Verify matching** → Dump schema → **Compare schemas** → Commit.
- **Critical:** After applying each migration, verify it shows in BOTH Local and Remote columns before proceeding.
- **Critical:** After promoting to Prod, compare dev/prod schemas to ensure migration was actually applied.
- Use pg_dump snapshots for reliability.
- Keep schemas in Git for visibility and AI context.
- Pooler URLs for everything.
- GRANTs + RLS, not RLS alone.

### Related documentation
- `documentation/retros/supabase-issues-2025-11-21.md` - Previous migration issues and fixes
- `documentation/retros/supabase-migration-mismatch-2025-12-01.md` - CLI matching issues and prevention

### Shared database with paperfan — DO NOT use `supabase migration up` here

re:producer shares the same Supabase DEV project as paperfan (`/Users/mbondarenko/Desktop/paperfan`). It reads paperfan's `papers` table and adds its own tables (`repro_scores`, `repro_runs`).

**Do NOT use `supabase migration up` from this directory.** The CLI sees all of paperfan's remote migrations as missing locally and refuses to run. Running `migration repair` to fix it would corrupt the shared ledger and break paperfan.

**Instead, apply migrations directly with psql:**
```bash
# Apply a new migration
psql "$SUPABASE_DEV_DB_POOLER_URL" -f supabase/migrations/TIMESTAMP_description.sql

# Verify the tables exist
psql "$SUPABASE_DEV_DB_POOLER_URL" -c "\dt repro_*"
```

Still follow the 14-digit timestamp naming convention (`date +"%Y%m%d%H%M%S"`) and keep files in `supabase/migrations/`. They're just applied manually instead of via CLI.

**If you ever want CLI-managed migrations:** copy all paperfan migration files into this repo's `supabase/migrations/`. The CLI will then see matching local+remote history and work normally. Keep both repos in sync going forward when paperfan adds migrations.

### Troubleshooting: Pooler Connection Limits

If you encounter connection timeouts or "failed to connect" errors when using the pooler URL (especially with `supabase migration list` or `supabase db pull`), you may have hit Supabase's connection rate limits and your IP has been temporarily banned.

**Solution:**
1. Go to the Supabase Dashboard
2. Navigate to: **Database** → **Settings** → **Networks** → **Bans**
3. Find your IP address in the banned list
4. Click **Unban** to remove the restriction

After unbanning, wait a few moments and retry your command. If issues persist, try using the direct connection URL instead of the pooler URL as a temporary workaround.


