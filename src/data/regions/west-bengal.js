import { buildCosts, COST_ASSUMPTIONS, EMERGENCY_INDIA, wiki, IN_TOURISM, EDITORIAL_REVIEW } from './helpers.js';

// West Bengal (India). NOT Bangladesh — see bangladesh.js. "Bengal" is ambiguous and is
// resolved to this record with an explicit disambiguation notice (see index.js).
export const westBengal = {
  id: 'west-bengal',
  type: 'state',
  tier: 'full',
  name: 'West Bengal',
  country: 'India',
  countryCode: 'in',
  aliases: ['west bengal', 'bengal', 'paschim banga', 'paschimbanga', 'wb', 'west bengal india', 'west bengal state'],
  placeAliases: ['darjeeling', 'siliguri', 'sundarbans', 'howrah', 'santiniketan', 'shantiniketan', 'bishnupur', 'kalimpong', 'murshidabad', 'digha', 'mayapur'],
  geocodeQuery: 'West Bengal, India',
  center: { lat: 22.9868, lon: 87.855 },
  zoom: 7,
  summary: 'An eastern Indian state running from the Himalayan foothills at Darjeeling to the Bay of Bengal and the Sundarbans delta, with Kolkata as its capital.',
  character: 'Bengali literature, theatre and the arts; river-delta landscapes; colonial-era Kolkata; and a cuisine built around rice, fish, mustard and sweets made from milk.',
  bestTime: {
    summary: 'October to March is the most comfortable window across much of the state. The Himalayan north and the Sundarbans follow their own seasons.',
    seasons: [
      { label: 'Kolkata & the plains', months: 'Oct – Feb', note: 'Cooler, drier weather. Durga Puja usually falls in late September or October (dates follow the lunar calendar).' },
      { label: 'Darjeeling & Kalimpong hills', months: 'Mar – May, Oct – Nov', note: 'Clearer mountain views in spring and post-monsoon. Monsoon brings heavy rain and landslide risk on hill roads.' },
      { label: 'Sundarbans', months: 'Nov – Feb', note: 'Milder weather for boat trips. Access is by permit and authorised boats only.' },
      { label: 'Avoid if you can', months: 'Apr – Jun (plains), Jun – Sep (everywhere)', note: 'Hot, humid pre-monsoon heat in the plains; heavy monsoon rain and flooding risk.' }
    ]
  },
  costFactor: 1.0,
  costs: buildCosts(1.0),
  costAssumptions: COST_ASSUMPTIONS,
  etiquette: [
    'Remove shoes before entering temples, mosques, gurdwaras and most homes; follow posted signs at Dakshineswar, Belur Math and other religious sites.',
    'Dress modestly at religious sites — shoulders and knees covered is a safe default.',
    'Ask before photographing people, rituals and idol-makers at work; rules on photography inside temples differ from site to site.',
    'In the Himalayan hills, Buddhist monasteries and stupas are walked around clockwise; do not touch prayer wheels with the left hand or climb on stupas.',
    'During Durga Puja, pandals draw very large crowds in the evenings — keep valuables secure and follow crowd-management instructions.',
    'Bengali cooking uses fish stock, fish and mustard oil widely. Vegetarian visitors should say so explicitly and ask how a dish is prepared.',
    'In the Sundarbans, use only licensed boats and guides, keep to permitted routes, and do not leave the boat in tiger habitat.'
  ],
  stories: [
    { title: 'Capital of British India', text: 'Kolkata (then Calcutta) was the capital of British India until the capital moved to Delhi in 1911.' },
    { title: 'Tagore and Santiniketan', text: 'Rabindranath Tagore, from a Kolkata family, won the Nobel Prize in Literature in 1913. The university town of Santiniketan he helped shape was inscribed as a UNESCO World Heritage Site in 2023.' },
    { title: 'Durga Puja on the UNESCO list', text: 'Durga Puja in Kolkata was inscribed on UNESCO’s Representative List of the Intangible Cultural Heritage of Humanity in 2021.' },
    { title: 'A delta forest shared with Bangladesh', text: 'The Sundarbans is the world’s largest mangrove forest, shared between India and Bangladesh. The Indian Sundarbans National Park is a UNESCO World Heritage Site and a habitat of the Bengal tiger.' },
    { title: 'A toy train on the roof of Bengal', text: 'The Darjeeling Himalayan Railway, a narrow-gauge line opened in the late 19th century, is a UNESCO World Heritage Site.' },
    { title: 'Terracotta temples of Bishnupur', text: 'Bishnupur is known for brick-and-terracotta temples built under the Malla rulers, decorated with panels showing epic and everyday scenes.' },
    { title: 'Murshidabad, a Nawabi capital', text: 'Murshidabad served as the capital of Bengal under the Nawabs in the 18th century; the nearby Plassey battlefield is where the 1757 Battle of Plassey was fought.' },
    { title: 'Who owns the rasgulla?', text: 'West Bengal received a Geographical Indication tag for “Banglar Rasogolla” in 2017, after a public dispute with Odisha over the sweet’s origins. Both states have long traditions of making it.' },
    { title: 'Kolkata’s trams', text: 'Kolkata is home to India’s only tram network (first run with horses in 1873). Routes have been reduced in recent years, so check what is currently running.' }
  ],
  attractions: [
    { name: 'Victoria Memorial', place: 'Kolkata', lat: 22.5448, lon: 88.3426, kind: 'museum', note: 'Marble museum and gardens on the Maidan, devoted to the colonial period.' },
    { name: 'Howrah Bridge', place: 'Kolkata', lat: 22.5851, lon: 88.3468, kind: 'landmark', note: 'Cantilever bridge over the Hooghly; best seen from the river ghats.' },
    { name: 'Dakshineswar Kali Temple', place: 'Kolkata', lat: 22.6553, lon: 88.3573, kind: 'religious', note: 'Major Kali temple on the Hooghly’s east bank.' },
    { name: 'Belur Math', place: 'Howrah', lat: 22.632, lon: 88.355, kind: 'religious', note: 'Headquarters of the Ramakrishna Math and Mission, on the Hooghly’s west bank.' },
    { name: 'Indian Museum', place: 'Kolkata', lat: 22.558, lon: 88.351, kind: 'museum', note: 'One of India’s oldest museums, with natural history and archaeology galleries.' },
    { name: 'Bishnupur terracotta temples', place: 'Bishnupur', lat: 23.075, lon: 87.319, kind: 'heritage', hidden: true, note: 'Malla-era temple complex known for terracotta panels.' },
    { name: 'Santiniketan', place: 'Birbhum', lat: 23.683, lon: 87.685, kind: 'heritage', hidden: true, note: 'University town associated with Tagore; also known for Poush Mela and Basanta Utsav festivals.' },
    { name: 'Hazarduari Palace', place: 'Murshidabad', lat: 24.113, lon: 88.266, kind: 'heritage', hidden: true, note: 'Nawabi-era palace-museum beside the Bhagirathi river.' },
    { name: 'Sundarbans National Park', place: 'South 24 Parganas', lat: 21.95, lon: 88.9, kind: 'nature', precision: 'approx', note: 'Mangrove delta and tiger reserve; visits need permits and licensed boats.' },
    { name: 'Batasia Loop, Darjeeling', place: 'Darjeeling', lat: 27.0258, lon: 88.253, kind: 'viewpoint', precision: 'approx', note: 'Railway spiral on the Darjeeling Himalayan Railway with mountain views on clear days.' },
    { name: 'Kalimpong', place: 'Kalimpong', lat: 27.0594, lon: 88.4695, kind: 'hill-town', hidden: true, note: 'Quieter hill town with monasteries, nurseries and viewpoints.' },
    { name: 'Sandakphu', place: 'Darjeeling district', lat: 27.1058, lon: 88.0, kind: 'trek', hidden: true, precision: 'approx', note: 'High trekking destination on the Singalila ridge; weather and permit rules apply.' },
    { name: 'Mayapur', place: 'Nadia', lat: 23.4231, lon: 88.3883, kind: 'religious', hidden: true, note: 'Pilgrimage town on the Ganga with a large ISKCON temple complex.' },
    { name: 'Cooch Behar Palace', place: 'Cooch Behar', lat: 26.325, lon: 89.443, kind: 'heritage', hidden: true, precision: 'approx', note: '19th-century palace of the Cooch Behar princely state.' }
  ],
  dishes: [
    { id: 'kosha-mangsho', name: 'Kosha Mangsho', scope: 'regional', diet: 'non-veg', description: 'Mutton slow-cooked over low heat with onions, spices and mustard oil until the gravy turns thick and dark. Traditionally served with luchi or rice.', ingredients: ['mutton', 'onion', 'mustard oil', 'spices'], wikiTitle: 'Kosha mangsho', imageKind: 'dish' },
    { id: 'shorshe-ilish', name: 'Shorshe Ilish', scope: 'regional', diet: 'non-veg', description: 'Hilsa (ilish) fish cooked in a pungent mustard-seed paste, often steamed (bhapa) or lightly simmered. A signature Bengali fish dish, seasonal around the monsoon.', ingredients: ['hilsa fish', 'mustard paste', 'green chilli', 'mustard oil'], variations: 'Contains many fine bones. Availability and price peak with the hilsa season.', wikiTitle: 'Ilish', imageKind: 'ingredient' },
    { id: 'mishti-doi', name: 'Mishti Doi', scope: 'regional', diet: 'veg', dietNote: 'Dairy-based (not vegan).', description: 'Sweetened, caramelised yoghurt set in earthen pots, which thicken it and add a mild earthy aroma.', ingredients: ['milk', 'sugar or date-palm jaggery', 'culture'], wikiTitle: 'Mishti doi', imageKind: 'dish' },
    { id: 'sandesh', name: 'Sandesh', scope: 'regional', diet: 'veg', dietNote: 'Dairy-based (not vegan).', description: 'A delicate sweet made from fresh chhena (curdled milk) and sugar, often moulded into shapes. In winter, versions with nolen gur (date-palm jaggery) are a seasonal favourite.', ingredients: ['chhena', 'sugar or jaggery'], wikiTitle: 'Sandesh (confectionery)', imageKind: 'dish' },
    { id: 'rosogolla', name: 'Rosogolla', scope: 'regional', diet: 'veg', dietNote: 'Dairy-based (not vegan).', description: 'Soft chhena balls simmered in light sugar syrup. West Bengal holds a GI tag for “Banglar Rasogolla”; neighbouring Odisha has its own distinct tradition.', ingredients: ['chhena', 'sugar syrup'], wikiTitle: 'Rasgulla', imageKind: 'dish' },
    { id: 'luchi-alur-dom', name: 'Luchi with Alur Dom', scope: 'regional', diet: 'veg', dietNote: 'Typically vegetarian; some households and shops use onion and garlic, others do not.', description: 'Puffed, deep-fried white-flour bread (luchi) served with a spiced baby-potato curry (alur dom). A classic Bengali breakfast and festive meal.', ingredients: ['refined flour', 'potato', 'spices'], wikiTitle: 'Luchi', imageKind: 'dish' },
    { id: 'ghugni', name: 'Ghugni', scope: 'regional', diet: 'varies', dietNote: 'Usually a yellow-pea curry. Some stalls add egg or meat — ask the vendor.', description: 'A spiced dried-yellow-pea curry eaten as a snack or breakfast, commonly topped with onion, chilli and lime from street vendors.', ingredients: ['dried yellow peas', 'spices'], wikiTitle: 'Ghugni', imageKind: 'dish' },
    { id: 'shukto', name: 'Shukto', scope: 'regional', diet: 'veg', dietNote: 'Typically vegetarian. Recipes differ between households — ask if you avoid dairy or specific ingredients.', description: 'A mildly bitter mixed-vegetable stew traditionally served at the start of a Bengali meal; bitter gourd is the classic note.', ingredients: ['bitter gourd', 'mixed vegetables', 'milk (in many recipes)', 'mustard or poppy seed (varies)'], wikiTitle: 'Shukto', imageKind: 'dish' },
    { id: 'chingri-malai-curry', name: 'Chingri Malaikari', scope: 'regional', diet: 'non-veg', description: 'Prawns (often large river or freshwater prawns) cooked in a coconut-milk gravy with mild spices.', ingredients: ['prawns', 'coconut milk', 'spices'], wikiTitle: 'Chingri malai curry', imageKind: 'dish' },
    { id: 'patishapta', name: 'Patishapta', scope: 'regional', diet: 'veg', dietNote: 'Dairy-based (not vegan).', description: 'Thin crepes filled with coconut and jaggery or reduced milk, associated with the winter harvest festival of Poush Sankranti.', ingredients: ['rice flour / semolina', 'coconut', 'jaggery or khoa'], wikiTitle: 'Patishapta', imageKind: 'dish' }
  ],
  festivals: [
    { name: 'Durga Puja', note: 'Late September–October; dates follow the lunar calendar. Kolkata’s neighbourhood pandals and idol-making districts are central.' },
    { name: 'Poush Mela (Santiniketan)', note: 'Held in winter (Poush month, late December), with Baul music and crafts.' },
    { name: 'Poila Boishakh', note: 'Bengali New Year, mid-April.' }
  ],
  emergency: EMERGENCY_INDIA,
  safetyNotes: [
    'Monsoon rain can cause flooding in the plains and landslides on hill roads (including around Darjeeling). Check road and rail status before travelling.',
    'Sundarbans and national-park visits require permits and authorised guides.',
    'EKTA does not make claims about whether specific areas are safe or unsafe; check your government’s travel advisory and local police guidance.'
  ],
  sources: [wiki('West Bengal'), wiki('Cuisine of West Bengal', 'Cuisine of West Bengal — Wikipedia'), IN_TOURISM, { label: 'West Bengal Tourism (official portal)', url: 'https://www.wbtourismgov.in' }],
  review: EDITORIAL_REVIEW
};

// Kolkata is a CITY record nested under West Bengal. Dishes here are the ones Kolkata is
// particularly associated with; statewide dishes appear separately as "across West Bengal".
export const kolkata = {
  id: 'kolkata',
  type: 'city',
  tier: 'full',
  parentId: 'west-bengal',
  name: 'Kolkata',
  country: 'India',
  countryCode: 'in',
  aliases: ['kolkata', 'calcutta', 'kolkata west bengal', 'kolkata india'],
  geocodeQuery: 'Kolkata, West Bengal, India',
  center: { lat: 22.5726, lon: 88.3639 },
  zoom: 12,
  summary: 'The capital of West Bengal on the Hooghly river: a former colonial capital with a dense mix of heritage buildings, bookshops, tea houses, street food and festivals.',
  character: 'A city of adda (long conversations), literature, theatre and film, historic markets and riverside ghats — and one of India’s best-known street-food cities.',
  bestTime: {
    summary: 'October to February has the most comfortable weather. Summers are hot and humid and the monsoon brings heavy downpours and waterlogging.',
    seasons: [
      { label: 'Cooler season', months: 'Oct – Feb', note: 'Pleasant days; Durga Puja crowds peak around the festival dates.' },
      { label: 'Pre-monsoon heat', months: 'Apr – Jun', note: 'Hot and humid.' },
      { label: 'Monsoon', months: 'Jun – Sep', note: 'Heavy rain; some streets waterlog.' }
    ]
  },
  costFactor: 1.0,
  costs: buildCosts(1.0),
  costAssumptions: COST_ASSUMPTIONS,
  etiquette: [
    'Remove footwear and dress modestly in temples and religious sites such as Dakshineswar and Belur Math.',
    'Ask before photographing people, ghat rituals and idol-makers in Kumartuli.',
    'Keep valuables secure in crowded places — College Street, New Market and Durga Puja pandals.',
    'Vegetarian visitors should state this clearly: fish, fish stock and egg appear in many street and home dishes.'
  ],
  stories: [
    { title: 'Capital until 1911', text: 'Calcutta served as the capital of British India until the capital was moved to Delhi in 1911.' },
    { title: 'College Street, the book street', text: 'College Street is a long-established secondhand and academic book market near Presidency University and the University of Calcutta.' },
    { title: 'Durga Puja on UNESCO’s list', text: 'Durga Puja in Kolkata was inscribed on UNESCO’s Intangible Cultural Heritage list in 2021.' },
    { title: 'Kumartuli idol makers', text: 'Kumartuli is the north Kolkata neighbourhood where clay idols for Durga Puja and other festivals are made by hereditary artisans.' },
    { title: 'India’s tram city', text: 'Kolkata runs the only tram network in India; services have been scaled back, so check which routes operate.' }
  ],
  attractions: [
    { name: 'Victoria Memorial', place: 'Maidan', lat: 22.5448, lon: 88.3426, kind: 'museum' },
    { name: 'Howrah Bridge', place: 'Howrah / Kolkata', lat: 22.5851, lon: 88.3468, kind: 'landmark' },
    { name: 'Indian Museum', place: 'Chowringhee', lat: 22.558, lon: 88.351, kind: 'museum' },
    { name: 'St. Paul’s Cathedral', place: 'Maidan', lat: 22.5445, lon: 88.3465, kind: 'religious' },
    { name: 'College Street book market', place: 'College Street', lat: 22.5745, lon: 88.3639, kind: 'market', hidden: true, precision: 'approx' },
    { name: 'New Market (Hogg Market)', place: 'Esplanade', lat: 22.5603, lon: 88.3515, kind: 'market' },
    { name: 'Kumartuli', place: 'North Kolkata', lat: 22.599, lon: 88.364, kind: 'craft', hidden: true, precision: 'approx', note: 'Clay-idol makers’ neighbourhood; busiest before festivals.' },
    { name: 'Jorasanko Thakur Bari', place: 'North Kolkata', lat: 22.5836, lon: 88.359, kind: 'heritage', hidden: true, precision: 'approx', note: 'Ancestral home of the Tagore family.' },
    { name: 'Dakshineswar Kali Temple', place: 'North of the city', lat: 22.6553, lon: 88.3573, kind: 'religious' },
    { name: 'Belur Math', place: 'Howrah', lat: 22.632, lon: 88.355, kind: 'religious' }
  ],
  dishes: [
    { id: 'kati-roll', name: 'Kati Roll', scope: 'city', diet: 'varies', dietNote: 'Fillings include egg, chicken, mutton and paneer. Vegetarians should choose paneer or vegetable and confirm it is not cooked on shared surfaces.', description: 'A paratha wrapped around kebab-style fillings; commonly linked with Kolkata street food.', ingredients: ['paratha', 'kebab or paneer filling', 'onion', 'sauces'], wikiTitle: 'Kati roll', imageKind: 'dish' },
    { id: 'puchka', name: 'Puchka (Phuchka)', scope: 'city', diet: 'veg', dietNote: 'Usually vegetarian. The tamarind water and fillings differ by vendor — ask about ingredients.', description: 'Crisp hollow shells filled with spiced potato and chickpeas and dipped in tangy tamarind water. Kolkata’s name for what is called pani puri elsewhere.', ingredients: ['semolina or wheat shells', 'potato', 'chickpeas', 'tamarind water'], wikiTitle: 'Pani puri', imageKind: 'dish' },
    { id: 'jhalmuri', name: 'Jhalmuri', scope: 'city', diet: 'veg', dietNote: 'Usually vegetarian; mustard oil is typical.', description: 'Puffed rice tossed with mustard oil, chilli, onion and spices — a roadside and Maidan snack.', ingredients: ['puffed rice', 'mustard oil', 'onion', 'spices'], wikiTitle: 'Jhalmuri', imageKind: 'dish' },
    { id: 'kolkata-biryani', name: 'Kolkata Biryani', scope: 'city', diet: 'non-veg', dietNote: 'Usually non-vegetarian; some shops serve egg or vegetable biryani.', description: 'A lighter-spiced biryani known for the addition of potato alongside meat. It descends from the Awadhi tradition associated with the exile of the Nawab Wajid Ali Shah to Kolkata.', ingredients: ['rice', 'meat (mutton or chicken)', 'potato', 'saffron or kewra'], wikiTitle: 'Kolkata biryani', imageKind: 'dish' },
    { id: 'rosogolla-city', name: 'Rosogolla', scope: 'regional', diet: 'veg', dietNote: 'Dairy-based (not vegan).', description: 'Chhena balls in sugar syrup — made across West Bengal, and sold in sweet shops throughout Kolkata.', wikiTitle: 'Rasgulla', imageKind: 'dish' }
  ],
  festivals: westBengal.festivals,
  emergency: EMERGENCY_INDIA,
  safetyNotes: [
    'Large crowds around Durga Puja and on public transport: keep valuables secure.',
    'EKTA does not rate areas as safe or unsafe; check current advisories and local police guidance.'
  ],
  sources: [wiki('Kolkata'), wiki('Street food of Kolkata', 'Street food of Kolkata — Wikipedia'), IN_TOURISM],
  review: EDITORIAL_REVIEW
};
