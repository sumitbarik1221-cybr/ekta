// Google Gemini travel assistant client. The browser NEVER holds an AI key: it calls EKTA's backend (/api/assistant),
// which holds the key server-side. When the backend is missing, the UI falls back to a clearly-labelled
// rules-based answer built from the same destination record — it is never presented as AI output.
import { API_BASE } from './http.js';

export function buildAssistantContext(guide) {
  const r = guide?.record;
  return {
    destination: guide?.title,
    country: guide?.geo?.country,
    coverage: r ? { tier: r.tier, scope: guide.scope, recordName: r.name } : { tier: 'none' },
    description: guide?.description?.text || null,
    wikivoyage: guide?.voyage ? Object.fromEntries(Object.entries(guide.voyage.sections).map(([k, v]) => [k, v.slice(0, 1500)])) : null,
    facts: r ? {
      character: r.character || null,
      bestTime: r.bestTime?.summary || null,
      etiquette: r.etiquette || [],
      stories: (r.stories || []).map(s => s.text),
      attractions: (r.attractions || []).map(a => a.name),
      dishes: (r.dishes || []).map(d => ({ name: d.name, diet: d.diet, scope: d.scope })),
      emergency: r.emergency?.numbers || null
    } : null
  };
}

export async function askAssistant({ question, guide, signal, webSearch = false }) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/assistant`, {
      method: 'POST', signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context: buildAssistantContext(guide), webSearch })
    });
  } catch { return { ok: false, reason: 'unreachable' }; }
  if (res.status === 503) return { ok: false, reason: 'not-configured' };
  const d = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, reason: 'error', status: res.status, message: d?.error || `AI request failed (HTTP ${res.status}).` };
  if (!d?.answer) return { ok: false, reason: 'error' };
  return { ok: true, answer: d.answer, model: d.model, provider: d.provider, webSearch: d.webSearch === true, sources: Array.isArray(d.sources) ? d.sources : [] };
}

/** Deterministic fallback. Uses only the stored record; says so when there is nothing to use. */
export function rulesBasedAnswer(question, guide) {
  const q = question.toLowerCase(), r = guide?.record, name = guide?.title || 'this destination';
  if (/emergen|safe|police|ambulance/.test(q)) {
    const n = r?.emergency?.numbers?.map(x => `${x.label}: ${x.value}`).join('; ');
    return n ? `${n}. ${r.emergency.note || ''} EKTA does not rate places as safe or unsafe — check your government’s travel advisory and local guidance.` : `EKTA has no verified emergency numbers stored for ${name}. Check the local emergency number before you travel and your government’s travel advisory.`;
  }
  if (/food|eat|dish|cuisine/.test(q)) {
    const d = r?.dishes?.filter(x => x.description) || [];
    return d.length ? `Dishes in EKTA’s ${r.name} record: ${d.slice(0, 6).map(x => x.name).join(', ')}. Ask about ingredients if you have dietary needs.` : `EKTA has no verified dish descriptions for ${name} yet.`;
  }
  if (/season|weather|when|best time/.test(q)) return r?.bestTime?.summary || `EKTA has no seasonal guidance stored for ${name}; check the live weather panel and a local source.`;
  if (/hidden|gem|see|visit|attraction/.test(q)) {
    const a = r?.attractions?.map(x => x.name) || [];
    return a.length ? `From EKTA’s ${r.name} record: ${a.slice(0, 8).join(', ')}.` : `EKTA has no stored attraction list for ${name}; see the map and Wikipedia nearby results.`;
  }
  if (/dress|custom|etiquette|culture|respect/.test(q)) return r?.etiquette?.length ? r.etiquette.slice(0, 3).join(' ') : `EKTA has no verified etiquette notes for ${name} yet.`;
  return r ? `${r.summary || ''} Try asking about food, the best season, attractions, etiquette or emergency numbers.` : `EKTA has no destination record for ${name}, so this offline helper cannot answer. Configure the AI backend (see README) for general answers.`;
}
