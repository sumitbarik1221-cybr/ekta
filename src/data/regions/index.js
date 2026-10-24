// Regional knowledge registry.
//
// HOW TO ADD A DESTINATION
//   1. Create src/data/regions/<id>.js exporting a record (copy west-bengal.js or bangladesh.js).
//   2. Import it below and add it to RECORDS.
//   3. Run `npm run validate:data` — it checks the schema, coordinates and alias collisions.
// Nothing else in the app needs to change.
//
// COVERAGE IS PARTIAL ON PURPOSE. This registry holds hand-written records for a handful of
// destinations plus "starter" profiles for ~30 Indian states. Everything else is served from live
// APIs (geocoding, Wikipedia, weather, POIs) and the UI says so explicitly.
import { westBengal, kolkata } from './west-bengal.js';
import { jharkhand } from './jharkhand.js';
import { rajasthan } from './rajasthan.js';
import { kerala } from './kerala.js';
import { sikkim } from './sikkim.js';
import { assam } from './assam.js';
import { delhi } from './delhi.js';
import { bangladesh } from './bangladesh.js';
import { regionalProfiles } from '../starterProfiles.js';

export const RECORDS = [westBengal, kolkata, jharkhand, rajasthan, kerala, sikkim, assam, delhi, bangladesh];

export function normalizeName(value = '') {
  return String(value)
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .toLowerCase()
    .replace(/[’'`]/g, '')                              // apostrophes
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Search terms that are genuinely ambiguous. The primary reading is used, and the UI shows the others.
export const AMBIGUOUS = {
  bengal: {
    primary: 'west-bengal',
    alternatives: ['bangladesh'],
    message: '“Bengal” can mean the Indian state of West Bengal, the country of Bangladesh, or the wider historical region. EKTA is showing West Bengal (India). Bangladesh is a separate country.'
  }
};

// Alternate starter-profile names / state spellings (kept from the original app).
const STARTER_ALIASES = {
  bengal: 'west bengal', 'west bengal state': 'west bengal', orissa: 'odisha', uttaranchal: 'uttarakhand',
  pondicherry: 'puducherry', up: 'uttar pradesh', 'nct of delhi': 'delhi'
};

const byId = new Map(RECORDS.map(r => [r.id, r]));
const exactIndex = new Map();
const placeIndex = new Map();
for (const r of RECORDS) {
  for (const a of [r.name, ...(r.aliases || [])]) exactIndex.set(normalizeName(a), r.id);
  for (const a of r.placeAliases || []) if (!exactIndex.has(normalizeName(a))) placeIndex.set(normalizeName(a), r.id);
}

export const getRecordById = id => byId.get(id) || null;
export const getParentRecord = r => (r?.parentId ? byId.get(r.parentId) || null : null);

function titleCase(s) { return s.replace(/\b\w/g, c => c.toUpperCase()); }

// A "starter" record is built from the original editorial profiles: lists of names only.
// It deliberately contains NO descriptions, coordinates or sources so nothing is dressed up as more than it is.
export function starterRecordFor(name) {
  const key0 = normalizeName(name);
  const key = STARTER_ALIASES[key0] || key0;
  const p = regionalProfiles[key];
  if (!p) return null;
  return {
    id: `starter:${key}`, type: 'state', tier: 'starter', name: titleCase(key), country: 'India', countryCode: 'in',
    character: p.tag || null,
    bestTime: p.best ? { summary: p.best, seasons: [] } : null,
    budgetText: p.budget || null,
    stories: (p.facts || []).map(t => ({ title: null, text: t })),
    attractions: (p.gems || []).map(n => ({ name: n, kind: 'hidden gem', hidden: true })),
    dishes: (p.food || []).map(n => ({ id: normalizeName(n).replace(/ /g, '-'), name: n, scope: 'regional', diet: null, description: null, imageKind: null })),
    etiquette: [], festivals: [], sources: [], costs: null,
    review: { status: 'starter', note: 'Starter notes: names only, without descriptions or sources. They are a lead for research, not a verified guide.' }
  };
}

/** Match a typed query to a record: { record, scope, ambiguity } or null. */
export function lookupByQuery(query) {
  const q = normalizeName(query);
  if (!q) return null;
  const amb = AMBIGUOUS[q];
  if (amb) {
    return { record: byId.get(amb.primary), scope: 'exact',
      ambiguity: { message: amb.message, alternatives: amb.alternatives.map(id => byId.get(id)).filter(Boolean) } };
  }
  if (exactIndex.has(q)) return { record: byId.get(exactIndex.get(q)), scope: 'exact', ambiguity: null };
  if (placeIndex.has(q)) return { record: byId.get(placeIndex.get(q)), scope: 'parent', ambiguity: null };
  return null;
}

/**
 * Match a geocoder result to a record. `geo` is the normalised object from services/geocode.js:
 *   { name, kind, countryCode, state, country, city }
 * Returns { record, scope } where scope is 'exact' | 'parent' | 'country'.
 */
export function lookupByGeocode(geo) {
  if (!geo) return null;
  const nameKey = normalizeName(geo.name);
  const stateKey = normalizeName(geo.state || '');
  const cc = (geo.countryCode || '').toLowerCase();

  // Country-level: only exact matches, so a city in Bangladesh never inherits India’s data.
  if (cc === 'bd') {
    const bd = byId.get('bangladesh');
    return { record: bd, scope: geo.kind === 'country' ? 'exact' : 'country' };
  }
  if (cc !== 'in') return null;

  // The place itself has a record (state, UT or city).
  if (exactIndex.has(nameKey)) {
    const rec = byId.get(exactIndex.get(nameKey));
    // Guard: "Bengal"-like names must not jump countries.
    if (rec.countryCode === cc) return { record: rec, scope: 'exact' };
  }
  // The place is inside a state that has a record.
  const stateRec = exactIndex.has(stateKey) ? byId.get(exactIndex.get(stateKey)) : null;
  if (stateRec && stateRec.countryCode === 'in') return { record: stateRec, scope: 'parent' };
  if (placeIndex.has(nameKey)) return { record: byId.get(placeIndex.get(nameKey)), scope: 'parent' };
  return null;
}
