import React, { useEffect, useRef, useState } from 'react';
import { LocateFixed, ExternalLink } from 'lucide-react';
import { loadGoogleMaps } from '../services/googleMaps.js';

const markerIcon = (color, symbol = '') => ({
  path: window.google.maps.SymbolPath.CIRCLE,
  fillColor: color,
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 3,
  scale: symbol ? 10 : 8,
});

export default function GuideMap({ guide, attractions, selected, onSelect, showHiddenGems = false, onToggleHiddenGems, isHiddenGemChecked, onToggleHiddenGem }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const markers = useRef([]);
  const info = useRef(null);
  const [me, setMe] = useState(null);
  const [geoMsg, setGeoMsg] = useState('');
  const [mapMsg, setMapMsg] = useState('Loading Google Maps…');
  const [locating, setLocating] = useState(false);
  const allSpots = attractions.filter(a => a.hasCoords);
  const spots = allSpots.filter(a => !a.hidden || (showHiddenGems && (isHiddenGemChecked?.(a) ?? true))).slice(0, 80);
  const hiddenSpots = attractions.filter(a => a.hidden);
  const hiddenCount = hiddenSpots.length;
  const target = selected && selected.hasCoords ? selected : null;

  useEffect(() => {
    let active = true;
    loadGoogleMaps().then(maps => {
      if (!active || !container.current) return;
      mapRef.current = new maps.Map(container.current, {
        center: { lat: guide.geo.lat, lng: guide.geo.lon }, zoom: guide.zoom,
        mapTypeControl: true, streetViewControl: false, fullscreenControl: true,
        clickableIcons: false, gestureHandling: 'greedy'
      });
      info.current = new maps.InfoWindow();
      setMapMsg('');
    }).catch(error => { if (active) setMapMsg(error.message); });
    return () => { active = false; markers.current.forEach(marker => marker.setMap(null)); markers.current = []; mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const { lat, lon, bbox, kind } = guide.geo;
    if (bbox && ['country', 'region', 'city'].includes(kind)) {
      map.fitBounds({ south: bbox.south, west: bbox.west, north: bbox.north, east: bbox.east }, 18);
    } else { map.setCenter({ lat, lng: lon }); map.setZoom(guide.zoom); }
    setMe(null); setGeoMsg('');
  }, [guide.key, guide.geo, guide.zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
    const addMarker = (position, title, color, symbol, content, item, zoomOnClick = false) => {
      const marker = new window.google.maps.Marker({ map, position, title, icon: markerIcon(color, symbol), label: symbol ? { text: symbol, color: "#ffffff", fontSize: "12px", fontWeight: "bold" } : undefined, zIndex: item?.hidden ? 10 : 1 });
      marker.addListener('mouseover', () => { info.current.setContent(content); info.current.open({ map, anchor: marker }); });
      marker.addListener('mouseout', () => info.current.close());
      marker.addListener('click', () => {
        if (zoomOnClick) { map.panTo(position); map.setZoom(Math.max(map.getZoom() || 0, 16)); }
        if (item) onSelect(item);
        info.current.setContent(content);
        info.current.open({ map, anchor: marker });
      });
      markers.current.push(marker);
    };
    const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    const destinationContent = `<b>${esc(guide.title)}</b><br>${esc(guide.subtitle)}<br><small>Position from ${esc(guide.geo.source)}</small>`;
    addMarker({ lat: guide.geo.lat, lng: guide.geo.lon }, guide.title, '#bc4c3d', '', destinationContent, null);
    spots.forEach(a => {
      const pos = { lat: a.lat, lng: a.lon };
      const content = `<b>${esc(a.name)}</b><br><small>${esc([a.kind, a.place].filter(Boolean).join(' · '))}</small>${a.note ? `<p>${esc(a.note)}</p>` : ''}<p><small>Source: ${esc(a.source)}${a.precision === 'approx' ? ' · approximate position' : ''}</small></p><a href="https://www.google.com/maps/dir/?api=1&destination=${a.lat},${a.lon}" target="_blank" rel="noreferrer">Directions ↗</a>${a.wikiTitle ? ` · <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(a.wikiTitle.replace(/ /g, '_'))}" target="_blank" rel="noreferrer">Wikipedia</a>` : ''}`;
      addMarker(pos, a.name, a.hidden ? '#d9952e' : '#087e68', a.hidden ? '✦' : '', content, a, true);
    });
    if (me) addMarker({ lat: me.lat, lng: me.lon }, 'You are here', '#2075d2', '•', '<b>You are here</b> (approximate)', null);
  }, [guide, spots, me, onSelect]);

  useEffect(() => {
    if (target && mapRef.current) {
      const pos = { lat: target.lat, lng: target.lon };
      mapRef.current.panTo(pos);
      mapRef.current.setZoom(Math.max(mapRef.current.getZoom() || 0, 16));
    }
  }, [target]);

  const locate = () => {
    if (!navigator.geolocation) { setGeoMsg('This browser does not support location.'); return; }
    setLocating(true); setGeoMsg('');
    navigator.geolocation.getCurrentPosition(
      p => { setMe({ lat: p.coords.latitude, lon: p.coords.longitude }); setLocating(false); },
      e => { setLocating(false); setGeoMsg(e.code === 1 ? 'Location permission was denied. You can still pan, zoom and search any destination.' : 'Your location could not be determined. Try again, or search manually.'); },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  };

  return (
    <div>
      <div className="ek-map-layer-control">
        <div className="ek-map-layer-head">
          <label><input type="checkbox" checked={showHiddenGems} onChange={event => onToggleHiddenGems?.(event.target.checked)} /><span><b>Show hidden gems</b><small>Turn this on to display the gems checked below.</small></span></label>
          <small>{hiddenCount} hidden gem{hiddenCount === 1 ? '' : 's'} available</small>
        </div>
        {hiddenSpots.length > 0 && <div className="ek-map-gem-options" aria-label="Choose hidden gems to show on the map">
          {hiddenSpots.map(gem => <label key={`${gem.name}|${gem.source}`}><input type="checkbox" checked={isHiddenGemChecked?.(gem) ?? true} onChange={event => onToggleHiddenGem?.(gem, event.target.checked)} /><span>{gem.name}</span></label>)}
        </div>}
      </div>
      <div className="map-frame ek-map" role="region" aria-label={`Google map of ${guide.title}`}>
        {mapMsg && <div className="ek-google-map-message" role="status">{mapMsg}</div>}
        <div ref={container} style={{ width: '100%', height: '100%', minHeight: 320 }} />
      </div>
      <div className="ek-map-actions">
        <button type="button" className="secondary-button" onClick={locate} disabled={locating || !mapRef.current}><LocateFixed size={15} /> {locating ? 'Locating…' : 'Show my location'}</button>
        <a className="map-link" href={`https://www.google.com/maps/search/?api=1&query=${guide.geo.lat},${guide.geo.lon}`} target="_blank" rel="noreferrer">Open Google Maps <ExternalLink size={14} /></a>
      </div>
      {geoMsg && <p className="search-error ek-inline" role="status">{geoMsg}</p>}
      <p className="ek-small">{spots.length} visible marker{spots.length === 1 ? '' : 's'} with known coordinates. Attractions without verified coordinates are listed but not pinned.</p>
    </div>
  );
}






