import { buildCosts, COST_ASSUMPTIONS, EMERGENCY_INDIA, wiki, IN_TOURISM, EDITORIAL_REVIEW } from './helpers.js';

export const assam = {
  id: 'assam', type: 'state', tier: 'full', name: 'Assam', country: 'India', countryCode: 'in',
  aliases: ['assam', 'assam india'],
  placeAliases: ['guwahati', 'kaziranga', 'majuli', 'sivasagar', 'dibrugarh', 'jorhat'],
  geocodeQuery: 'Assam, India',
  center: { lat: 26.2006, lon: 92.9376 }, zoom: 7,
  summary: 'A north-eastern Indian state along the Brahmaputra valley, known for tea, one-horned rhinoceros habitat at Kaziranga, river islands and Assamese cultural traditions.',
  character: 'Brahmaputra river culture, tea estates, Vaishnavite satras, Bihu festivals and a cuisine that uses little oil, alkaline khar and fermented flavours.',
  bestTime: {
    summary: 'November to April is the main season; Kaziranga is generally open to visitors from about November to April, while monsoon flooding affects large parts of the state.',
    seasons: [
      { label: 'Main season', months: 'Nov – Apr', note: 'Drier weather; wildlife parks open for the season.' },
      { label: 'Bihu', months: 'Mid-April (Rongali), Jan (Bhogali), Oct (Kongali)', note: 'Rongali Bihu in mid-April is the Assamese New Year.' },
      { label: 'Monsoon', months: 'Jun – Sep', note: 'Heavy rain and annual floods; wildlife parks close or restrict access.' }
    ]
  },
  costFactor: 0.95, costs: buildCosts(0.95), costAssumptions: COST_ASSUMPTIONS,
  etiquette: [
    'Remove shoes at temples, namghars and satras; some Vaishnavite sites have specific rules on dress and entry.',
    'Kamakhya Temple has distinct entry procedures and queues; follow official guidance and avoid unauthorised touts.',
    'Ask before photographing people, rituals and Bihu performances.',
    'At Kaziranga and other parks, follow safari rules: no feeding, no noise, and no leaving vehicles in wildlife areas.',
    'Accept tea or food offered in village homes graciously, but ask before entering and ask about dietary needs.'
  ],
  stories: [
    { title: 'Kaziranga and the one-horned rhino', text: 'Kaziranga National Park is a UNESCO World Heritage Site and holds a large share of the world’s population of the greater one-horned rhinoceros.' },
    { title: 'Majuli', text: 'Majuli, a river island in the Brahmaputra, is known for Vaishnavite satras (monasteries), mask-making and traditional pottery. Erosion has shrunk the island over the decades.' },
    { title: 'Assam tea', text: 'Assam is one of the world’s largest tea-producing regions; Assam tea is a distinct variety (Camellia sinensis var. assamica).' },
    { title: 'Ahom rule', text: 'The Ahom dynasty ruled much of the Brahmaputra valley for about six centuries (13th–19th century); Sivasagar preserves several Ahom monuments.' },
    { title: 'Bihu', text: 'Bihu is a set of Assamese festivals tied to the agricultural year, famous for the Bihu dance and dhol, pepa and gogona music.' }
  ],
  attractions: [
    { name: 'Kaziranga National Park', place: 'Golaghat / Nagaon', lat: 26.5775, lon: 93.1711, kind: 'nature' },
    { name: 'Majuli', place: 'Brahmaputra river island', lat: 26.95, lon: 94.1667, kind: 'heritage', hidden: true, precision: 'approx' },
    { name: 'Kamakhya Temple', place: 'Guwahati', lat: 26.1664, lon: 91.7053, kind: 'religious' },
    { name: 'Umananda Temple', place: 'Guwahati (Peacock Island)', lat: 26.1953, lon: 91.7414, kind: 'religious', hidden: true, precision: 'approx' },
    { name: 'Rang Ghar, Sivasagar', place: 'Sivasagar', lat: 26.9852, lon: 94.636, kind: 'heritage', hidden: true, precision: 'approx', note: 'Ahom-era amphitheatre pavilion.' },
    { name: 'Manas National Park', place: 'Baksa / Chirang', lat: 26.65, lon: 91.0, kind: 'nature', precision: 'approx' },
    { name: 'Pobitora Wildlife Sanctuary', place: 'Morigaon', lat: 26.2167, lon: 92.0333, kind: 'nature', hidden: true, precision: 'approx' },
    { name: 'Hajo', place: 'Kamrup', kind: 'religious', hidden: true, note: 'Locate on the live map — EKTA has not stored verified coordinates.' }
  ],
  dishes: [
    { id: 'masor-tenga', name: 'Masor Tenga', scope: 'regional', diet: 'non-veg', description: 'A light, sour fish curry, usually made with tomato, lemon or elephant apple (outenga) and eaten with rice.', ingredients: ['fish', 'tomato or lemon', 'ginger'], imageKind: null },
    { id: 'khar', name: 'Khar', scope: 'regional', diet: 'varies', dietNote: 'Often vegetarian (raw papaya, pulses), but some versions include fish or meat.', description: 'A distinctive Assamese dish made with an alkaline filtrate (also called khar) derived from sun-dried banana peel ash, often served at the start of a meal.', wikiTitle: 'Khar (food)', imageKind: 'dish' },
    { id: 'assamese-thali', name: 'Assamese Thali', scope: 'regional', diet: 'varies', dietNote: 'Vegetarian and non-vegetarian thalis exist; ask what is included.', description: 'A traditional meal in small bowls: rice, dal, vegetable, a fish or meat dish, khar, pickles and tenga.', imageKind: null },
    { id: 'aloo-pitika', name: 'Aloo Pitika', scope: 'regional', diet: 'veg', description: 'Mashed potato mixed with raw mustard oil, onion, chilli and coriander; a simple staple of Assamese meals.', imageKind: null },
    { id: 'pitha', name: 'Pitha', scope: 'regional', diet: 'veg', dietNote: 'Typically rice-based and eaten at Bihu; some contain dairy or coconut.', description: 'Rice-flour cakes such as til pitha and ghila pitha, made around Bihu festivals.', wikiTitle: 'Pitha', imageKind: 'dish', note: 'Photo shows pitha generally (a family of rice cakes across eastern South Asia), not specifically the Assamese version.' },
    { id: 'duck-curry', name: 'Duck Curry with Ash Gourd', scope: 'regional', diet: 'non-veg', description: 'Duck cooked with ash gourd, associated with festive and ritual meals in parts of Assam.', imageKind: null },
    { id: 'assam-tea', name: 'Assam Tea', scope: 'regional', diet: 'beverage', description: 'Strong black tea from the Brahmaputra valley, drunk with milk or plain. Many estates offer tours and tastings; check availability and booking rules.', wikiTitle: 'Assam tea', imageKind: 'ingredient' }
  ],
  festivals: [
    { name: 'Bohag (Rongali) Bihu', note: 'Assamese New Year, mid-April.' },
    { name: 'Ambubachi Mela', note: 'Held at Kamakhya Temple in June.' },
    { name: 'Majuli Raas Leela', note: 'Vaishnavite performance festival in Majuli, usually in November.' }
  ],
  emergency: EMERGENCY_INDIA,
  safetyNotes: [
    'Monsoon flooding affects large parts of the state each year; check road and rail status.',
    'Use only authorised safari operators in wildlife parks.',
    'EKTA does not rate areas as safe or unsafe; check current advisories for your specific route.'
  ],
  sources: [wiki('Assam'), wiki('Assamese cuisine'), IN_TOURISM, { label: 'Assam Tourism (official portal)', url: 'https://tourism.assam.gov.in' }],
  review: EDITORIAL_REVIEW
};
