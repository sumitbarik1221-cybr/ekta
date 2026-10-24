import { buildCosts, COST_ASSUMPTIONS, EMERGENCY_INDIA, wiki, IN_TOURISM, EDITORIAL_REVIEW } from './helpers.js';

export const kerala = {
  id: 'kerala', type: 'state', tier: 'full', name: 'Kerala', country: 'India', countryCode: 'in',
  aliases: ['kerala', 'kerala india', 'god’s own country', 'gods own country'],
  placeAliases: ['kochi', 'cochin', 'munnar', 'alleppey', 'alappuzha', 'thiruvananthapuram', 'trivandrum', 'wayanad', 'varkala', 'kovalam', 'thekkady'],
  geocodeQuery: 'Kerala, India',
  center: { lat: 10.8505, lon: 76.2711 }, zoom: 7,
  summary: 'A south-western Indian state between the Western Ghats and the Arabian Sea, known for backwaters, spice and tea hills, Malayalam culture and a long maritime trading history.',
  character: 'Backwaters and coast, hill plantations, temple festivals and a cuisine built on coconut, rice, spices and seafood.',
  bestTime: {
    summary: 'October to March is the usual visiting season. The monsoon (June–September) is green and cheaper but wet; some beaches and boat services scale back.',
    seasons: [
      { label: 'Main season', months: 'Oct – Mar', note: 'Drier, more comfortable weather for backwaters, beaches and hills.' },
      { label: 'Hills (Munnar, Wayanad)', months: 'Sep – Mar', note: 'Cooler; mist and rain are common during the monsoon.' },
      { label: 'Monsoon', months: 'Jun – Sep', note: 'Heavy rain; popular for Ayurvedic stays and lush scenery, but some activities pause.' }
    ]
  },
  costFactor: 1.15, costs: buildCosts(1.15), costAssumptions: COST_ASSUMPTIONS,
  etiquette: [
    'Remove shoes and follow dress rules at temples; some (e.g. Padmanabhaswamy in Thiruvananthapuram) have strict traditional dress codes and may restrict entry — check before going.',
    'Many Kerala temples allow only Hindus; churches and mosques generally welcome respectful visitors outside services.',
    'Beach and houseboat etiquette: dress modestly away from tourist beaches, and ask before photographing local fishing communities.',
    'Backwater houseboats vary in quality and environmental practice; prefer operators that manage waste responsibly.',
    'Vegetarian visitors: many dishes use coconut oil and fish may be served alongside a "vegetarian" meal — ask.'
  ],
  stories: [
    { title: 'A spice-trade coast', text: 'Kerala’s Malabar coast was a major centre of the spice trade for centuries, drawing Arab, Chinese, Portuguese, Dutch and British traders.' },
    { title: 'Fort Kochi', text: 'Fort Kochi preserves Portuguese, Dutch and British-era buildings alongside the Chinese fishing nets that line the waterfront.' },
    { title: 'Backwaters', text: 'Kerala’s backwaters are a network of lagoons, lakes and canals running parallel to the Arabian Sea coast, with the Alappuzha–Kumarakom area the best known for houseboats.' },
    { title: 'Kathakali and Theyyam', text: 'Kathakali is a classical dance-drama of Kerala; Theyyam, a ritual performance tradition of northern Kerala, is performed mainly in winter months at shrines.' },
    { title: 'High literacy and Malayalam culture', text: 'Kerala consistently ranks among the highest Indian states in literacy; Malayalam has a classical-language status granted in 2013.' }
  ],
  attractions: [
    { name: 'Alappuzha backwaters', place: 'Alappuzha', lat: 9.4981, lon: 76.3388, kind: 'nature' },
    { name: 'Fort Kochi', place: 'Kochi', lat: 9.9658, lon: 76.2421, kind: 'heritage' },
    { name: 'Munnar', place: 'Idukki district', lat: 10.0889, lon: 77.0595, kind: 'hill-town' },
    { name: 'Athirappilly Falls', place: 'Thrissur district', lat: 10.285, lon: 76.57, kind: 'waterfall' },
    { name: 'Varkala Cliff', place: 'Varkala', lat: 8.7379, lon: 76.7163, kind: 'beach' },
    { name: 'Padmanabhaswamy Temple', place: 'Thiruvananthapuram', lat: 8.4828, lon: 76.9436, kind: 'religious', note: 'Strict dress code and entry rules — check before going.' },
    { name: 'Edakkal Caves', place: 'Wayanad', lat: 11.6258, lon: 76.2354, kind: 'heritage', hidden: true, precision: 'approx', note: 'Rock shelters with ancient carvings; requires a short climb.' },
    { name: 'Kumarakom', place: 'Kottayam district', lat: 9.6175, lon: 76.4297, kind: 'nature', hidden: true },
    { name: 'Bekal Fort', place: 'Kasaragod', lat: 12.3926, lon: 75.0339, kind: 'heritage', hidden: true },
    { name: 'Kovalam', place: 'Thiruvananthapuram', lat: 8.4004, lon: 76.9787, kind: 'beach' }
  ],
  dishes: [
    { id: 'sadya', name: 'Sadya', scope: 'regional', diet: 'veg', description: 'A festive vegetarian feast served on a banana leaf, with rice and many accompaniments such as sambar, avial, thoran and payasam. Central to Onam.', ingredients: ['rice', 'vegetables', 'coconut', 'lentils'], wikiTitle: 'Sadya', imageKind: 'dish' },
    { id: 'appam-stew', name: 'Appam with Stew', scope: 'regional', diet: 'varies', dietNote: 'The stew can be vegetable, chicken or mutton. Ask which is served.', description: 'Lacy fermented rice-and-coconut pancakes with a mildly spiced coconut-milk stew.', wikiTitle: 'Appam', imageKind: 'dish', note: 'Photo shows appam, not necessarily with stew.' },
    { id: 'puttu-kadala', name: 'Puttu and Kadala Curry', scope: 'regional', diet: 'veg', description: 'Steamed cylinders of ground rice layered with coconut, served with a black-chickpea curry — a common breakfast.', wikiTitle: 'Puttu', imageKind: 'dish', note: 'Photo shows puttu, not necessarily with kadala curry.' },
    { id: 'karimeen-pollichathu', name: 'Karimeen Pollichathu', scope: 'regional', diet: 'non-veg', description: 'Pearl spot fish (karimeen), a speciality of the backwaters, marinated in spices, wrapped in banana leaf and pan-cooked.', ingredients: ['pearl spot fish', 'spices', 'banana leaf'], imageKind: null },
    { id: 'meen-curry', name: 'Kerala Fish Curry', scope: 'regional', diet: 'non-veg', description: 'Fish simmered in a tangy, spicy gravy; many versions use kodampuli (Malabar tamarind) and coconut oil.', imageKind: null },
    { id: 'malabar-biryani', name: 'Malabar (Thalassery) Biryani', scope: 'regional', diet: 'non-veg', dietNote: 'Typically made with chicken, mutton or fish; vegetarian versions are less typical.', description: 'A fragrant biryani from the Malabar region in northern Kerala, usually made with short-grain rice.', imageKind: null },
    { id: 'payasam', name: 'Payasam', scope: 'regional', diet: 'veg', dietNote: 'Often made with milk or coconut milk, depending on the recipe.', description: 'A sweet pudding served at festivals and feasts; varieties include ada pradhaman and paal payasam.', wikiTitle: 'Payasam', imageKind: 'dish' },
    { id: 'banana-chips', name: 'Banana Chips', scope: 'regional', diet: 'veg', description: 'Crisp slices of raw banana fried in coconut oil, sold in bakeries and snack shops across Kerala.', imageKind: null }
  ],
  festivals: [
    { name: 'Onam', note: 'Harvest festival in August–September, known for sadya and boat races such as Nehru Trophy Boat Race.' },
    { name: 'Thrissur Pooram', note: 'A temple festival with caparisoned elephants, held in April–May.' },
    { name: 'Theyyam season', note: 'Mostly November–May at shrines in northern Kerala.' }
  ],
  emergency: EMERGENCY_INDIA,
  safetyNotes: [
    'Monsoon flooding and landslides can affect hill roads (including Wayanad and Idukki). Check local warnings.',
    'Sea conditions: follow lifeguard and flag signs; rip currents occur at several beaches.',
    'EKTA does not rate areas as safe or unsafe; check official advisories.'
  ],
  sources: [wiki('Kerala'), wiki('Cuisine of Kerala'), IN_TOURISM, { label: 'Kerala Tourism (official portal)', url: 'https://www.keralatourism.org' }],
  review: EDITORIAL_REVIEW
};
