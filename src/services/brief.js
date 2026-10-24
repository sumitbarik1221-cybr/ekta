import { API_BASE } from './http.js';

/** Plain-text sources gathered for a guide (Wikipedia summary + Wikivoyage sections). */
export function gatherSources(guide) {
  const src = {};
  if (guide.description?.source?.label === 'Wikipedia') src.wikipedia = guide.description.text;
  for (const [k, v] of Object.entries(guide.voyage?.sections || {})) src[`wikivoyage:${k}`] = v;
  return src;
}

/** Ask the backend to organise ONLY the retrieved text. Returns {ok,data} or {ok:false,reason}. */
export async function organiseWithAI(guide, signal) {
  const sources = gatherSources(guide);
  if (!Object.keys(sources).length) return { ok: false, reason: 'no-sources' };
  let res;
  try { res = await fetch(`${API_BASE}/api/brief`, { method: 'POST', signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ place: guide.title, sources }) }); }
  catch { return { ok: false, reason: 'unreachable' }; }
  if (res.status === 503) return { ok: false, reason: 'not-configured' };
  if (!res.ok) return { ok: false, reason: 'error' };
  const data = await res.json().catch(() => null);
  return data ? { ok: true, data } : { ok: false, reason: 'error' };
}
