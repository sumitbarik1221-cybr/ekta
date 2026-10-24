import { getJSON } from './http.js';

const cache = new Map();
const REST = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const API = 'https://en.wikipedia.org/w/api.php';

/** Page summary. Returns null when the page is missing or is a disambiguation page. */
export async function wikiSummary(title, { signal } = {}) {
  if (!title) return null;
  const key = title.toLowerCase();
  if (cache.has(key)) return cache.get(key);
  const p = (async () => {
    try {
      const d = await getJSON(REST + encodeURIComponent(title.replace(/ /g, '_')), { signal, timeout: 9000 });
      if (!d || d.type === 'disambiguation') return null;
      return { title: d.title, description: d.extract || '', short: d.description || '', image: d.thumbnail?.source || null, coordinates: d.coordinates ? { lat: d.coordinates.lat, lon: d.coordinates.lon } : null,
        pageUrl: d.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
        license: 'Wikipedia text: CC BY-SA; image licences are listed on the file page' };
    } catch { return null; }
  })();
  cache.set(key, p);
  return p;
}

/** Notable Wikipedia articles with coordinates near a point (max 10 km). Keyless fallback for attractions. */
export async function wikiNearby(lat, lon, { radius = 10000, limit = 20, signal } = {}) {
  try {
    const url = `${API}?action=query&list=geosearch&gscoord=${lat}%7C${lon}&gsradius=${Math.min(radius, 10000)}&gslimit=${limit}&format=json&origin=*`;
    const d = await getJSON(url, { signal, timeout: 9000 });
    return (d.query?.geosearch || []).map(g => ({ name: g.title, lat: g.lat, lon: g.lon, dist: g.dist, wikiTitle: g.title, source: 'Wikipedia (geosearch)' }));
  } catch { return []; }
}
