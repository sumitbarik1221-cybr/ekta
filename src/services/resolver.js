// Destination resolver — the one place that turns "what the user typed/picked" into a destination guide.
//
// Pipeline: alias lookup → geocode (country-restricted when an alias is known) → knowledge-record match
//           → Wikipedia context (verified against coordinates) → guide object.
// Attractions and weather load separately (see places.js / weather.js) so a slow API never blocks the page.
//
// Design rules:
//   * Every request carries a unique `key`; callers drop results whose key is no longer current.
//   * Nothing is defaulted to generic text. Missing information is represented as null / [] so the UI
//     can render an explicit "limited data" state.
import { lookupByQuery, lookupByGeocode, starterRecordFor, getParentRecord, getRecordById, normalizeName } from '../data/regions/index.js';
import { searchPlaces, pickBest, ZOOM_BY_KIND } from './geocode.js';
import { wikiSummary } from './wikipedia.js';
import { wikivoyageGuide } from './wikivoyage.js';
import { haversineKm } from './places.js';

export class DestinationNotFound extends Error { constructor(q) { super(`No place found for "${q}"`); this.name = 'DestinationNotFound'; } }
export class GeocoderUnavailable extends Error { constructor() { super('Place search is unavailable'); this.name = 'GeocoderUnavailable'; } }

let seq = 0;

const KIND_OF_RECORD = { country: 'country', state: 'region', 'union-territory': 'region', city: 'city' };

function geoFromRecord(record) {
  return { id: `record:${record.id}`, name: record.name, kind: KIND_OF_RECORD[record.type] || 'place', lat: record.center.lat, lon: record.center.lon,
    bbox: null, state: record.type === 'city' ? getParentRecord(record)?.name || null : null, city: null, country: record.country,
    countryCode: record.countryCode, displayName: `${record.name}, ${record.country}`, source: 'EKTA record (live geocoder unavailable)' };
}

async function pickWikiContext(geo, record, signal) {
  // Prefer the record's own canonical name — avoids "Bengal" → wrong article.
  const title = record && (record.scopeName || record.name) || geo.name;
  const w = await wikiSummary(title, { signal });
  if (!w) return null;
  // Coordinates check for point-like places: a same-named article on the other side of the world is rejected.
  if (w.coordinates && (geo.kind === 'city' || geo.kind === 'attraction' || geo.kind === 'place')) {
    if (haversineKm(w.coordinates, geo) > 60) return null;
  }
  return w;
}

/**
 * @param {{query?:string, suggestion?:object, signal?:AbortSignal}} input
 * @returns {Promise<object>} guide
 */
export async function resolveDestination({ query, suggestion, signal } = {}) {
  const key = ++seq;
  const typed = (query || suggestion?.name || '').trim();
  if (!typed) throw new DestinationNotFound('');

  // 1. Alias lookup (skipped when the user picked a specific suggestion — their pick is authoritative).
  const hint = suggestion ? null : lookupByQuery(typed);

  // 2. Geocode
  let geo = suggestion || null, geocoderDown = false;
  if (!geo) {
    try {
      // Exact alias (e.g. "Bengal") → use the record's canonical query so we never land in the wrong country.
      // Place alias (e.g. "Ranchi") → geocode what the user typed, but still restrict to the record's country.
      const exact = hint?.scope === 'exact';
      const results = await searchPlaces(exact ? hint.record.geocodeQuery : typed, { countryCode: hint?.record.countryCode, signal });
      geo = pickBest(results, exact ? hint.record.name : typed, { preferCountry: hint?.record.countryCode });
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      geocoderDown = true;
    }
  }
  if (!geo && hint?.scope === 'exact') geo = geoFromRecord(hint.record);   // keep working offline for known state/country/city records
  if (!geo) { if (geocoderDown) throw new GeocoderUnavailable(); throw new DestinationNotFound(typed); }

  // 3. Knowledge record
  let match = hint ? { record: hint.record, scope: hint.scope, ambiguity: hint.ambiguity } : lookupByGeocode(geo);
  if (match && match.record.type === 'country' && match.scope === 'parent') match = { ...match, scope: 'country' };
  // Guard against country mix-ups: a record may only describe a place in its own country.
  if (match && geo.countryCode && match.record.countryCode !== geo.countryCode && !geo.source.startsWith('EKTA')) match = null;

  let record = match?.record || null, scope = match?.scope || null;
  if (!record && geo.countryCode === 'in') {
    const starter = starterRecordFor(geo.state || '') || starterRecordFor(geo.name);
    // Starter notes describe a whole state, so they are used only when that state itself was searched.
    // A city inside it (e.g. Vrindavan) must not inherit them — it falls through to live sources instead.
    if (starter && normalizeName(starter.name) === normalizeName(geo.name)) { record = starter; scope = 'exact'; }
  }
  const parentRecord = record ? getParentRecord(record) : null;

  // 4. Wikipedia context
  const [wiki, voyage] = await Promise.all([pickWikiContext(geo, record && scope === 'exact' ? record : null, signal), wikivoyageGuide(record && scope === 'exact' ? record.name : geo.name, { signal })]);

  const title = record && scope === 'exact' ? record.name : geo.name;
  const subtitle = [geo.state && geo.state !== title ? geo.state : null, geo.country && geo.country !== title ? geo.country : null].filter(Boolean).join(', ');
  const zoom = record && scope === 'exact' && !geo.bbox ? (record.zoom || ZOOM_BY_KIND[geo.kind]) : ZOOM_BY_KIND[geo.kind] || 10;

  return {
    key, query: typed, title, subtitle, geo: { ...geo, name: title }, zoom,
    record, parentRecord, scope, ambiguity: match?.ambiguity || null,
    description: wiki?.description ? { text: wiki.description, source: { label: 'Wikipedia', url: wiki.pageUrl } } : (record?.summary ? { text: record.summary, source: { label: 'EKTA editorial record' } } : null),
    image: wiki?.image ? { url: wiki.image, credit: 'Wikipedia / Wikimedia Commons', pageUrl: wiki.pageUrl } : null,
    voyage, geocoderDown
  };
}

/** Compatibility adapter for older UI code that expects a flat "place" object. Fields are null/empty when unknown. */
export function toPlace(guide) {
  if (!guide) return null;
  const r = guide.record;
  return {
    name: guide.title, state: guide.subtitle || guide.geo.country || '', lat: guide.geo.lat, lon: guide.geo.lon,
    image: guide.image?.url || '', description: guide.description?.text || '',
    category: guide.geo.kind, guideKey: guide.key,
    best: r?.bestTime?.summary || '', customs: (r?.etiquette || []).slice(0, 2).join(' '), facts: (r?.stories || []).map(s => s.text),
    gems: (r?.attractions || []).map(a => a.name), food: (r?.dishes || []).map(d => d.name), budget: ''
  };
}

export { getRecordById };
