// Shared helpers for regional knowledge records.
//
// COST MODEL — these are EKTA planning estimates, NOT live prices.
// Per person, per day, in INR, twin-sharing, excluding long-distance transport.
// Each record applies a `costFactor` to the base table (1.0 = a typical mid-cost Indian state).
export const COST_BASE = {
  budget:   { accommodation:[600,1100],  food:[250,450],   transport:[100,250],  attractions:[50,150],   activities:[0,200],    other:[100,200]  },
  balanced: { accommodation:[1500,2600], food:[600,1000],  transport:[300,650],  attractions:[150,400], activities:[200,800],  other:[200,400]  },
  premium:  { accommodation:[4500,9000], food:[1500,3000], transport:[900,2000], attractions:[300,900], activities:[500,2500], other:[400,1000] }
};
export const COST_LABELS = {
  accommodation:'Accommodation', food:'Food', transport:'Local transport',
  attractions:'Attraction entry', activities:'Activities & guides', other:'Other expenses'
};
const round50 = n => Math.round(n / 50) * 50;

export function buildCosts(factor = 1) {
  const out = {};
  for (const [style, cats] of Object.entries(COST_BASE)) {
    out[style] = {};
    for (const [cat, [lo, hi]] of Object.entries(cats)) out[style][cat] = [round50(lo * factor), round50(hi * factor)];
  }
  return out;
}
export function sumCosts(styleCosts) {
  return Object.values(styleCosts).reduce((acc, [lo, hi]) => [acc[0] + lo, acc[1] + hi], [0, 0]);
}

export const COST_ASSUMPTIONS = [
  'Per person per day, twin-sharing accommodation.',
  'Excludes flights, trains and other long-distance transport.',
  'Built from EKTA’s own planning ranges scaled by a regional cost factor — not scraped from live hotel, ticket or fare data.',
  'Peak season, festivals and last-minute bookings can exceed the upper end.'
];

export const EMERGENCY_INDIA = {
  numbers: [{ label:'National emergency number', value:'112' }],
  note: 'India’s single emergency number is 112. Ambulance and other helpline numbers vary by state — confirm locally.',
  source: { label:'ERSS-112 (Government of India)', url:'https://112.gov.in' }
};

// Source link helpers — every record cites where a reader can check it.
export const wiki = (title, label) => ({ label: label || `${title} — Wikipedia`, url:`https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g,'_'))}` });
export const IN_TOURISM = { label:'Incredible India (Ministry of Tourism)', url:'https://www.incredibleindia.gov.in' };

export const EDITORIAL_REVIEW = {
  status: 'editorial',
  note: 'Written by the EKTA team from general public knowledge. Not yet reviewed by a local expert — check official sources before relying on specifics.'
};
