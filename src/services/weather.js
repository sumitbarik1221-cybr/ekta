import { getJSON } from './http.js';

// Open-Meteo: free, no API key for non-commercial use. https://open-meteo.com
const WMO = { 0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Rime fog',51:'Light drizzle',53:'Drizzle',55:'Dense drizzle',56:'Freezing drizzle',57:'Heavy freezing drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',66:'Freezing rain',67:'Heavy freezing rain',71:'Light snow',73:'Snow',75:'Heavy snow',77:'Snow grains',80:'Light showers',81:'Showers',82:'Violent showers',85:'Snow showers',86:'Heavy snow showers',95:'Thunderstorm',96:'Thunderstorm with hail',99:'Severe thunderstorm with hail' };
export const describeWeather = code => WMO[code] || 'Conditions unavailable';

export async function fetchWeather(lat, lon, { signal } = {}) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('No coordinates');
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`;
  const d = await getJSON(url, { signal });
  if (!d?.current) throw new Error('Weather response missing current conditions');
  return { current: d.current, daily: d.daily, timezone: d.timezone, fetchedAt: new Date().toISOString(), lat, lon, source: 'Open-Meteo' };
}

/** Practical advice derived ONLY from the live numbers (not from guesses about the destination). */
export function weatherAdvice(w) {
  if (!w?.current) return [];
  const c = w.current, tips = [];
  if (c.apparent_temperature >= 35) tips.push('It feels very hot right now — carry water and plan outdoor sights for early morning or evening.');
  else if (c.apparent_temperature <= 5) tips.push('It feels very cold right now — bring warm layers.');
  if (c.precipitation > 0 || [51,53,55,61,63,65,80,81,82,95,96,99].includes(c.weather_code)) tips.push('Rain is falling or likely — carry a rain jacket and check road and trail conditions.');
  if (c.wind_speed_10m >= 35) tips.push('Strong wind — be careful near viewpoints, water and boats.');
  const maxRain = Math.max(...(w.daily?.precipitation_probability_max || [0]));
  if (maxRain >= 60) tips.push(`Rain probability reaches ${maxRain}% in the next few days — keep some indoor options.`);
  return tips;
}
