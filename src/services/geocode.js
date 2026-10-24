// Global place identification via OpenStreetMap Nominatim (results) and Photon (suggestions).
// Both are public, key-less services with fair-use limits: EKTA debounces suggestions and only calls
// Nominatim when the user submits a search. For heavy traffic, self-host or use a commercial geocoder.
import { getJSON } from './http.js';
import { normalizeName } from '../data/regions/index.js';

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const PHOTON = 'https://photon.komoot.io/api';

// What kind of place is this? Drives the map zoom and what the guide claims about it.
export function classify(item) {
  const cls = item.class || item.category || '', type = item.type || '', at = item.addresstype || '';
  if (at === 'country' || type === 'country') return 'country';
  if (['state', 'province', 'region', 'state_district', 'county', 'union_territory'].includes(at) || ['state', 'administrative'].includes(type) && /^[2-6]$/.test(String(item.admin_level || '')) ) return 'region';
  if (['city', 'town', 'municipality', 'city_district', 'borough', 'suburb', 'village', 'hamlet'].includes(at) || ['city', 'town', 'village'].includes(type)) return 'city';
  if (['tourism', 'historic', 'natural', 'leisure', 'amenity', 'building', 'man_made', 'waterway'].includes(cls)) return 'attraction';
  return 'place';
}
export const ZOOM_BY_KIND = { country: 5, region: 7, city: 11, place: 12, attraction: 15 };

function normalizeNominatim(item) {
  const a = item.address || {};
  const kind = classify(item);
  const name = item.name || a[item.addresstype] || a.city || a.town || a.village || a.state || a.country || (item.display_name || '').split(',')[0];
  const [south, north, west, east] = (item.boundingbox || []).map(Number);
  return {
    id: `${item.osm_type || 'x'}:${item.osm_id || item.place_id}`,
    name, kind,
    lat: Number(item.lat), lon: Number(item.lon),
    bbox: Number.isFinite(south) ? { south, north, west, east } : null,
    state: a.state || a.region || a.state_district || null,
    city: a.city || a.town || a.village || null,
    country: a.country || null,
    countryCode: (a.country_code || '').toLowerCase(),
    displayName: item.display_name || name,
    source: 'OpenStreetMap Nominatim'
  };
}

/** Search for places. `countryCode` restricts results (used when an alias resolves to a known record). */
export async function searchPlaces(query, { countryCode, limit = 6, signal } = {}) {
  const q = new URLSearchParams({ format: 'jsonv2', addressdetails: '1', limit: String(limit), 'accept-language': 'en', q: query });
  if (countryCode) q.set('countrycodes', countryCode);
  const data = await getJSON(`${NOMINATIM}/search?${q}`, { signal });
  return (Array.isArray(data) ? data : []).filter(x => x.lat && x.lon).map(normalizeNominatim);
}

/**
 * Choose the best candidate. Ranking is deliberately conservative:
 * an exact name match beats administrative importance, and an explicit country filter is honoured.
 */
export function pickBest(candidates, query, { preferCountry } = {}) {
  if (!candidates.length) return null;
  const q = normalizeName(query);
  const score = c => {
    let s = 0;
    if (normalizeName(c.name) === q) s += 10;
    if (preferCountry && c.countryCode === preferCountry) s += 6;
    if (c.kind === 'region' || c.kind === 'country' || c.kind === 'city') s += 2;
    return s;
  };
  return [...candidates].sort((a, b) => score(b) - score(a))[0];
}

export async function reverseGeocode(lat, lon, { signal } = {}) {
  const data = await getJSON(`${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1&accept-language=en`, { signal });
  return data && !data.error ? normalizeNominatim(data) : null;
}

/** Autocomplete-style suggestions (Photon). Returns [] on any failure — suggestions are optional. */
export async function suggestPlaces(query, { signal, limit = 6 } = {}) {
  if (query.trim().length < 3) return [];
  try {
    const data = await getJSON(`${PHOTON}/?q=${encodeURIComponent(query)}&limit=${limit}&lang=en`, { signal, timeout: 6000 });
    const seen = new Set();
    return (data.features || []).map(f => {
      const p = f.properties || {}, [lon, lat] = f.geometry?.coordinates || [];
      const name = p.name || p.city || p.state || p.country;
      if (!name || lat == null) return null;
      const kind = p.type === 'country' ? 'country' : (p.type === 'state' || p.type === 'county') ? 'region' : ['city', 'district', 'locality'].includes(p.type) ? 'city' : ['tourism', 'historic', 'natural', 'leisure'].includes(p.osm_key) ? 'attraction' : 'place';
      const sub = [p.city && p.city !== name ? p.city : null, p.state && p.state !== name ? p.state : null, p.country && p.country !== name ? p.country : null].filter(Boolean).join(', ');
      const key = `${name}|${sub}`;
      if (seen.has(key)) return null; seen.add(key);
      return { id: `${p.osm_type || 'x'}:${p.osm_id}`, name, subtitle: sub, kind, lat, lon,
        state: p.state || null, city: p.city || null, country: p.country || null, countryCode: (p.countrycode || '').toLowerCase(),
        bbox: p.extent ? { west: p.extent[0], north: p.extent[1], east: p.extent[2], south: p.extent[3] } : null, displayName: [name, sub].filter(Boolean).join(', '), source: 'Photon (OpenStreetMap)' };
    }).filter(Boolean);
  } catch { return []; }
}
