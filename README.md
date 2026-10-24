# EKTA — One India. Endless Journeys.

React + Vite tourism explorer with a destination-intelligence layer: live geocoding, attractions, weather and map, plus a regional knowledge layer for food, culture and heritage. Missing information is shown as an explicit "limited data" state — never as generic text.

## Quick start (Windows PowerShell)

```powershell
npm.cmd install
npm.cmd run check        # offline data validation + logic tests (no network needed)
npm.cmd run dev          # front end on http://localhost:5173
```

Extract the ZIP first. In File Explorer, open the extracted folder that contains `package.json`, type `powershell` in the address bar, and press Enter. Then run the commands above. The ZIP puts `package.json` at its top level, and `npm.cmd` avoids PowerShell's script-policy block on `npm.ps1`.

### Google Maps key (required for the map and live nearby places)

1. In Google Cloud, enable **Maps JavaScript API** and **Places API (New)**, create an API key, and enable billing.
2. In the extracted project folder, if `.env` does not exist, run `Copy-Item .env.example .env`. Then open `.env` and add `VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE` (replace `YOUR_KEY_HERE` with your key).
3. Restrict the key to **Websites** and authorize `http://localhost:5173/*` while developing. Under API restrictions, allow only Maps JavaScript API and Places API. Add your real website domain when you deploy.
4. Save `.env`, then restart the front end with `npm.cmd run dev`.

The Google key is used in the browser, so it is visible in page requests. Website/API restrictions protect it. Google requires billing and usage may be charged; set a quota and review the current [Google Maps pricing](https://developers.google.com/maps/billing-and-pricing/pricing).
Agra and Varanasi guide covers use destination-specific Wikimedia Commons photos instead of the unrelated article image. Photo credits link to the source pages: Agra by Davi1974d (CC BY-SA 3.0), Varanasi by Vimalinarc (CC BY 4.0).

AI backend (GroqCloud chatbot), in a second PowerShell window:

```powershell
Copy-Item .env.example .env     # only if .env does not already exist
# edit .env and add GROQ_API_KEY from https://console.groq.com/keys
npm.cmd run server              # API on http://localhost:8787 (Vite proxies /api to it in dev)
```

GroqCloud is preferred when `GROQ_API_KEY` is set. With **Search current web sources** selected, the assistant uses Groq's built-in browser search and displays citations when returned. These are AI research suggestions for human/admin review, not factual verification or approval. Groq free-tier rate limits apply. Existing Gemini settings remain available as a fallback when no Groq key is configured.

Production: `npm.cmd run build`, then `npm.cmd start` serves `dist/` and `/api` from one process.
Requires Node 20.12+ (the server reads `.env` with `process.loadEnvFile`).

## Configuration

| Variable | Where | Needed for | Without it |
|---|---|---|---|
| `GROQ_API_KEY` (+ optional `GROQ_MODEL`) | server only | Preferred Groq chatbot and optional browser search | Uses Gemini if configured; otherwise assistant falls back to a rules-based helper **labelled "Not from an AI model"** |
| `GEMINI_API_KEY` (+ optional `GEMINI_MODEL`) | server only | Optional chatbot fallback if Groq is not configured | Assistant falls back to a rules-based helper if Groq is also not configured |
| `ANTHROPIC_API_KEY` (+ optional `ANTHROPIC_MODEL`) | server only | Optional `/api/brief` source-organising endpoint | That endpoint reports not configured |
| `VITE_GOOGLE_MAPS_API_KEY` | browser | Google map + nearby Places | Map shows a setup message and live place results are omitted |
| `VITE_API_BASE_URL` | public | Hosting API on a different origin | Leave empty in dev |

Google Maps uses `VITE_GOOGLE_MAPS_API_KEY` in the browser. This key is visible to visitors, so restrict it in Google Cloud to your website referrers and the Maps JavaScript API + Places API (New). The chatbot uses `GROQ_API_KEY` on the server; never add it to a `VITE_` variable. The optional brief endpoint's Anthropic key also stays server-side. Destination search still uses Nominatim/Photon; weather uses Open-Meteo.

## Supabase authentication and database

Email sign-up, OTP confirmation, sign-in, and sign-out use the Supabase project configured by `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env`. These browser-safe values are required for auth; never put a Supabase service-role or secret key in a `VITE_` variable. Database tables and Row Level Security setup are documented in [SUPABASE_SETUP.md](SUPABASE_SETUP.md). Authentication is connected; saved places, notes, reviews, and ratings still use the app's current local/demo behavior and are not yet synchronized to those tables.

## How a destination page is built

`src/services/resolver.js` is the single entry point:

1. **Alias lookup** (`src/data/regions/index.js`): "Bengal", "West Bengal", "Kolkata", "Calcutta", "Bangladesh"… Ambiguous terms are resolved explicitly — "Bengal" → West Bengal (India) with a visible notice and a one-click switch to Bangladesh.
2. **Geocode** (Nominatim), restricted to the record's country when an alias is known, so West Bengal can never resolve to Bangladesh. Suggestions come from Photon.
3. **Record match**: exact (the place has its own record), `parent` (e.g. Ranchi → Jharkhand, labelled as state-wide info) or `country`.
4. **Wikipedia context**, rejected if its coordinates are far from the geocoded point.
5. Attractions (Google Places + Wikipedia geosearch + EKTA records, de-duplicated with provenance), weather (Open-Meteo) and the AI assistant load separately and are keyed to the current search, so switching destinations cannot show stale data.

Coverage tiers shown in the UI: **Detailed EKTA record** (9 records), **Starter notes** (~30 Indian states, names only, no descriptions/photos), **Live data only** (everything else in the world).

### Regional records included
West Bengal, Kolkata, Jharkhand, Rajasthan, Kerala, Sikkim, Assam, Delhi (full) and Bangladesh (basic: no cost model). They are **editorial**: written by the EKTA team from general public knowledge, with source links, and flagged as *not expert-reviewed*. Verify specifics (permits, dress codes, prices) with official sources.

### Add a destination
Create `src/data/regions/<id>.js` (copy `west-bengal.js`), register it in `src/data/regions/index.js`, run `npm run validate:data`. The validator checks required fields, coordinates inside the country, alias collisions, banned generic strings, and that Bengal and Bangladesh never share data.

### Food
Each dish carries description, typical diet label (`veg` / `non-veg` / `varies`), diet notes, and scope (`city`, `regional`, `shared`) so wide-region dishes are not presented as unique to one city. Photos are fetched at runtime **only** from the Wikipedia article named in the record; if there is none, or it fails, a plain "No verified photo" tile is shown. Photos of an ingredient are captioned as such.

## Places without an EKTA record (anywhere in the world)

For any destination EKTA has no hand-written record for, the guide pulls **Wikivoyage** (a global, community-written travel guide, CC BY-SA): *Respect*, *Eat*, *Stay safe* and *Understand* are shown as attributed excerpts with a link to the full page. Wikipedia supplies the description and photo. If neither has the information, the page says so.

An optional **"Organise these sources with AI"** button sends only that retrieved text to the backend (`/api/brief`), which must return short lists using nothing but those sources; the result is labelled *AI-organised*. The chat assistant (`/api/assistant`) also receives these excerpts as context. Accuracy therefore depends on Wikipedia/Wikivoyage coverage, which is strong for well-known places and thin for small ones — EKTA cannot guarantee correct information for every place on earth.

## Hidden gems and verification preview

The hidden-gem list has per-place map checkboxes (checked by default) and a separate **Show hidden gems** map layer (off by default). Enabling the layer looks up checked gems that lack coordinates through key-less Nominatim, one at a time with a delay. Results are kept in page state; a marker appears only when both controls allow it and a nearby coordinate is found. Hidden-gem pins are gold, while Google Places POIs are green. Hovering a marker opens its details; clicking selects it and zooms the map in. Nominatim may not know every place, so some gems can remain unpinned. Visitor star ratings can be entered without an account, but this prototype saves them only in the current browser; they are not shared or counted toward verification.

The destination budget card uses an EKTA record's cost model, its curated destination range, or a clearly labelled Uttar Pradesh starter-range estimate for Agra. These static indicative estimates need no AI or other API. Live, frequently updated prices would need a maintained data source or commercial service later.

Status labels are designed to use explicit evidence: an AI content screen can mark a listing **Possible location**, visitor evidence can mark it **User verified**, and admin approval is a separate blue/gold check. **Verified by all** requires all three. The initial user-verification rule is set to at least five ratings with a four-star average, and is a prototype default that still needs product confirmation. AI screening is not factual verification.

Place suggestions and written reviews are not yet stored in shared Supabase tables. The app has email authentication, but shared user-generated content, moderation, and admin approval need additional integration before they work across accounts.

## Features

**Implemented:** global search with suggestions and recent searches; alias/disambiguation; destination guide with sourced sections and limited-data states; food explorer with diet filter; map that fits the place, per-kind zoom, markers with popups, list↔map sync, "show my location" with denied-permission handling; live weather + 5-day forecast and advice derived only from live numbers; attractions from three sources; itinerary builder (date validation, morning/afternoon/evening, no repeats, budget warning, edit/regenerate/copy/print); budget estimator with transparent breakdown labelled "Estimate"; AI assistant behind a backend with loading/error/retry; saved places (localStorage); original curated cards and toolkit preserved.

**Partial:** Google Places returns up to 20 nearby tourist points for each destination search; broad country/state searches use a radius around the search centre, not a complete regional catalogue; itinerary travel time is straight-line distance only (no routing); budget model exists for 8 Indian records only; AI assistant is general Q&A, not a structured summariser; only some toolkit panels were updated (food, assistant, itinerary, budget, emergency).

**Pending:** syncing saved places and itineraries to Supabase; shared reviews and ratings; packing lists; accessibility data; restaurants/market listings; routing API; expert review of regional records; more regional records.

**Local-storage limits:** saved places, recents and notes currently live in this browser only — cleared with site data, not shared across devices. Supabase email accounts are available, but cloud synchronization for those items is a separate pending integration.

**Fair use:** Google Maps Platform requires an API key, enabled Maps JavaScript API and Places API (New), and billing. Usage can incur charges; review Google Maps pricing and set quotas/budget alerts. Destination search still relies on Nominatim and Photon public services with fair-use limits.

## Tests

- `npm run validate:data` — schema/coordinate/alias checks on all records.
- `npm run test:logic` — 40 assertions on the resolver, itinerary and merging with a **mocked network** (West Bengal, Kolkata, Jharkhand, Ranchi, Delhi, Rajasthan, Kerala, Sikkim, Assam, Bangladesh, Dhaka, Goa, Tokyo, failures).

These prove the matching and fallback logic. They do **not** prove the live services behave as mocked, nor visual layout. See the delivery notes for what was and was not run.





