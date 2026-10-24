import { buildCosts, COST_ASSUMPTIONS, EMERGENCY_INDIA, wiki, IN_TOURISM, EDITORIAL_REVIEW } from './helpers.js';

export const sikkim = {
  id: 'sikkim', type: 'state', tier: 'full', name: 'Sikkim', country: 'India', countryCode: 'in',
  aliases: ['sikkim', 'sikkim india'],
  placeAliases: ['gangtok', 'pelling', 'lachung', 'yuksom', 'namchi'],
  geocodeQuery: 'Sikkim, India',
  center: { lat: 27.533, lon: 88.5122 }, zoom: 9,
  summary: 'A small Himalayan state in north-east India bordering Nepal, Bhutan and Tibet, home to Kanchenjunga, Buddhist monasteries and Lepcha, Bhutia and Nepali communities.',
  character: 'Mountains, monasteries and high-altitude lakes; Sikkim has promoted organic farming and has strict plastic-reduction rules in many places.',
  bestTime: {
    summary: 'March–May and October–December give the clearest mountain views; the monsoon (June–September) brings heavy rain and landslides.',
    seasons: [
      { label: 'Spring', months: 'Mar – May', note: 'Rhododendrons bloom at higher altitudes; clearer views.' },
      { label: 'Autumn', months: 'Oct – Dec', note: 'Clear skies and mountain views; colder at altitude.' },
      { label: 'Monsoon', months: 'Jun – Sep', note: 'Heavy rain; landslides can close roads, especially in North Sikkim.' },
      { label: 'Winter', months: 'Dec – Feb', note: 'Snow at higher passes and lakes; some roads and permits restricted.' }
    ]
  },
  costFactor: 1.3, costs: buildCosts(1.3), costAssumptions: COST_ASSUMPTIONS,
  etiquette: [
    'Remove shoes at monasteries, walk clockwise around stupas and prayer wheels, and do not point your feet at altars.',
    'Ask before photographing monks, rituals and interiors; some monasteries restrict photography.',
    'Several areas near the international border (including Nathu La and parts of North Sikkim) need permits and have restrictions depending on nationality — confirm with Sikkim Tourism before planning.',
    'Altitude: ascend gradually in the north (Lachung, Gurudongmar). Acute mountain sickness can affect anyone.',
    'Respect local rules on plastic and waste; carry your own refillable bottle where possible.'
  ],
  stories: [
    { title: 'A former kingdom', text: 'Sikkim was a Buddhist kingdom ruled by Chogyals until it merged with India in 1975, becoming the 22nd state.' },
    { title: 'Kanchenjunga National Park', text: 'Khangchendzonga National Park is a mixed UNESCO World Heritage Site (2016), named for the world’s third-highest mountain.' },
    { title: 'India’s first fully organic state', text: 'Sikkim was declared India’s first fully organic state in 2016 under a state policy.' },
    { title: 'Monasteries', text: 'Rumtek, Pemayangtse and Tashiding are among the best-known monasteries; Pemayangtse is a historic Nyingma monastery.' },
    { title: 'Many communities', text: 'Lepcha, Bhutia and Nepali communities, among others, shape the state’s festivals, languages and food.' }
  ],
  attractions: [
    { name: 'Gangtok', place: 'East Sikkim', lat: 27.3314, lon: 88.6138, kind: 'city' },
    { name: 'Rumtek Monastery', place: 'Near Gangtok', lat: 27.2886, lon: 88.5614, kind: 'religious' },
    { name: 'Tsomgo (Changu) Lake', place: 'East Sikkim', lat: 27.3747, lon: 88.7627, kind: 'lake', precision: 'approx', note: 'High-altitude lake; permit needed.' },
    { name: 'Yuksom', place: 'West Sikkim', lat: 27.3709, lon: 88.2227, kind: 'heritage', hidden: true, note: 'First capital of Sikkim and a base for treks into the Kanchenjunga region.' },
    { name: 'Pemayangtse Monastery', place: 'Near Pelling', lat: 27.3003, lon: 88.25, kind: 'religious', hidden: true, precision: 'approx' },
    { name: 'Lachung', place: 'North Sikkim', lat: 27.69, lon: 88.74, kind: 'village', hidden: true, precision: 'approx', note: 'Permit required for most visitors.' },
    { name: 'Zuluk', place: 'East Sikkim', lat: 27.2477, lon: 88.811, kind: 'viewpoint', hidden: true, precision: 'approx', note: 'Old Silk Route village; permit and weather checks required.' },
    { name: 'Khecheopalri Lake', place: 'West Sikkim', kind: 'lake', hidden: true, note: 'Locate on the live map — EKTA has not stored verified coordinates.' }
  ],
  dishes: [
    { id: 'momos', name: 'Momos', scope: 'regional', diet: 'varies', dietNote: 'Vegetable, chicken, pork or buff fillings are all common. Ask for vegetable filling if you avoid meat.', description: 'Steamed dumplings with a savoury filling, served with a chilli dipping sauce. Eaten across the Himalaya and a staple in Sikkim.', wikiTitle: 'Momo (food)', imageKind: 'dish' },
    { id: 'thukpa', name: 'Thukpa', scope: 'regional', diet: 'varies', dietNote: 'Noodle soup with vegetables, egg or meat — ask what is used.', description: 'A hearty noodle soup of Tibetan origin, popular across the Himalayas.', wikiTitle: 'Thukpa', imageKind: 'dish' },
    { id: 'gundruk', name: 'Gundruk', scope: 'regional', diet: 'veg', description: 'Fermented, dried leafy greens, used in soups and pickles; common in Nepali-heritage cuisine across the Himalayan region.', wikiTitle: 'Gundruk', imageKind: 'dish' },
    { id: 'sel-roti', name: 'Sel Roti', scope: 'shared', sharedWith: ['Nepal', 'Darjeeling'], diet: 'veg', description: 'A ring-shaped sweet rice-flour bread, fried and often made for festivals such as Tihar and Dashain.', wikiTitle: 'Sel roti', imageKind: 'dish' },
    { id: 'phagshapa', name: 'Phagshapa', scope: 'regional', diet: 'non-veg', description: 'Strips of pork fat cooked with radish and dried chillies; a Sikkimese dish of Tibetan-influenced cuisine.', imageKind: null },
    { id: 'kinema', name: 'Kinema', scope: 'shared', sharedWith: ['Darjeeling hills', 'Nepal'], diet: 'veg', description: 'A fermented soybean food with a pungent aroma, often cooked into a curry and associated with the Limbu community.', wikiTitle: 'Kinema', imageKind: 'dish' },
    { id: 'churpi', name: 'Churpi', scope: 'shared', sharedWith: ['Himalayan regions'], diet: 'veg', dietNote: 'Dairy-based.', description: 'A hard cheese made from yak or cow milk, eaten as a chewy snack or added to soups.', imageKind: null }
  ],
  festivals: [
    { name: 'Losar', note: 'Tibetan New Year, February–March.' },
    { name: 'Pang Lhabsol', note: 'Festival honouring Mount Kanchenjunga as guardian deity; usually around August–September.' },
    { name: 'Saga Dawa', note: 'Buddhist festival in May–June.' }
  ],
  emergency: EMERGENCY_INDIA,
  safetyNotes: [
    'Landslides on NH10 and North Sikkim roads can cause multi-day closures in monsoon. Check local updates.',
    'Altitude sickness is a risk above roughly 3,000 m; avoid fast ascents.',
    'EKTA does not rate areas as safe or unsafe; permit and border-area rules change, so confirm with Sikkim Tourism.'
  ],
  sources: [wiki('Sikkim'), wiki('Sikkimese cuisine'), IN_TOURISM, { label: 'Sikkim Tourism (official portal)', url: 'https://www.sikkimtourism.gov.in' }],
  review: EDITORIAL_REVIEW
};
