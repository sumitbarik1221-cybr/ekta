import React, { useEffect, useId, useRef, useState } from 'react';
import { Search, ArrowRight, MapPin, Clock } from 'lucide-react';
import { suggestPlaces } from '../services/geocode.js';

const KIND = { country: 'Country', region: 'State / region', city: 'City / town', attraction: 'Attraction', place: 'Place' };

// Accessible combobox: debounced Photon suggestions, keyboard navigation, recent searches, empty state.
export default function SearchInput({ value, onChange, onSubmit, onPick, busy, recents = [] }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(-1);
  const box = useRef(null);

  useEffect(() => {
    const q = value.trim();
    if (!open || q.length < 3) { setItems([]); setLoading(false); return; }
    const ctrl = new AbortController(); setLoading(true);
    const t = setTimeout(async () => { const r = await suggestPlaces(q, { signal: ctrl.signal }); if (!ctrl.signal.aborted) { setItems(r); setLoading(false); setIdx(-1); } }, 350);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [value, open]);

  useEffect(() => {
    const away = e => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', away); return () => document.removeEventListener('pointerdown', away);
  }, []);

  const showRecents = open && value.trim().length < 3 && recents.length > 0;
  const list = showRecents ? recents.map(r => ({ id: 'r:' + r, name: r, recent: true })) : items;
  const pick = it => { setOpen(false); it.recent ? onSubmit(null, it.name) : onPick(it); };
  const key = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setIdx(i => Math.min(list.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(-1, i - 1)); }
    else if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'Enter' && idx >= 0 && list[idx]) { e.preventDefault(); pick(list[idx]); }
  };
  const listId = `${id}-list`;
  return (
    <div className="ek-search" ref={box}>
      <form className="hero-search" onSubmit={e => { setOpen(false); onSubmit(e); }} role="search">
        <Search size={21} aria-hidden="true" />
        <input value={value} onChange={e => { onChange(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={key}
          placeholder="Search any country, state, city, landmark or park…" aria-label="Search a destination worldwide"
          role="combobox" aria-expanded={open && (list.length > 0 || loading)} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={idx >= 0 ? `${id}-o${idx}` : undefined} autoComplete="off" />
        <button type="submit" disabled={busy}>{busy ? 'Finding…' : <><span>Explore</span><ArrowRight size={18} /></>}</button>
      </form>
      {open && (list.length > 0 || loading || value.trim().length >= 3) && (
        <ul className="ek-suggest" id={listId} role="listbox">
          {list.map((it, i) => (
            <li key={it.id} id={`${id}-o${i}`} role="option" aria-selected={i === idx} className={i === idx ? 'on' : ''} onPointerDown={e => { e.preventDefault(); pick(it); }}>
              {it.recent ? <Clock size={15} aria-hidden="true" /> : <MapPin size={15} aria-hidden="true" />}
              <span><b>{it.name}</b>{it.recent ? <small>Recent search</small> : <small>{[KIND[it.kind], it.subtitle].filter(Boolean).join(' · ')}</small>}</span>
            </li>
          ))}
          {!list.length && loading && <li className="ek-suggest-msg" role="presentation">Searching places…</li>}
          {!list.length && !loading && value.trim().length >= 3 && <li className="ek-suggest-msg" role="presentation">No suggestions found. Press Explore to search anyway, or try a different spelling or a nearby larger place.</li>}
        </ul>
      )}
    </div>
  );
}
