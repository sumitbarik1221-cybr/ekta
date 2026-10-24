import { buildCosts, COST_ASSUMPTIONS, EMERGENCY_INDIA, wiki, IN_TOURISM, EDITORIAL_REVIEW } from './helpers.js';

export const rajasthan = {
  id: 'rajasthan', type: 'state', tier: 'full', name: 'Rajasthan', country: 'India', countryCode: 'in',
  aliases: ['rajasthan', 'rajasthan india', 'rajputana'],
  placeAliases: ['jaipur', 'udaipur', 'jodhpur', 'jaisalmer', 'pushkar', 'bikaner', 'ajmer', 'mount abu', 'bundi'],
  geocodeQuery: 'Rajasthan, India',
  center: { lat: 27.0238, lon: 74.2179 }, zoom: 7,
  summary: 'India’s largest state by area, in the north-west: hill forts, palaces, the Thar Desert, lakes and long-standing folk-music, craft and textile traditions.',
  character: 'Rajput-era forts and palaces, desert and lake landscapes, block printing, miniature painting and a cuisine shaped by a dry climate.',
  bestTime: {
    summary: 'October to March is the standard visiting window; summers are extremely hot and the monsoon is short but can disrupt travel.',
    seasons: [
      { label: 'Main season', months: 'Oct – Mar', note: 'Cooler days; the busiest and most expensive period, especially around Diwali and Christmas–New Year.' },
      { label: 'Desert (Jaisalmer, Bikaner)', months: 'Nov – Feb', note: 'Cold nights; warm layers needed.' },
      { label: 'Hot season', months: 'Apr – Jun', note: 'Temperatures can be very high; plan outdoor visits early in the day.' }
    ]
  },
  costFactor: 1.2, costs: buildCosts(1.2), costAssumptions: COST_ASSUMPTIONS,
  etiquette: [
    'Remove shoes and cover shoulders and knees at temples, Jain shrines and mosques; some require covering the head.',
    'Ask before photographing people, especially women and elders; expect a fee for some photography inside forts and palaces.',
    'Bargaining is normal in bazaars but not in fixed-price shops, and not for food at established restaurants.',
    'Camel and village experiences: choose operators who treat animals well, and ask before entering homes or photographing festivals.',
    'Rajasthan has strong vegetarian traditions in many communities and at many pilgrim sites; follow local rules on meat and alcohol near temples.'
  ],
  stories: [
    { title: 'Jaipur, the Pink City', text: 'Jaipur was founded in 1727 by Sawai Jai Singh II. The old city was painted pink in the 19th century and is a UNESCO World Heritage Site (2019).' },
    { title: 'Hill Forts of Rajasthan', text: 'Six hill forts — Chittorgarh, Kumbhalgarh, Sawai Madhopur (Ranthambore), Jhalawar (Gagron), Jaipur (Amber) and Jaisalmer — are inscribed together as a UNESCO World Heritage Site.' },
    { title: 'Jantar Mantar', text: 'The Jantar Mantar in Jaipur, built in the early 18th century, is a collection of astronomical instruments and a UNESCO World Heritage Site.' },
    { title: 'Living fort at Jaisalmer', text: 'Jaisalmer Fort is one of the few "living forts" in India, with residents still living inside its walls; the fort faces water and conservation pressures.' },
    { title: 'Block printing', text: 'Block printing, including Sanganer and Bagru styles near Jaipur, is a long-standing textile craft of the region.' }
  ],
  attractions: [
    { name: 'Amber Fort', place: 'Jaipur', lat: 26.9855, lon: 75.8513, kind: 'heritage' },
    { name: 'Hawa Mahal', place: 'Jaipur', lat: 26.9239, lon: 75.8267, kind: 'heritage' },
    { name: 'Jantar Mantar', place: 'Jaipur', lat: 26.9247, lon: 75.8246, kind: 'heritage' },
    { name: 'City Palace, Udaipur', place: 'Udaipur', lat: 24.5764, lon: 73.6835, kind: 'heritage' },
    { name: 'Mehrangarh Fort', place: 'Jodhpur', lat: 26.2979, lon: 73.0187, kind: 'heritage' },
    { name: 'Jaisalmer Fort', place: 'Jaisalmer', lat: 26.9124, lon: 70.9126, kind: 'heritage' },
    { name: 'Kumbhalgarh Fort', place: 'Rajsamand district', lat: 25.1528, lon: 73.587, kind: 'heritage', hidden: true },
    { name: 'Chittorgarh Fort', place: 'Chittorgarh', lat: 24.8887, lon: 74.6469, kind: 'heritage', hidden: true },
    { name: 'Ranthambore National Park', place: 'Sawai Madhopur', lat: 26.0173, lon: 76.5026, kind: 'nature' },
    { name: 'Pushkar Lake', place: 'Pushkar', lat: 26.4897, lon: 74.5511, kind: 'religious' },
    { name: 'Bundi', place: 'Bundi', lat: 25.4492, lon: 75.6414, kind: 'heritage', hidden: true, precision: 'approx', note: 'Hill-town with a fort-palace, stepwells and painted walls; quieter than Jaipur or Udaipur.' }
  ],
  dishes: [
    { id: 'dal-baati-churma', name: 'Dal Baati Churma', scope: 'regional', diet: 'veg', description: 'Hard-baked wheat balls (baati) broken into lentil dal, served with churma — a sweet crumble of coarsely ground wheat, ghee and jaggery or sugar.', ingredients: ['wheat flour', 'lentils', 'ghee', 'jaggery or sugar'], wikiTitle: 'Dal baati churma', imageKind: 'dish' },
    { id: 'laal-maas', name: 'Laal Maas', scope: 'regional', diet: 'non-veg', description: 'A fiery mutton curry coloured red by Mathania or Kashmiri red chillies, associated with Rajput cooking.', ingredients: ['mutton', 'red chilli', 'garlic', 'ghee or mustard oil'], wikiTitle: 'Laal maas', imageKind: 'dish' },
    { id: 'ghewar', name: 'Ghewar', scope: 'regional', diet: 'veg', dietNote: 'Dairy-based (not vegan).', description: 'A disc-shaped honeycomb-textured sweet made from flour batter deep-fried in ghee and soaked in sugar syrup. Associated with the Teej festival season.', wikiTitle: 'Ghevar', imageKind: 'dish' },
    { id: 'pyaaz-kachori', name: 'Pyaaz Kachori', scope: 'regional', diet: 'veg', description: 'Flaky, deep-fried pastry stuffed with spiced onion; associated with Jodhpur and widely eaten across Rajasthan.', wikiTitle: 'Kachori', imageKind: 'dish', note: 'Photo shows kachori generally, not specifically the onion version.' },
    { id: 'gatte-ki-sabzi', name: 'Gatte ki Sabzi', scope: 'regional', diet: 'veg', description: 'Steamed gram-flour dumplings simmered in a yoghurt-based gravy — a staple in a region where fresh vegetables were historically scarce.', ingredients: ['gram flour', 'yoghurt', 'spices'], imageKind: null },
    { id: 'ker-sangri', name: 'Ker Sangri', scope: 'regional', diet: 'veg', description: 'A desert dish of dried ker berries and sangri beans, cooked with spices and often oil or ghee.', imageKind: null },
    { id: 'mirchi-vada', name: 'Mirchi Vada', scope: 'regional', diet: 'veg', description: 'Large green chillies stuffed with spiced potato, dipped in gram-flour batter and fried; a popular snack in Jodhpur.', imageKind: null },
    { id: 'mawa-kachori', name: 'Mawa Kachori', scope: 'regional', diet: 'veg', dietNote: 'Dairy-based (not vegan).', description: 'A sweet kachori stuffed with khoa, nuts and sugar syrup, closely associated with Jodhpur.', imageKind: null }
  ],
  festivals: [
    { name: 'Pushkar Camel Fair', note: 'Held around Kartik Purnima (usually November); dates follow the lunar calendar.' },
    { name: 'Teej', note: 'Monsoon-season festival, associated with ghewar.' },
    { name: 'Jaipur Literature Festival', note: 'Usually held in January; check the festival’s official site for dates.' }
  ],
  emergency: EMERGENCY_INDIA,
  safetyNotes: [
    'Summer heat can be severe; carry water and avoid midday walking at forts.',
    'EKTA does not rate areas as safe or unsafe; check current advisories and agree prices for autos and guides in advance.'
  ],
  sources: [wiki('Rajasthan'), wiki('Rajasthani cuisine'), IN_TOURISM, { label: 'Rajasthan Tourism (official portal)', url: 'https://tourism.rajasthan.gov.in' }],
  review: EDITORIAL_REVIEW
};
