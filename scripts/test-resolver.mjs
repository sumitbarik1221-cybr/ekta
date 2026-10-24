// Logic test for the destination resolver using a MOCKED network.
// It proves matching, scoping, country guards and state isolation — it does NOT prove the real
// Nominatim / Wikipedia / Open-Meteo / OpenTripMap services behave as mocked. Test those in a browser.
import { resolveDestination, toPlace, DestinationNotFound } from '../src/services/resolver.js';
import { mergeAttractions } from '../src/services/places.js';
import { generateItinerary } from '../src/services/itinerary.js';

const place = (name, lat, lon, cc, state, country, addresstype, extra = {}) => ({
  osm_type: 'relation', osm_id: Math.abs(hash(name)), lat: String(lat), lon: String(lon), name, addresstype, type: 'administrative',
  display_name: `${name}, ${country}`, boundingbox: [lat - 1, lat + 1, lon - 1, lon + 1].map(String),
  address: { state, country, country_code: cc, ...(addresstype === 'city' ? { city: name } : {}) }, ...extra });
function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }

const DB = {
  'west bengal, india': [place('West Bengal', 22.98, 87.85, 'in', 'West Bengal', 'India', 'state')],
  'kolkata, west bengal, india': [place('Kolkata', 22.57, 88.36, 'in', 'West Bengal', 'India', 'city')],
  'jharkhand, india': [place('Jharkhand', 23.61, 85.28, 'in', 'Jharkhand', 'India', 'state')],
  'delhi, india': [place('Delhi', 28.61, 77.21, 'in', 'Delhi', 'India', 'state')],
  'rajasthan, india': [place('Rajasthan', 27.02, 74.22, 'in', 'Rajasthan', 'India', 'state')],
  'kerala, india': [place('Kerala', 10.85, 76.27, 'in', 'Kerala', 'India', 'state')],
  'sikkim, india': [place('Sikkim', 27.53, 88.51, 'in', 'Sikkim', 'India', 'state')],
  'assam, india': [place('Assam', 26.2, 92.94, 'in', 'Assam', 'India', 'state')],
  'bangladesh': [place('Bangladesh', 23.69, 90.36, 'bd', null, 'Bangladesh', 'country')],
  'ranchi': [place('Ranchi', 23.34, 85.31, 'in', 'Jharkhand', 'India', 'city')],
  'dhaka': [place('Dhaka', 23.81, 90.41, 'bd', 'Dhaka Division', 'Bangladesh', 'city')],
  'siliguri': [place('Siliguri', 26.72, 88.43, 'in', 'West Bengal', 'India', 'city')],
  'tokyo': [place('Tokyo', 35.68, 139.69, 'jp', 'Tokyo', 'Japan', 'city')],
  'vrindavan': [place('Vrindavan', 27.58, 77.7, 'in', 'Uttar Pradesh', 'India', 'city')],
  'goa': [place('Goa', 15.3, 74.08, 'in', 'Goa', 'India', 'state')]
};
const calls = [];
globalThis.fetch = async (url) => {
  calls.push(String(url));
  const u = new URL(url);
  const ok = body => ({ ok: true, status: 200, json: async () => body });
  if (u.hostname === 'nominatim.openstreetmap.org') {
    const q = (u.searchParams.get('q') || '').toLowerCase();
    let rows = DB[q] || [];
    const cc = u.searchParams.get('countrycodes');
    if (cc) rows = rows.filter(r => r.address.country_code === cc);       // mimic the real filter
    return ok(rows);
  }
  if (u.hostname === 'en.wikipedia.org' && u.pathname.includes('/page/summary/')) {
    const title = decodeURIComponent(u.pathname.split('/').pop()).replace(/_/g, ' ');
    return ok({ type: 'standard', title, extract: `Wikipedia summary of ${title}.`, thumbnail: { source: `https://upload.example/${title}.jpg` }, content_urls: { desktop: { page: `https://en.wikipedia.org/wiki/${title}` } } });
  }
  if (u.hostname === 'en.wikivoyage.org') {
    const t = u.searchParams.get('titles');
    if (t !== 'Vrindavan') return ok({ query: { pages: { '-1': { title: t, missing: '' } } } });
    return ok({ query: { pages: { 1: { title: 'Vrindavan', extract: 'Intro.\n\n== Eat ==\nTry peda.\n\n== Respect ==\nRemove shoes in temples.' } } } });
  }
  return { ok: false, status: 404, json: async () => ({}) };
};

let pass = 0, fail = 0;
const t = (name, cond, extra = '') => { (cond ? pass++ : fail++); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`); };

const run = async q => resolveDestination({ query: q });

let g = await run('Bengal');
t('"Bengal" → West Bengal record (India)', g.record?.id === 'west-bengal' && g.geo.countryCode === 'in');
t('"Bengal" carries a disambiguation notice naming Bangladesh', g.ambiguity?.alternatives?.[0]?.id === 'bangladesh');
t('"Bengal" geocode was restricted to India (countrycodes=in)', calls.some(c => c.includes('countrycodes=in')));
t('"Bengal" Wikipedia context uses "West Bengal", not "Bengal"', g.description?.text.includes('West Bengal') && !g.description.text.includes('of Bengal.'));
t('West Bengal guide has ≥8 dishes, ≥8 attractions, ≥5 stories', g.record.dishes.length >= 8 && g.record.attractions.length >= 8 && g.record.stories.length >= 5, `${g.record.dishes.length}/${g.record.attractions.length}/${g.record.stories.length}`);
t('West Bengal every dish has description + diet field', g.record.dishes.every(d => d.description && d.diet));
const wbKey = g.key;

g = await run('West Bengal');
t('"West Bengal" → same record, no ambiguity notice', g.record.id === 'west-bengal' && !g.ambiguity);
t('Each resolve gets a fresh key (stale-result protection)', g.key !== wbKey);

g = await run('Kolkata');
t('"Kolkata" → city record with parent West Bengal', g.record.id === 'kolkata' && g.parentRecord?.id === 'west-bengal' && g.scope === 'exact');
t('Kolkata city dishes are flagged city-scoped', g.record.dishes.some(d => d.scope === 'city'));

g = await run('Bangladesh');
t('"Bangladesh" → Bangladesh record, India', g.record?.id === 'bangladesh' && g.geo.countryCode === 'bd');
t('Bangladesh shares no attractions/dishes ids with West Bengal', (() => { const wb = new Set(['kosha-mangsho', 'shorshe-ilish', 'mishti-doi']); return !g.record.dishes.some(d => wb.has(d.id)); })());
t('Bangladesh has no cost model (UI must show limited-data budget)', g.record.costs === null);

g = await run('Dhaka');
t('"Dhaka" → country-level Bangladesh context, not West Bengal', g.record?.id === 'bangladesh' && g.scope === 'country');

for (const [q, id] of [['Jharkhand', 'jharkhand'], ['Delhi', 'delhi'], ['Rajasthan', 'rajasthan'], ['Kerala', 'kerala'], ['Sikkim', 'sikkim'], ['Assam', 'assam']]) {
  g = await run(q);
  t(`"${q}" → ${id} record, exact scope`, g.record?.id === id && g.scope === 'exact' && g.title === g.record.name);
  t(`"${q}" guide coordinates come from geocoder`, Math.abs(g.geo.lat - DB[`${q.toLowerCase()}, india`][0].lat) < 1e-6);
}

g = await run('Ranchi');
t('"Ranchi" → Jharkhand data labelled as parent scope (not claimed as Ranchi-specific)', g.record?.id === 'jharkhand' && g.scope === 'parent' && g.title === 'Ranchi');
g = await run('Siliguri');
t('"Siliguri" → West Bengal parent scope', g.record?.id === 'west-bengal' && g.scope === 'parent');
g = await run('Goa');
t('"Goa" → starter tier (names only), never "full"', g.record?.tier === 'starter' && g.record.dishes.every(d => d.description === null));
g = await run('Tokyo');
t('"Tokyo" → no regional record; guide still resolves from live data', g.record === null && g.geo.countryCode === 'jp');
t('Tokyo guide does not inherit any Indian data', toPlace(g).food.length === 0 && toPlace(g).gems.length === 0 && toPlace(g).facts.length === 0);

g = await run('Vrindavan');
t('"Vrindavan" does NOT inherit Uttar Pradesh starter notes (no Taj Mahal story)', g.record === null && !JSON.stringify(toPlace(g)).includes('Taj'));
t('"Vrindavan" gets attributed Wikivoyage Respect/Eat sections instead', g.voyage?.sections.respect?.includes('shoes') && g.voyage.sections.eat && g.voyage.license.includes('CC BY-SA'));
g = await run('Tokyo');
t('Place with no Wikivoyage page → voyage is null, not invented', g.voyage === null);

let threw = null; try { await run('asdfqwer'); } catch (e) { threw = e; }
t('Unknown place → DestinationNotFound (no fake result)', threw instanceof DestinationNotFound);

// Geocoder outage: known records still resolve (from the record's own centre); unknown ones fail honestly.
const realFetch = globalThis.fetch;
globalThis.fetch = async () => { throw new TypeError('network down'); };
g = await run('Kerala');
t('Geocoder down: "Kerala" still resolves from record, flagged geocoderDown', g.record?.id === 'kerala' && g.geocoderDown === true);
threw = null; try { await run('Tokyo'); } catch (e) { threw = e; }
t('Geocoder down: "Tokyo" → GeocoderUnavailable (not a fake page)', threw?.name === 'GeocoderUnavailable');
globalThis.fetch = realFetch;

// Attractions merge
const m = mergeAttractions([{ name: 'Victoria Memorial', lat: 22.5448, lon: 88.3426 }], [{ name: 'Victoria Memorial', lat: 22.5449, lon: 88.3427, source: 'OpenTripMap' }, { name: 'Indian Museum', lat: 22.558, lon: 88.351, source: 'OpenTripMap' }]);
t('Attraction merge de-duplicates and keeps provenance', m.length === 2 && m[0].source === 'EKTA editorial record' && m[1].source === 'OpenTripMap');

// Itinerary validation
const wb = (await run('West Bengal'));
const bad = generateItinerary({ today: '2026-10-23', guide: wb, startDate: '2026-11-10', endDate: '2026-11-05', budget: 20000, travellers: 2, style: 'balanced', interests: ['Food'], pace: 'balanced' });
t('Itinerary: end before start is rejected', bad.error && !bad.days);
const good = generateItinerary({ today: '2026-10-23', guide: wb, startDate: '2026-11-10', endDate: '2026-11-14', budget: 40000, travellers: 2, style: 'balanced', interests: ['Food', 'History'], pace: 'balanced' });
t('Itinerary: 5 dates → 5 days, each with morning/afternoon/evening', good.days?.length === 5 && good.days.every(d => d.morning && d.afternoon && d.evening));
const names = good.days.flatMap(d => [d.morning, d.afternoon, d.evening].filter(s => s.kind === 'attraction').map(s => s.title));
t('Itinerary: no attraction repeated while unused ones remain', new Set(names).size === names.length);
const tight = generateItinerary({ today: '2026-10-23', guide: wb, startDate: '2026-11-10', endDate: '2026-11-14', budget: 3000, travellers: 2, style: 'balanced', interests: [], pace: 'balanced' });
t('Itinerary: unrealistic budget produces a warning', tight.warnings?.some(w => /below|unrealistic/i.test(w)));
const tk = generateItinerary({ today: '2026-10-23', guide: await run('Tokyo'), startDate: '2026-11-10', endDate: '2026-11-11', budget: 50000, travellers: 1, style: 'balanced', interests: [], pace: 'balanced' });
t('Itinerary: destination without records makes no invented activities', tk.days.every(d => [d.morning, d.afternoon, d.evening].every(s => s.kind === 'open')), tk.warnings?.[0] || '');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
