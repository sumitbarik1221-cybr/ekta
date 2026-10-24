// Itinerary generator (pure function — no network, no React).
//
// What it uses:   attractions with coordinates and dishes from EKTA records (and any live attractions the caller passes).
// What it never does: invent activities, hotel/ticket prices, opening hours or live availability.
// Where there is no verified attraction to schedule, the slot is marked "open" instead of being filled with filler text.
import { COST_LABELS, sumCosts } from '../data/regions/helpers.js';
import { haversineKm } from './places.js';

export const MAX_DAYS = 21;
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseISODate(s) {
  const m = ISO.exec(s || ''); if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? d : null;
}
export function validateDates(startDate, endDate, today = new Date().toISOString().slice(0, 10)) {
  const s = parseISODate(startDate), e = parseISODate(endDate), t = parseISODate(today);
  if (!s) return 'Choose a valid start date.';
  if (!e) return 'Choose a valid end date.';
  if (e < s) return 'The end date must be on or after the start date.';
  if (t && s < t) return 'The start date is in the past.';
  const n = Math.round((e - s) / 86400000) + 1;
  if (n > MAX_DAYS) return `Trips longer than ${MAX_DAYS} days are not supported — shorten the range.`;
  return null;
}

const KINDS_BY_INTEREST = {
  Culture: ['heritage', 'religious', 'museum', 'market', 'craft', 'landmark', 'village'],
  History: ['heritage', 'museum', 'landmark'],
  Nature: ['nature', 'waterfall', 'lake', 'viewpoint', 'hill-town', 'trek', 'beach', 'garden'],
  Adventure: ['trek', 'nature', 'waterfall', 'hill-town'],
  Shopping: ['market', 'craft'],
  Spirituality: ['religious'],
  Relaxation: ['garden', 'beach', 'lake', 'viewpoint'],
  Food: ['market']
};
const SLOTS = ['morning', 'afternoon', 'evening'];
const PACE = { relaxed: ['attraction', 'rest', 'food'], balanced: ['attraction', 'attraction', 'food'], packed: ['attraction', 'attraction', 'attraction'] };

const fmt = d => d.toLocaleDateString('en-IN', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');

export function estimateTrip(record, style, travellers, days) {
  const table = record?.costs?.[style];
  if (!table) return null;
  const perPerson = sumCosts(table);
  return {
    style, perPersonPerDay: perPerson,
    total: [perPerson[0] * travellers * days, perPerson[1] * travellers * days],
    breakdown: Object.entries(table).map(([k, [lo, hi]]) => ({ key: k, label: COST_LABELS[k], perPersonPerDay: [lo, hi], total: [lo * travellers * days, hi * travellers * days] })),
    label: 'Estimate — EKTA planning ranges, not live prices',
    excludes: 'Long-distance transport (flights/trains) and shopping'
  };
}

/**
 * @param {object} p
 * @param {object} p.guide        resolved destination guide (see resolver.js)
 * @param {Array}  [p.attractions] optional merged attraction list (editorial + live); defaults to the record's own
 */
export function generateItinerary({ guide, attractions, startDate, endDate, budget, travellers = 1, style = 'balanced', interests = [], pace = 'balanced', today, seed = 0 }) {
  const err = validateDates(startDate, endDate, today);
  if (err) return { error: err };
  const n = Math.round((parseISODate(endDate) - parseISODate(startDate)) / 86400000) + 1;
  const total = Number(budget), trav = Math.max(1, Math.floor(Number(travellers) || 1));
  const warnings = [], notes = [];
  if (!Number.isFinite(total) || total <= 0) return { error: 'Enter a total trip budget greater than zero.' };

  const record = guide?.record || null;
  const pool = (attractions || record?.attractions || []).filter(a => a.name);
  const located = pool.filter(a => Number.isFinite(a.lat) && Number.isFinite(a.lon));
  const unlocated = pool.filter(a => !(Number.isFinite(a.lat) && Number.isFinite(a.lon)));

  // Budget feasibility — only when EKTA has a cost model for this destination.
  const estimate = estimateTrip(record, style === 'comfort' ? 'premium' : style, trav, n);
  if (!estimate) warnings.push(`EKTA has no cost model for ${guide?.title || 'this destination'}, so the budget cannot be checked. Treat any numbers you enter as your own limit.`);
  else {
    if (total < estimate.total[0]) warnings.push(`Your budget (${inr(total)}) is below the low end of EKTA’s ${style} estimate (${inr(estimate.total[0])}–${inr(estimate.total[1])} for ${trav} traveller${trav > 1 ? 's' : ''}, ${n} day${n > 1 ? 's' : ''}). It looks unrealistic — consider fewer days, a cheaper style or fewer travellers.`);
    else if (total < estimate.total[1]) notes.push(`Your budget sits inside the estimated range (${inr(estimate.total[0])}–${inr(estimate.total[1])}); costs near the top of the range are more likely in peak season.`);
    else notes.push('Your budget covers the upper end of the estimate, excluding long-distance transport.');
  }

  // Score attractions by interest.
  const want = new Set(interests.flatMap(i => KINDS_BY_INTEREST[i] || []));
  const score = a => (want.size && want.has(a.kind) ? 2 : 0) + (a.hidden && interests.includes('Culture') ? 0.5 : 0) + (a.rate ? Number(String(a.rate)[0]) * 0.2 : 0);
  const remaining = [...located].sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));
  if (seed) for (let i = remaining.length - 1; i > 0; i--) { const j = (seed * 7919 + i * 104729) % (i + 1); [remaining[i], remaining[j]] = [remaining[j], remaining[i]]; }
  const queue = [...remaining];

  // Food suggestions: one dish per day where we have described dishes; local (city/regional) dishes first, shared last.
  const dishes = (record?.dishes || []).filter(d => d.description);
  const order = { city: 0, regional: 1, shared: 2 };
  const dishQueue = interests.includes('Food') || true ? [...dishes].sort((a, b) => (order[a.scope] ?? 1) - (order[b.scope] ?? 1)) : [];
  if (!located.length) warnings.push(`EKTA has no verified attractions with coordinates for ${guide?.title || 'this destination'}, so days are left open instead of filled with guesses. Use the map and nearby results to choose activities.`);
  else if (queue.length < n * PACE[pace].filter(x => x === 'attraction').length) notes.push('There are fewer verified attractions than slots; some may repeat or stay open rather than be padded.');

  const pattern = PACE[pace] || PACE.balanced;
  const days = [];
  const start = parseISODate(startDate);
  let last = null;
  for (let i = 0; i < n; i++) {
    const date = new Date(start.getTime() + i * 86400000);
    const day = { day: i + 1, iso: date.toISOString().slice(0, 10), date: fmt(date), travelNotes: [] };
    SLOTS.forEach((slot, si) => {
      const type = pattern[si];
      if (type === 'rest') { day[slot] = { kind: 'rest', title: 'Free time and rest', note: 'Left unscheduled to keep the pace relaxed.' }; return; }
      if (type === 'food') {
        const dish = dishQueue.length ? dishQueue[(i) % dishQueue.length] : null;
        day[slot] = dish
          ? { kind: 'food', title: `Dinner: try ${dish.name}`, note: `${dish.description}${dish.scope === 'shared' ? ' (found across a wider region, not unique to this place)' : ''}`, diet: dish.diet, source: 'EKTA editorial record' }
          : { kind: 'open', title: 'Dinner — open', note: 'No verified local dish data for this destination.' };
        return;
      }
      // attraction slot — pick nearest to the previous stop to keep days geographically coherent
      let pick = null;
      if (queue.length) {
        if (last) queue.sort((a, b) => haversineKm(last, a) - haversineKm(last, b));
        pick = queue.shift();
      }
      if (!pick) { day[slot] = { kind: 'open', title: `${slot[0].toUpperCase() + slot.slice(1)} — open`, note: 'No further verified attraction to schedule.' }; return; }
      if (last) {
        const km = haversineKm(last, pick);
        if (km > 40) day.travelNotes.push(`${last.name} → ${pick.name}: about ${Math.round(km)} km apart in a straight line. Road time is not calculated (no routing service configured) — allow generous travel time.`);
      }
      last = pick;
      day[slot] = { kind: 'attraction', title: pick.name, note: pick.note || (pick.place ? `In ${pick.place}.` : ''), lat: pick.lat, lon: pick.lon, source: pick.source || 'EKTA editorial record', precision: pick.precision || null };
    });
    days.push(day);
  }
  if (unlocated.length) notes.push(`Not scheduled because their coordinates are not verified yet: ${unlocated.map(a => a.name).join(', ')}.`);
  notes.push('No ticket prices, hotel prices, opening hours or availability are included — check official sources.');
  return { days, warnings, notes, estimate, meta: { nights: n, travellers: trav, style, pace } };
}

export function itineraryToText(result, title) {
  if (!result?.days) return '';
  const lines = [`EKTA itinerary — ${title}`, ''];
  for (const d of result.days) {
    lines.push(`Day ${d.day} · ${d.date}`);
    for (const s of SLOTS) lines.push(`  ${s[0].toUpperCase() + s.slice(1)}: ${d[s].title}${d[s].note ? ' — ' + d[s].note : ''}`);
    d.travelNotes.forEach(t => lines.push(`  Note: ${t}`));
    lines.push('');
  }
  result.warnings.forEach(w => lines.push(`Warning: ${w}`));
  result.notes.forEach(w => lines.push(`Note: ${w}`));
  return lines.join('\n');
}
