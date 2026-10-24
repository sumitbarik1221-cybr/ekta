import { buildCosts, COST_ASSUMPTIONS, EMERGENCY_INDIA, wiki, IN_TOURISM, EDITORIAL_REVIEW } from './helpers.js';

export const jharkhand = {
  id: 'jharkhand', type: 'state', tier: 'full', name: 'Jharkhand', country: 'India', countryCode: 'in',
  aliases: ['jharkhand', 'jharkhand india'],
  placeAliases: ['ranchi', 'jamshedpur', 'deoghar', 'dhanbad', 'bokaro', 'hazaribagh'],
  geocodeQuery: 'Jharkhand, India',
  center: { lat: 23.6102, lon: 85.2799 }, zoom: 7,
  summary: 'An eastern Indian state on the Chota Nagpur Plateau, known for waterfalls, forests, pilgrimage sites and many Adivasi (Indigenous) communities.',
  character: 'Plateau forests and waterfalls, Adivasi cultures, and pilgrimage hills and temples — a state where most travel is nature- and culture-led rather than city-led.',
  bestTime: {
    summary: 'October to March is generally the most comfortable window. Waterfalls are fullest after the monsoon, but access and safety vary.',
    seasons: [
      { label: 'Cooler season', months: 'Oct – Mar', note: 'Pleasant for forests, hills and temple towns.' },
      { label: 'Monsoon', months: 'Jul – Sep', note: 'Waterfalls are at their fullest; roads and viewpoints can be slippery or closed — follow local warnings.' },
      { label: 'Summer', months: 'Apr – Jun', note: 'Hot, especially in the lower plains.' }
    ]
  },
  costFactor: 0.85, costs: buildCosts(0.85), costAssumptions: COST_ASSUMPTIONS,
  etiquette: [
    'Many Adivasi communities hold sacred groves, hills and ritual spaces — ask before entering villages, ceremonies or photographing people.',
    'Remove shoes and dress modestly at temples (e.g. Baidyanath Dham, Deoghar) and Jain pilgrimage sites on Parasnath.',
    'Pilgrimage hills such as Parasnath have specific rules on footwear, food and behaviour — follow signs and trust site staff.',
    'Stay behind barriers at waterfalls; rocks near the edge can be slippery.',
    'If you want to try local rice beer (handia), it is a community drink with its own etiquette; ask locally and follow state rules on alcohol.'
  ],
  stories: [
    { title: 'A state formed in 2000', text: 'Jharkhand was carved out of southern Bihar and became a separate state in November 2000.' },
    { title: 'Adivasi heritage', text: 'The state is home to many Adivasi communities, including the Santhal, Munda and Oraon peoples, each with distinct languages, festivals and crafts.' },
    { title: 'Steel city', text: 'Jamshedpur was developed around the Tata Steel works founded in the early 20th century and is one of India’s planned industrial cities.' },
    { title: 'Sammed Shikharji', text: 'Parasnath Hill (Shikharji) is a major Jain pilgrimage site, associated with the nirvana of several Tirthankaras.' },
    { title: 'Baidyanath Dham', text: 'Deoghar’s Baidyanath Temple is one of the twelve Jyotirlinga shrines in Shaiva tradition and the centre of the Shravani Mela pilgrimage.' }
  ],
  attractions: [
    { name: 'Hundru Falls', place: 'Near Ranchi', lat: 23.4467, lon: 85.6636, kind: 'waterfall', precision: 'approx' },
    { name: 'Betla National Park', place: 'Latehar district', lat: 23.8833, lon: 84.1833, kind: 'nature', precision: 'approx', note: 'Forest reserve with wildlife; entry rules and safari timings are set by park authorities.' },
    { name: 'Netarhat', place: 'Latehar district', lat: 23.4833, lon: 84.2667, kind: 'hill-town', hidden: true, precision: 'approx', note: 'Plateau hill station known for sunrise and sunset viewpoints.' },
    { name: 'Baidyanath Dham', place: 'Deoghar', lat: 24.4922, lon: 86.7002, kind: 'religious' },
    { name: 'Parasnath Hill (Shikharji)', place: 'Giridih district', lat: 23.9619, lon: 86.1303, kind: 'religious', precision: 'approx' },
    { name: 'Dassam Falls', place: 'Near Taimara, Ranchi district', kind: 'waterfall', hidden: true, note: 'Locate on the live map — EKTA has not stored verified coordinates.' },
    { name: 'Jonha Falls (Gautamdhara)', place: 'Ranchi district', kind: 'waterfall', hidden: true, note: 'Locate on the live map — EKTA has not stored verified coordinates.' },
    { name: 'Patratu Valley', place: 'Near Ranchi', kind: 'viewpoint', hidden: true, note: 'Locate on the live map — EKTA has not stored verified coordinates.' }
  ],
  dishes: [
    { id: 'dhuska', name: 'Dhuska', scope: 'regional', diet: 'veg', description: 'A deep-fried disc made from a batter of rice and lentils, commonly eaten with ghugni or a spiced potato curry.', ingredients: ['rice', 'lentils (chana dal)'], wikiTitle: 'Dhuska', imageKind: 'dish' },
    { id: 'chilka-roti', name: 'Chilka Roti', scope: 'regional', diet: 'veg', description: 'A flatbread made from a batter of rice flour and ground chana dal.', ingredients: ['rice flour', 'chana dal'], imageKind: null },
    { id: 'rugra', name: 'Rugra', scope: 'regional', diet: 'veg', description: 'A wild mushroom found in the forests and sold in markets during the monsoon, usually cooked as a curry. Foraged mushrooms are seasonal and not always available.', imageKind: null },
    { id: 'pittha', name: 'Pittha', scope: 'regional', diet: 'varies', dietNote: 'Sweet and savoury versions exist. Ask what the filling is.', description: 'Steamed or fried rice-flour dumplings with sweet or savoury fillings, especially popular around winter harvest festivals.', ingredients: ['rice flour', 'filling varies'], wikiTitle: 'Pitha', imageKind: 'dish', note: 'Photo shows pitha generally (a family of rice cakes across eastern South Asia), not specifically the Jharkhand version.' },
    { id: 'thekua', name: 'Thekua', scope: 'shared', sharedWith: ['Bihar', 'eastern Uttar Pradesh'], diet: 'veg', description: 'A crisp, sweet cookie of wheat flour, jaggery and ghee, associated with Chhath Puja and found across Jharkhand, Bihar and eastern Uttar Pradesh.', ingredients: ['wheat flour', 'jaggery', 'ghee'], wikiTitle: 'Thekua', imageKind: 'dish' },
    { id: 'litti-chokha', name: 'Litti Chokha', scope: 'shared', sharedWith: ['Bihar', 'eastern Uttar Pradesh'], diet: 'veg', dietNote: 'Typically vegetarian (sattu-stuffed bread with mashed vegetables); some places serve it with meat curries.', description: 'Roasted wheat-flour balls stuffed with spiced roasted gram flour (sattu), served with chokha (mashed roasted vegetables). Popular across the Bhojpuri-Magahi belt, including Jharkhand.', wikiTitle: 'Litti chokha', imageKind: 'dish' },
    { id: 'handia', name: 'Handia (rice beer)', scope: 'regional', diet: 'beverage', dietNote: 'Alcoholic traditional drink. Optional; follow local rules and drink responsibly.', description: 'A fermented rice drink prepared by several Adivasi communities, often tied to festivals and community rituals.', imageKind: null }
  ],
  festivals: [
    { name: 'Sarhul', note: 'Spring festival of the Oraon, Munda and other communities worshipping the sal tree; held in March–April.' },
    { name: 'Karma', note: 'Harvest festival celebrated in the monsoon season.' },
    { name: 'Shravani Mela (Deoghar)', note: 'Monsoon-season pilgrimage to Baidyanath Dham.' }
  ],
  emergency: EMERGENCY_INDIA,
  safetyNotes: [
    'Waterfalls and forest roads can be dangerous in the monsoon; follow local warnings.',
    'EKTA does not rate areas as safe or unsafe; check current state and central government advisories for your route.'
  ],
  sources: [wiki('Jharkhand'), wiki('Dhuska'), IN_TOURISM, { label: 'Jharkhand Tourism (official portal)', url: 'https://www.jharkhandtourism.gov.in' }],
  review: EDITORIAL_REVIEW
};
