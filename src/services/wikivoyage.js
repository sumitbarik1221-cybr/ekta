// Wikivoyage = a free, global, community-written travel guide (CC BY-SA). It is EKTA's source for
// places that have no hand-written record: sections "Respect", "Eat", "Stay safe", "See", "Understand".
// Text is shown as an attributed excerpt and is never rewritten without being labelled.
import { getJSON } from './http.js';

const cache = new Map();
const WANTED = { understand: 'Understand', see: 'See', eat: 'Eat', respect: 'Respect', staysafe: 'Stay safe', getaround: 'Get around' };

/** Split MediaWiki plain-text extract ("== Heading ==") into { heading: text }. Pure; unit-tested. */
export function parseSections(extract = '') {
  const out = {}; let cur = 'intro'; out[cur] = [];
  for (const line of extract.split('\n')) {
    const m = /^(={2,4})\s*(.+?)\s*\1\s*$/.exec(line);
    if (m && m[1].length === 2) { cur = m[2].trim().toLowerCase(); out[cur] = []; }
    else if (!m) out[cur].push(line);
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.join('\n').replace(/\n{3,}/g, '\n\n').trim()]).filter(([, v]) => v));
}

export function pickSections(sections) {
  const res = {};
  for (const [key, label] of Object.entries(WANTED)) { const t = sections[label.toLowerCase()]; if (t) res[key] = t; }
  return res;
}

export async function wikivoyageGuide(title, { signal } = {}) {
  if (!title) return null;
  const k = title.toLowerCase();
  if (cache.has(k)) return cache.get(k);
  const p = (async () => {
    try {
      const url = `https://en.wikivoyage.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&origin=*&titles=${encodeURIComponent(title)}`;
      const d = await getJSON(url, { signal, timeout: 10000 });
      const page = Object.values(d.query?.pages || {})[0];
      if (!page || page.missing !== undefined || !page.extract) return null;
      const sections = pickSections(parseSections(page.extract));
      if (!Object.keys(sections).length) return null;
      return { title: page.title, url: `https://en.wikivoyage.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`, sections, license: 'Wikivoyage, CC BY-SA 4.0' };
    } catch { return null; }
  })();
  cache.set(k, p);
  return p;
}

export const excerpt = (t, n = 900) => (t.length <= n ? t : t.slice(0, t.lastIndexOf(' ', n)) + '…');
