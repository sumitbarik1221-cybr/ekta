# EKTA database setup (Supabase)

This project keeps its hand-written destination guides in `src/data`. Supabase stores account-specific and user-generated data: profiles, saved places, trip checklists, reviews, and hidden-gem ratings.

## Create the database

1. Create a Supabase project at [supabase.com/dashboard](https://supabase.com/dashboard) and keep its database password somewhere safe.
2. From this project folder, run `npx supabase login`, then `npx supabase link --project-ref YOUR_PROJECT_REF`.
3. Review `npx supabase migration list`, then run `npx supabase db push` to create the modular schema from the migrations below.
4. In **Table Editor**, confirm `profiles`, `saved_places`, `trip_checklists`, `reviews`, `gem_ratings`, and `auth_login_failures` exist.
5. Turn on the sign-in methods you intend to support under **Authentication → Sign In / Providers**. Private tables require a signed-in user; the frontend must use Supabase Auth before saving a user's data.

Schema changes are kept in feature-specific files in Supabase's standard `supabase/migrations/` layout. See [`supabase/MIGRATIONS.md`](supabase/MIGRATIONS.md) for the workflow and the reason this project uses a reconciled baseline.

## Tables

| Table | Purpose | Access |
|---|---|---|
| `profiles` | Display name tied to the Auth user UUID | Owner only |
| `saved_places` | A user's saved destination cards | Owner only |
| `trip_checklists` | One private checklist note per user | Owner only |
| `reviews` | User reviews with pending/approved/rejected moderation status | Owners manage their pending reviews; approved reviews are public |
| `gem_ratings` | One rating per user, destination, and hidden gem | Owner only in the current schema |

Only `reviews` currently has a moderation `status`. New moderation or approval behavior for gem ratings should be added as its own reviewed migration when the next app version requires it.

## App connection and keys

The web app needs the **Project URL** and **publishable key** (older projects may label this the `anon` key). These are intended for browser use when Row Level Security is enabled. Put them in local `.env` variables named `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; the app also accepts the older `VITE_SUPABASE_ANON_KEY` name. Do not commit `.env`.

Never put the `service_role` or secret key in a `VITE_` variable, browser bundle, or public repository. It bypasses Row Level Security and belongs only in a trusted server environment. The current schema does not require a service key for normal user reads and writes.

## Email registration and five-minute OTP

The app now has a modular sign-up/sign-in screen. Registration sends an email confirmation code; the user must enter it before the account is considered signed in. The auth state is exposed through `AuthProvider` / `useAuth()` so future screens can use the same session.

For a local Supabase CLI stack, [`supabase/config.toml`](supabase/config.toml) sets email confirmation on and the OTP lifetime to 300 seconds. For a hosted Supabase project, configure the project in its Dashboard before trying registration:

1. Under **Authentication → Sign In / Providers → Email**, enable email sign-ups and email confirmations.
2. Under **Authentication → Email Templates → Confirm signup**, use the OTP variable `{{ .Token }}` in the message. For example: `Your EKTA verification code is {{ .Token }}. It expires in 5 minutes.` The code-entry screen verifies this using Supabase Auth.
3. In the Email provider settings, set **Email OTP Expiration** to **300 seconds**. Supabase's setting is what enforces expiry; the app's five-minute countdown mirrors it. This setting also changes expiry for other email confirmation/recovery links.
4. Set **Email OTP Length** to 6 digits (the default) so it matches the app's code field.
5. Configure a custom SMTP provider before relying on real emails. Supabase's built-in email sender has strict development rate limits and is not intended for production delivery.

The local five-minute timer starts when the sign-up request succeeds. Each resend starts a fresh timer. Supabase Auth remains authoritative for whether a code is valid. If sign-in reports an unconfirmed email, the app opens the verification step so the user can request another code.

## Password reset with an email OTP

The sign-in page has a **Forgot password?** option. It sends a recovery code; the user must enter and verify that code before the new-password form appears. In **Authentication → Email Templates → Reset password**, use `{{ .Token }}` instead of `{{ .ConfirmationURL }}`. For example:

```html
<h2>Reset your password</h2>
<p>Enter this code in EKTA to verify your email and choose a new password:</p>
<p><strong>{{ .Token }}</strong></p>
<p>If you didn't request this, you can safely ignore this email.</p>
```

Keep **Email OTP Expiration** at 300 seconds and **Email OTP Length** at 6. The sign-up redirect allowlist is already needed for email confirmation; the recovery OTP is verified in the app with the `recovery` OTP type and does not rely on clicking an email link. Never put an admin or service-role key in the browser.

The forgot-password screen checks whether the address exists before requesting the recovery code, so it can show **This email is not registered. Sign up instead.** This intentionally reveals account existence, as requested. The lookup runs in the Node backend through the Auth Admin API; it is limited to 10 checks per IP per minute. For local development, add the project's `sb_secret_...` key as `SUPABASE_SECRET_KEY` in the root `.env` file (or use the legacy service-role key with the same variable), then run `npm run server` in one terminal and `npm run dev` in another. Keep this key server-only: never use a `VITE_` prefix or put it in frontend code. The production backend also needs `SUPABASE_SECRET_KEY` in its server environment.

## Failed sign-in lockout

Password sign-in goes through the `guarded-sign-in` Edge Function. It records a SHA-256 hash of the normalized email (not the email or password) in `public.auth_login_failures`. After the 51st failed password sign-in within a 24-hour window, further sign-in attempts for that email are blocked for 2 hours. A successful sign-in clears the counter. The lock is per email address, so someone deliberately entering wrong passwords for another person's known email could trigger the cooldown.

Apply pending migrations with `npx supabase db push`, then deploy the function:

```powershell
npx supabase functions deploy guarded-sign-in --project-ref YOUR_PROJECT_REF
```

The function uses Supabase's server-injected secret key for the private counter RPC and the project publishable/anon key for password authentication. The secret key must never be put in frontend code. Until the migration and function are deployed, password sign-in through this version of the app will report that sign-in protection is unavailable.

## Automatically remove expired unverified sign-ups

The Edge Function in [`supabase/functions/cleanup-unverified-users/index.ts`](supabase/functions/cleanup-unverified-users/index.ts) deletes only Auth users whose email is still unconfirmed and whose account is older than **48 hours**. The current hosted project has this function deployed and scheduled hourly, so an expired pending account is removed on the next run. A user can retry verification during that 48-hour window; after deletion they can sign up again with the same email.

This cleanup must be deployed and scheduled in the hosted Supabase project; merely running the local app does not install a server-side cleanup job. From the project folder, link the Supabase CLI to the same project and deploy the function:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy cleanup-unverified-users
```

Generate a private random token in PowerShell and set it as an Edge Function secret. Use this same token in the SQL schedule file; keep it out of the frontend and repository:

```powershell
$cleanupToken = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
npx supabase secrets set "CLEANUP_UNVERIFIED_TOKEN=$cleanupToken" --project-ref YOUR_PROJECT_REF
```

In **Database → Extensions**, enable `pg_cron`, `pg_net`, and Supabase Vault if they are not already enabled. In the SQL Editor, open [`supabase/schedules/cleanup_unverified_users.sql`](supabase/schedules/cleanup_unverified_users.sql), replace `YOUR_PROJECT_REF` and `REPLACE_WITH_CLEANUP_TOKEN` with your project ref and the generated token, then run the SQL once. Vault stores the scheduled request details, and Cron calls the protected function hourly. Check **Integrations → Cron** and the function logs after setup to confirm the job runs.

The function uses the Supabase project service credential only inside the Edge Function runtime. The browser app and scheduled SQL never receive that credential. Supabase Auth's admin deletion endpoint is server-only; the function does not expose it to users.

The auth files are `src/auth/AuthContext.jsx` (shared session and password recovery), `src/auth/AuthPage.jsx` (sign-in, registration, OTP verification, and password reset), and `src/lib/supabase.js` (configured client). Future pages can call `useAuth()`.

## Data shape notes for app/API work

- `saved_places.place_key` should be a stable normalized destination identifier (for example, a country-qualified slug), not a display name that can change. `name`, `state`, `latitude`, `longitude`, and `image_url` match the saved-card fields currently used by the app.
- `trip_checklists` stores one checklist note per Auth user. If the next version needs multi-trip structured itineraries, add a separate feature migration instead of overloading this table.
- Use the authenticated user's Supabase Auth UUID as `user_id`; never accept an arbitrary owner UUID from a form.
- RLS uses `auth.uid()` to bind private rows to the current session. Keep these policies enabled when connecting the client.
- EKTA editorial content, public map/geocoding results, and live weather are not copied into the database.

The current migration baseline reflects the live shared project's schema. Merge new API and frontend requirements as additive feature migrations; don't reuse an old `place_reviews`/`itineraries` schema or drop existing tables to make a new version fit.
