// Offline data validation: `npm run validate:data`
// Checks every regional record for schema problems, impossible coordinates, alias collisions and
// leftover generic placeholder text. Exits non-zero on failure so it can run in CI.
import { RECORDS, normalizeName } from '../src/data/regions/index.js';

const BANNED = [
  'check local season and weather', 'varies by travel style', 'local food information is not available yet',
  'discover the heritage and character of', 'respect local customs, ask before photographing people, and follow signs',
  'neighbourhood heritage walk', 'community-run experiences'
];
const BOX = { in: [6, 37.5, 68, 98], bd: [20.5, 26.7, 88, 92.8] };
const errors = [], warnings = [];
const err = (r, m) => errors.push(`[${r.id}] ${m}`);
const warn = (r, m) => warnings.push(`[${r.id}] ${m}`);

const seenAlias = new Map();
for (const r of RECORDS) {
  for (const k of ['id', 'type', 'tier', 'name', 'country', 'countryCode', 'geocodeQuery', 'summary', 'character', 'review']) if (!r[k]) err(r, `missing "${k}"`);
  if (!r.center || !Number.isFinite(r.center.lat) || !Number.isFinite(r.center.lon)) err(r, 'missing center');
  const box = BOX[r.countryCode];
  if (!box) err(r, `unknown countryCode ${r.countryCode}`);
  else {
    const inBox = (lat, lon) => lat >= box[0] && lat <= box[1] && lon >= box[2] && lon <= box[3];
    if (r.center && !inBox(r.center.lat, r.center.lon)) err(r, `center outside ${r.countryCode} bounds`);
    for (const a of r.attractions || []) {
      if (a.lat == null && a.lon == null) continue;
      if (!Number.isFinite(a.lat) || !Number.isFinite(a.lon)) err(r, `attraction "${a.name}" has a bad coordinate`);
      else if (!inBox(a.lat, a.lon)) err(r, `attraction "${a.name}" (${a.lat},${a.lon}) lies outside ${r.countryCode} bounds`);
    }
  }
  if (r.tier === 'full') {
    if ((r.stories || []).length < 5) err(r, 'needs at least 5 stories');
    if ((r.attractions || []).length < 8 && r.type !== 'country') err(r, 'needs at least 8 attractions');
    if ((r.dishes || []).length < 5) err(r, 'needs at least 5 dishes');
    else if (r.type === 'state' && r.dishes.length < 8) warn(r, `only ${r.dishes.length} dishes (target 8+ for states)`);
    if (!r.bestTime?.summary) err(r, 'missing bestTime');
    if (!(r.etiquette || []).length) err(r, 'missing etiquette');
    if (!(r.sources || []).length) err(r, 'missing sources');
    if (!r.costs) warn(r, 'no cost model — UI will show a limited-data state for budget');
  }
  const dishIds = new Set();
  for (const d of r.dishes || []) {
    if (!d.name || !d.id) err(r, 'dish missing name/id');
    if (dishIds.has(d.id)) err(r, `duplicate dish id ${d.id}`);
    dishIds.add(d.id);
    if (r.tier === 'full' && !d.description) err(r, `dish "${d.name}" has no description`);
    if (r.tier === 'full' && !d.diet) err(r, `dish "${d.name}" has no diet field (use "varies" when unsure)`);
    if (d.imageKind && !d.wikiTitle) err(r, `dish "${d.name}" has imageKind but no wikiTitle`);
    if (d.wikiTitle && !d.imageKind) err(r, `dish "${d.name}" has wikiTitle but no imageKind`);
  }
  const text = JSON.stringify(r).toLowerCase();
  for (const b of BANNED) if (text.includes(b)) err(r, `contains banned generic placeholder: "${b}"`);
  for (const a of [r.name, ...(r.aliases || [])]) {
    const k = normalizeName(a);
    if (seenAlias.has(k) && seenAlias.get(k) !== r.id) err(r, `alias "${a}" collides with ${seenAlias.get(k)}`);
    seenAlias.set(k, r.id);
  }
}

// Bengal / Bangladesh must never be conflated.
const wb = RECORDS.find(r => r.id === 'west-bengal'), bd = RECORDS.find(r => r.id === 'bangladesh');
if (wb && bd) {
  if (wb.countryCode === bd.countryCode) errors.push('[cross] West Bengal and Bangladesh share a countryCode');
  const bdNames = new Set(bd.attractions.map(a => a.name));
  for (const a of wb.attractions) if (bdNames.has(a.name)) errors.push(`[cross] attraction "${a.name}" appears in both West Bengal and Bangladesh`);
}

console.log(`Checked ${RECORDS.length} records: ${RECORDS.map(r => r.id).join(', ')}`);
for (const w of warnings) console.log('WARN ', w);
for (const e of errors) console.log('ERROR', e);
console.log(errors.length ? `\nFAILED with ${errors.length} error(s)` : `\nOK — 0 errors, ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
