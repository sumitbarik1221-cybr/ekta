import { buildCosts, COST_ASSUMPTIONS, EMERGENCY_INDIA, wiki, IN_TOURISM, EDITORIAL_REVIEW } from './helpers.js';

// Delhi is a union territory (NCT of Delhi) and also a city — treated here as a single record.
export const delhi = {
  id: 'delhi', type: 'union-territory', tier: 'full', name: 'Delhi', country: 'India', countryCode: 'in',
  aliases: ['delhi', 'new delhi', 'nct of delhi', 'national capital territory of delhi', 'dilli', 'delhi india'],
  placeAliases: ['old delhi', 'chandni chowk', 'connaught place'],
  geocodeQuery: 'Delhi, India',
  center: { lat: 28.6139, lon: 77.209 }, zoom: 11,
  summary: 'India’s capital territory: a layered city of medieval monuments, Mughal-era Old Delhi, colonial-era New Delhi and some of India’s most varied food.',
  character: 'A capital of many empires — Sultanate, Mughal and British — with tombs, mosques and gardens set between busy modern neighbourhoods.',
  bestTime: {
    summary: 'October to March has the most pleasant weather. Summers are extremely hot and winter air quality can be poor.',
    seasons: [
      { label: 'Cooler season', months: 'Oct – Mar', note: 'Most comfortable for walking; winter fog and poor air quality can affect days in Nov–Jan.' },
      { label: 'Summer', months: 'Apr – Jun', note: 'Very hot; plan outdoor sights early in the morning.' },
      { label: 'Monsoon', months: 'Jul – Sep', note: 'Humid; heavy showers can cause waterlogging.' }
    ]
  },
  costFactor: 1.3, costs: buildCosts(1.3), costAssumptions: COST_ASSUMPTIONS,
  etiquette: [
    'Cover shoulders and knees and remove shoes at mosques and gurdwaras (e.g. Jama Masjid, Gurudwara Bangla Sahib); scarves for covering the head are often provided at gurdwaras.',
    'Many monuments charge different entry fees for Indian and foreign visitors and may restrict drones and tripods.',
    'Use metro or registered taxis; agree fares or use meters/apps for autos.',
    'Street food: choose busy stalls with high turnover and bottled or filtered water.',
    'Ask before photographing people, especially at religious sites in Old Delhi.'
  ],
  stories: [
    { title: 'Seven cities, many more layers', text: 'Delhi has been a capital for many dynasties; sites like Qutub Minar, Humayun’s Tomb and Red Fort span centuries of Sultanate, Mughal and later rule.' },
    { title: 'Humayun’s Tomb', text: 'Humayun’s Tomb, completed in the 1570s, is an early example of Mughal garden-tomb architecture and a UNESCO World Heritage Site.' },
    { title: 'Red Fort', text: 'The Red Fort, built by Shah Jahan in the 17th century, is a UNESCO World Heritage Site and the place from which India’s Prime Minister addresses the nation on Independence Day.' },
    { title: 'Shahjahanabad', text: 'Old Delhi’s walled city, Shahjahanabad, was laid out under Shah Jahan, with Chandni Chowk as its main avenue.' },
    { title: 'New Delhi as capital', text: 'The British announced the move of the capital from Calcutta to Delhi in 1911; New Delhi was inaugurated as the capital in 1931.' }
  ],
  attractions: [
    { name: 'Red Fort', place: 'Old Delhi', lat: 28.6562, lon: 77.241, kind: 'heritage' },
    { name: 'Jama Masjid', place: 'Old Delhi', lat: 28.6507, lon: 77.2334, kind: 'religious' },
    { name: 'Humayun’s Tomb', place: 'Nizamuddin', lat: 28.5933, lon: 77.2507, kind: 'heritage' },
    { name: 'Qutub Minar', place: 'Mehrauli', lat: 28.5245, lon: 77.1855, kind: 'heritage' },
    { name: 'India Gate', place: 'Central Delhi', lat: 28.6129, lon: 77.2295, kind: 'landmark' },
    { name: 'Lotus Temple', place: 'South Delhi', lat: 28.5535, lon: 77.2588, kind: 'religious' },
    { name: 'Lodhi Garden', place: 'Central Delhi', lat: 28.5931, lon: 77.2197, kind: 'garden', hidden: true },
    { name: 'Mehrauli Archaeological Park', place: 'Mehrauli', lat: 28.5198, lon: 77.1855, kind: 'heritage', hidden: true, precision: 'approx' },
    { name: 'Hauz Khas Fort and Lake', place: 'South Delhi', lat: 28.5494, lon: 77.2001, kind: 'heritage', hidden: true },
    { name: 'Purana Qila', place: 'Central Delhi', lat: 28.6096, lon: 77.2437, kind: 'heritage', hidden: true },
    { name: 'Chandni Chowk', place: 'Old Delhi', lat: 28.6506, lon: 77.2303, kind: 'market', precision: 'approx' }
  ],
  dishes: [
    { id: 'chole-bhature', name: 'Chole Bhature', scope: 'regional', diet: 'veg', description: 'Spiced chickpeas served with fluffy deep-fried leavened bread; popular across Delhi and North India.', wikiTitle: 'Chole bhature', imageKind: 'dish' },
    { id: 'parathas', name: 'Stuffed Parathas', scope: 'city', diet: 'veg', dietNote: 'Chandni Chowk’s Paranthe Wali Gali is known for vegetarian stuffings; check for onion/garlic if you avoid them.', description: 'Griddled flatbreads with fillings such as potato, paneer or radish, served with pickles and chutneys. Chandni Chowk’s Paranthe Wali Gali is the classic place to try them.', wikiTitle: 'Paratha', imageKind: 'dish', note: 'Photo shows paratha generally, not specifically the Delhi style.' },
    { id: 'butter-chicken', name: 'Butter Chicken', scope: 'shared', sharedWith: ['North India'], diet: 'non-veg', description: 'Tandoori chicken in a creamy tomato-butter gravy, popular across North India and associated with Delhi’s restaurants; its origin is debated.', wikiTitle: 'Butter chicken', imageKind: 'dish' },
    { id: 'nihari', name: 'Nihari', scope: 'shared', sharedWith: ['Old Delhi', 'Lucknow', 'Pakistan'], diet: 'non-veg', description: 'A slow-cooked meat stew, traditionally eaten as a breakfast; Old Delhi’s Jama Masjid area is known for it.', wikiTitle: 'Nihari', imageKind: 'dish' },
    { id: 'dahi-bhalla', name: 'Dahi Bhalla', scope: 'regional', diet: 'veg', dietNote: 'Dairy-based (not vegan).', description: 'Soft lentil dumplings soaked in water and topped with yoghurt, chutneys and spices; a Delhi chaat staple.', imageKind: null },
    { id: 'daulat-ki-chaat', name: 'Daulat ki Chaat', scope: 'city', diet: 'veg', dietNote: 'Dairy-based (not vegan).', description: 'A winter delicacy of airy milk froth topped with khoya, saffron and nuts, sold in Old Delhi lanes.', wikiTitle: 'Daulat ki chaat', imageKind: 'dish' },
    { id: 'jalebi', name: 'Jalebi', scope: 'shared', sharedWith: ['North India'], diet: 'veg', description: 'Spirals of fermented batter, deep-fried and soaked in saffron-sugar syrup; commonly eaten hot with rabri or milk in Old Delhi.', wikiTitle: 'Jalebi', imageKind: 'dish' },
    { id: 'kulfi-faluda', name: 'Kulfi Falooda', scope: 'shared', sharedWith: ['North India'], diet: 'veg', dietNote: 'Dairy-based (not vegan).', description: 'Dense frozen milk dessert served with falooda noodles and rose syrup.', wikiTitle: 'Kulfi', imageKind: 'dish', note: 'Photo shows kulfi generally.' }
  ],
  festivals: [
    { name: 'Diwali', note: 'October–November; dates follow the lunar calendar.' },
    { name: 'Republic Day parade', note: '26 January, on Kartavya Path; tickets and security restrictions apply.' },
    { name: 'Eid and Urs festivals', note: 'Dates follow the Islamic calendar; Old Delhi and Nizamuddin become very crowded.' }
  ],
  emergency: EMERGENCY_INDIA,
  safetyNotes: [
    'Air quality can be poor in winter; check an AQI source and consider a mask on bad days.',
    'Use registered taxis, metro or app-based rides; agree on fares in advance.',
    'EKTA does not rate areas as safe or unsafe; check current advisories and local police guidance.'
  ],
  sources: [wiki('Delhi'), wiki('Delhi cuisine', 'Cuisine of Delhi — Wikipedia'), IN_TOURISM, { label: 'Delhi Tourism (official portal)', url: 'https://delhitourism.gov.in' }],
  review: EDITORIAL_REVIEW
};
