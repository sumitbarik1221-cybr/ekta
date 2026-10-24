import { wiki, EDITORIAL_REVIEW } from './helpers.js';

// Bangladesh is a SOVEREIGN COUNTRY, distinct from the Indian state of West Bengal. Both share the
// historical region of Bengal and the Bengali language. This record exists so that a search for
// "Bangladesh" never falls back to West Bengal data (and vice versa).
//
// Coverage is intentionally narrower than the Indian records: no cost model is provided (costs are in
// BDT and EKTA has no sourced estimate), and the UI says so.
export const bangladesh = {
  id: 'bangladesh', type: 'country', tier: 'basic', name: 'Bangladesh', country: 'Bangladesh', countryCode: 'bd',
  aliases: ['bangladesh', 'people’s republic of bangladesh', 'peoples republic of bangladesh'],
  placeAliases: ['dhaka', 'chittagong', 'chattogram', 'sylhet', 'khulna', 'coxs bazar', 'cox’s bazar'],
  geocodeQuery: 'Bangladesh',
  center: { lat: 23.685, lon: 90.3563 }, zoom: 7,
  summary: 'A South Asian country on the Bay of Bengal, bordered mostly by India, with a Bengali-speaking majority, a vast river delta and some of the world’s longest unbroken sea beaches.',
  character: 'River-delta landscapes, Bengali language and literary culture, and a cuisine centred on rice, fish (especially hilsa) and sweets.',
  bestTime: {
    summary: 'November to February is generally the cooler, drier season. The monsoon (roughly June–September) brings heavy rain and flooding in many areas.',
    seasons: [
      { label: 'Cooler season', months: 'Nov – Feb', note: 'Most comfortable for travel.' },
      { label: 'Monsoon', months: 'Jun – Sep', note: 'Heavy rain and flooding; the Sundarbans and river transport are affected.' }
    ]
  },
  costs: null,
  etiquette: [
    'Bangladesh is a Muslim-majority country; dress modestly (cover shoulders and knees) and remove shoes at mosques and many homes.',
    'Use the right hand for eating and handing items; avoid public displays of affection.',
    'Ask before photographing people, especially women, and religious activity.',
    'During Ramadan, avoid eating or drinking openly in public during daylight where fasting is widely observed.'
  ],
  stories: [
    { title: 'Language Movement', text: 'The Bengali Language Movement of 1952 is commemorated each year on 21 February, which UNESCO has proclaimed International Mother Language Day.' },
    { title: 'Mosque City of Bagerhat', text: 'The historic Mosque City of Bagerhat, including the Sixty Dome Mosque, is a UNESCO World Heritage Site.' },
    { title: 'Paharpur Buddhist Vihara', text: 'The ruins of the Buddhist Vihara at Paharpur are a UNESCO World Heritage Site.' },
    { title: 'Sundarbans', text: 'Bangladesh holds the larger share of the Sundarbans mangrove forest, a UNESCO World Heritage Site and Bengal tiger habitat.' },
    { title: 'Cox’s Bazar', text: 'Cox’s Bazar is known for its long sea beach, which is often described as one of the longest unbroken natural sea beaches in the world.' }
  ],
  attractions: [
    { name: 'Sixty Dome Mosque (Bagerhat)', place: 'Bagerhat', lat: 22.6742, lon: 89.7428, kind: 'heritage', precision: 'approx' },
    { name: 'Paharpur Buddhist Vihara', place: 'Naogaon', lat: 25.0319, lon: 88.9767, kind: 'heritage', precision: 'approx' },
    { name: 'Cox’s Bazar Beach', place: 'Cox’s Bazar', lat: 21.4272, lon: 91.9764, kind: 'beach', precision: 'approx' },
    { name: 'Lalbagh Fort', place: 'Dhaka', lat: 23.7188, lon: 90.3883, kind: 'heritage', precision: 'approx' },
    { name: 'Sundarbans (Bangladesh)', place: 'Khulna division', lat: 22.2, lon: 89.5, kind: 'nature', precision: 'approx', note: 'Visits need permits and licensed boats.' }
  ],
  dishes: [
    { id: 'ilish', name: 'Ilish (Hilsa)', scope: 'regional', diet: 'non-veg', description: 'Hilsa is the national fish of Bangladesh and is cooked in many ways, such as with mustard (shorshe ilish) or steamed in banana leaf.', wikiTitle: 'Ilish', imageKind: 'ingredient' },
    { id: 'panta-bhat', name: 'Panta Bhat', scope: 'regional', diet: 'varies', dietNote: 'Fermented rice, usually served with chilli, onion and fried fish — sometimes only with vegetables.', description: 'Rice soaked in water overnight; widely eaten on Pohela Boishakh (Bengali New Year, 14 April) with fried hilsa.', wikiTitle: 'Panta bhat', imageKind: 'dish' },
    { id: 'kacchi-biryani', name: 'Kacchi Biryani', scope: 'regional', diet: 'non-veg', description: 'A Dhaka-style biryani where raw marinated meat (usually mutton) is cooked with rice in sealed pots.', wikiTitle: 'Kacchi biryani', imageKind: 'dish' },
    { id: 'bhorta', name: 'Bhorta', scope: 'regional', diet: 'varies', dietNote: 'Made with vegetables, dried fish or shrimp — ask.', description: 'Mashed vegetables or fish mixed with mustard oil, onion and chilli, eaten with rice.', imageKind: null },
    { id: 'pitha-bd', name: 'Pitha', scope: 'regional', diet: 'veg', dietNote: 'Typically rice-based and sweet; some include dairy.', description: 'Rice-flour cakes made in winter, including bhapa pitha and pati shapta.', wikiTitle: 'Pitha', imageKind: 'dish', note: 'Photo shows pitha generally (a family of rice cakes across eastern South Asia), not specifically the Bangladeshi version.' }
  ],
  festivals: [
    { name: 'Pohela Boishakh', note: 'Bengali New Year on 14 April.' },
    { name: 'Eid ul-Fitr and Eid ul-Adha', note: 'Dates follow the Islamic calendar.' }
  ],
  emergency: {
    numbers: [{ label: 'National emergency service', value: '999' }],
    note: 'Bangladesh’s national emergency number is 999. Confirm locally before travel.',
    source: { label: 'Bangladesh Government National Portal', url: 'https://bangladesh.gov.bd' }
  },
  safetyNotes: [
    'Travel conditions can change; check your government’s current travel advisory before booking.',
    'EKTA does not rate areas as safe or unsafe.'
  ],
  sources: [wiki('Bangladesh'), wiki('Bangladeshi cuisine'), { label: 'Bangladesh Tourism Board', url: 'https://tourismboard.portal.gov.bd' }],
  limited: ['Budget estimate (no sourced BDT cost model yet)', 'City-level knowledge for most destinations'],
  review: EDITORIAL_REVIEW
};
