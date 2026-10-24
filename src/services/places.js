// Nearby tourist POIs from Google Places API (New), plus keyless Wikipedia context.
// Google Maps/Places data is loaded live and is not persisted into EKTA's editorial records.
import { wikiNearby } from './wikipedia.js';
import { normalizeName } from '../data/regions/index.js';
import { loadGoogleMaps } from './googleMaps.js';

const PLACE_TYPES = ['tourist_attraction', 'museum', 'park', 'art_gallery', 'zoo', 'aquarium', 'hindu_temple', 'mosque', 'church', 'restaurant', 'cafe', 'bakery'];

export async function fetchGooglePlaces({ lat, lon, kind, signal }) {
  if (signal?.aborted) return { status: 'unavailable', items: [] };
  try {
    const maps = await loadGoogleMaps();
    if (signal?.aborted) return { status: 'unavailable', items: [] };
    const { Place } = maps.places;
    const radius = kind === 'attraction' ? 5000 : kind === 'city' ? 10000 : 25000;
    const { places = [] } = await Place.searchNearby({
      fields: ['displayName', 'location', 'primaryType', 'formattedAddress', 'googleMapsURI', 'rating', 'userRatingCount'],
      locationRestriction: { center: { lat, lng: lon }, radius },
      includedPrimaryTypes: PLACE_TYPES,
      maxResultCount: 20,
      rankPreference: 'POPULARITY'
    });
    if (signal?.aborted) return { status: 'unavailable', items: [] };
    return { status: 'ok', items: places.filter(p => p.location && p.displayName?.text).map(p => ({
      name: p.displayName.text,
      lat: p.location.lat(),
      lon: p.location.lng(),
      kind: String(p.primaryType || 'tourist attraction').replace(/_/g, ' '),
      place: p.formattedAddress,
      rating: p.rating,
      ratingCount: p.userRatingCount,
      googleMapsURI: p.googleMapsURI,
      source: 'Google Places'
    })) };
  } catch (error) {
    if (/key is missing/i.test(error.message)) return { status: 'not-configured', items: [] };
    return { status: 'unavailable', items: [] };
  }
}

const haversineKm = (a, b) => {
  const R = 6371, rad = x => x * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
export { haversineKm };

/** Load live attractions for a guide. Never throws. */
export async function loadLiveAttractions(guide, { signal } = {}) {
  const { lat, lon, kind } = guide.geo;
  const [google, wk] = await Promise.all([
    fetchGooglePlaces({ lat, lon, kind, signal }),
    kind === 'country' || kind === 'region' ? Promise.resolve([]) : wikiNearby(lat, lon, { signal })
  ]);
  return {
    placesStatus: google.status,
    items: [
      ...google.items,
      ...wk.map(i => ({ name: i.name, lat: i.lat, lon: i.lon, kind: 'wikipedia article', source: 'Wikipedia (geosearch)', wikiTitle: i.wikiTitle }))
    ]
  };
}

/** Merge editorial + live attractions, de-duplicating by name or by (similar name, <300 m). */
export function mergeAttractions(editorial = [], live = []) {
  const out = [];
  const seen = new Map();
  const push = (item, source) => {
    const key = normalizeName(item.name);
    if (!key || seen.has(key)) return;
    const near = out.find(o => o.lat != null && item.lat != null && haversineKm(o, item) < 0.3 &&
      (normalizeName(o.name).includes(key) || key.includes(normalizeName(o.name))));
    if (near) return;
    const entry = { ...item, source: item.source || source, hasCoords: Number.isFinite(item.lat) && Number.isFinite(item.lon) };
    seen.set(key, entry); out.push(entry);
  };
  editorial.forEach(a => push({ ...a, source: 'EKTA editorial record' }, 'EKTA editorial record'));
  live.forEach(a => push(a, a.source));
  return out;
}


