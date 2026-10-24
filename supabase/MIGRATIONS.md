# Supabase migration workflow

The migration files are split by feature so changes can be reviewed and troubleshot independently:

- `20261023000000_core_profiles_and_saved_places.sql` — profiles and saved places.
- `20261023010000_community_reviews.sql` — moderated community reviews.
- `20261023020000_gem_ratings.sql` — gem ratings.
- `20261023030000_trip_checklists.sql` — per-user trip checklist.
- `20261024000000_auth_login_lockout.sql` — hashed-email failed-login tracking and lockout.
- `20261024010000_community_gem_suggestions_and_rating_summary.sql` — moderated hidden-gem suggestions and a read-only aggregate rating view.

The community-gem migration is additive. Apply it to the connected Supabase project before publishing the app update; it adds the suggestion table and an aggregate view while keeping the existing account, review, and rating tables intact.

The four `20261023...` files replace an older, un-applied migration that expected `place_reviews` and `itineraries` and assumed a `status` column on `gem_ratings`. The live project instead has `reviews`, `trip_checklists`, and a `gem_ratings` table without `status`. App data tables were empty when this baseline was reconciled; Auth accounts were preserved.

## Rules for future changes

1. Add one new timestamped migration per feature or schema change; do not edit a migration after it has been applied to a shared project.
2. Prefer additive `ALTER TABLE` changes and explicit backfills. Avoid dropping tables or columns as part of a routine deploy.
3. Enable RLS and add the table's policies in the same migration that creates the table.
4. Keep provider/API credentials in environment or Supabase secrets, never in SQL migrations or browser-visible code.
5. Link the CLI to the intended Supabase project, inspect `supabase migration list`, then use `supabase db push` to apply pending migrations. If a remote schema was created outside migrations, baseline it with `supabase migration repair` only after verifying that the SQL matches the live schema.

The local Supabase schema dump command currently requires Docker/Podman, which is not installed on this workstation. For now the baseline was built from read-only catalog inspection of the linked project's columns, constraints, indexes, RLS policies, and grants. Reconcile it with the incoming app version before adding new feature migrations.
