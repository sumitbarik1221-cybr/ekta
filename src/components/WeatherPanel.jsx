import React from 'react';
import { CloudSun, Wind, ThermometerSun, RefreshCw } from 'lucide-react';
import { describeWeather, weatherAdvice } from '../services/weather.js';

export default function WeatherPanel({ name, state, onRetry }) {
  const { status, data } = state;
  const day = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short' });
  return (
    <div className="weather-panel">
      <div className="panel-title"><div><span className="kicker">LIVE WEATHER</span><h3>Right now in {name}</h3></div><CloudSun size={22} aria-hidden="true" /></div>
      {status === 'loading' && <p className="ek-muted" role="status">Loading live weather…</p>}
      {status === 'error' && <div role="alert"><p className="muted">Live weather could not be loaded, so none is shown. EKTA never substitutes sample weather.</p><button className="secondary-button" type="button" onClick={onRetry}><RefreshCw size={14} /> Try again</button></div>}
      {status === 'ok' && data && <>
        <div className="weather-current">
          <div><strong>{Math.round(data.current.temperature_2m)}°</strong><small>{describeWeather(data.current.weather_code)} · feels like {Math.round(data.current.apparent_temperature)}°C</small></div>
          <div className="weather-metrics"><span><Wind size={14} /> {data.current.wind_speed_10m} km/h wind</span><span><ThermometerSun size={14} /> {data.current.relative_humidity_2m}% humidity</span></div>
        </div>
        <ul className="ek-forecast" aria-label="Five-day forecast">
          {data.daily.time.map((t, i) => <li key={t}><b>{i === 0 ? 'Today' : day(t)}</b><span>{Math.round(data.daily.temperature_2m_max[i])}° / {Math.round(data.daily.temperature_2m_min[i])}°</span><small>{describeWeather(data.daily.weather_code[i])}{data.daily.precipitation_probability_max[i] != null ? ` · ${data.daily.precipitation_probability_max[i]}% rain` : ''}</small></li>)}
        </ul>
        {weatherAdvice(data).length > 0 && <ul className="ek-advice">{weatherAdvice(data).map(t => <li key={t}>{t}</li>)}</ul>}
        <small className="source-note">Live data by Open-Meteo · fetched {new Date(data.fetchedAt).toLocaleTimeString()} for {data.lat.toFixed(2)}, {data.lon.toFixed(2)}. A forecast is not a safety warning.</small>
      </>}
    </div>
  );
}
