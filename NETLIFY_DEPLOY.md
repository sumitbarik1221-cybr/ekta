# Netlify deployment notes

This project builds the browser app as a static Vite site and runs its existing `/api/*` backend routes as Netlify Functions. The local Node server remains available through `npm run server`.

## Repository and site setup

1. Create a **private** GitHub repository and push this project to it. Do not upload `.env`; it is ignored by `.gitignore`.
2. In Netlify, choose **Add new site → Import an existing project**, connect that repository, and select the production branch.
3. Netlify reads the build command (`npm run build`), publish directory (`dist`), and functions directory (`netlify/functions`) from `netlify.toml`.
4. Add the environment variables below in the Netlify site’s environment-variable settings. Set their scopes so browser `VITE_...` values are available to the build, and private API credentials are available to Functions. Do not put private credentials in `netlify.toml`, `VITE_...` variables, or committed files.
5. Deploy, then add the final site URL to Supabase Authentication → URL Configuration as the Site URL and an allowed redirect URL. Keep `http://localhost:5173/**` for local development.

## Environment variables

### Browser build settings

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Public/publishable key used by the browser. Never use a secret/service-role key here. |
| `VITE_GOOGLE_MAPS_API_KEY` | No for this release | Leave unset until the key from the other version is available; map features that need it will remain unavailable. |
| `VITE_API_BASE_URL` | No | Leave unset/blank so browser requests use this same site’s `/api/...` functions. |

### Private Function settings

| Variable | Required | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | Yes for password-reset account lookup | Same project URL; server-side setting. |
| `SUPABASE_SECRET_KEY` | Yes for password-reset account lookup | Secret key for Supabase Auth Admin lookup. Keep private and never prefix with `VITE_`. |
| `GROQ_API_KEY` | Yes for the current AI assistant | Private Groq API credential. |
| `GROQ_MODEL` | No | Defaults to `openai/gpt-oss-120b`. |
| `GEMINI_API_KEY` | No | Optional assistant fallback; leave unset if unused. |
| `GEMINI_MODEL` | No | Defaults to `gemini-3.8-flash`. |
| `ANTHROPIC_API_KEY` | No | Enables the optional destination brief endpoint; leave unset if unused. |
| `ANTHROPIC_MODEL` | No | Used only when Anthropic is configured. |

Set Function credentials in Netlify’s UI, not in a repository file. This project deliberately does not include any API values in the deployment configuration.

## After first deploy

- Confirm the home page loads and the browser console has no missing Supabase configuration errors.
- Check `https://YOUR-SITE/api/health`. It reports whether the assistant and brief integrations are configured; it does not reveal credentials.
- Test signup confirmation, password reset code delivery, and sign-in. The “email not registered” lookup requires `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in Function settings.
- Test the assistant after adding `GROQ_API_KEY`. Map services can stay unavailable until `VITE_GOOGLE_MAPS_API_KEY` is supplied.
- Keep using Supabase for its Auth Edge Functions and database cleanup schedule; Netlify does not replace those deployed Supabase resources.

Netlify Functions use the project’s shared backend handlers. The account-lookup and AI endpoints also have per-IP limits configured in the function routing. The application’s failed-login lockout and unverified-account cleanup remain handled by the already-deployed Supabase Edge Functions, migrations, and schedule.
