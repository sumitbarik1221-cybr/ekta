import React, { useEffect, useRef, useState } from 'react';
import { Bot, CalendarDays, Printer, Copy, Trash2, AlertTriangle } from 'lucide-react';
import { generateItinerary, itineraryToText, validateDates, estimateTrip } from '../services/itinerary.js';
import { COST_LABELS } from '../data/regions/helpers.js';
import { Badge } from './common.jsx';

const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');

export function AssistantPanel({ guide, seed }) {
  const [opening, setOpening] = useState(false);
  const [copyState, setCopyState] = useState('');
  const timer = useRef(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copyQuestion = async () => {
    try {
      await navigator.clipboard.writeText(seed.q);
      setCopyState('Question copied. Paste it into the Tidio chat.');
    } catch {
      setCopyState('Copy was blocked by the browser. Select the question above and copy it manually.');
    }
  };

  const openChat = () => {
    const api = window.tidioChatApi;
    if (api && api.getStatus() !== null) {
      api.show();
      api.open();
      return;
    }
    setOpening(true);
    const handleReady = () => {
      window.clearTimeout(timer.current);
      const readyApi = window.tidioChatApi;
      if (readyApi) { readyApi.show(); readyApi.open(); }
      else setOpening(false);
    };
    document.addEventListener('tidioChat-ready', handleReady, { once: true });
    timer.current = window.setTimeout(() => {
      document.removeEventListener('tidioChat-ready', handleReady);
      setOpening(false);
    }, 10000);
  };

  return <>
    <div className="ai-context"><span><Bot size={17} /> DESTINATION CONTEXT: {guide.title}{guide.subtitle ? `, ${guide.subtitle}` : ''}</span>
      <p>Open EKTA’s Tidio chat to ask about food, seasons, etiquette, attractions or trip ideas for this destination. Tidio’s availability and automated replies depend on the chat settings in your Tidio account. Mention the destination in your message so the Tidio assistant has the right context.</p></div>
    {seed?.q && <div className="modal-callout"><Bot size={18} /><div><b>Suggested question</b><p>{seed.q}</p><button className="secondary-button" type="button" onClick={copyQuestion}><Copy size={14} /> Copy question</button>{copyState && <small role="status">{copyState}</small>}</div></div>}
    <button className="primary-button" type="button" onClick={openChat} disabled={opening}>
      <Bot size={17} /> {opening ? 'Connecting to Tidio…' : 'Chat with the EKTA Travel Guide'}
    </button>
    <small className="source-note">Tidio may show an offline message when no operator or automation is available. Confirm important travel and emergency details with reliable sources.</small>
  </>;
}

export function BudgetPanel({ guide }) {
  const [days, setDays] = useState(3), [trav, setTrav] = useState(2), [style, setStyle] = useState('balanced'), [budget, setBudget] = useState(15000);
  const est = estimateTrip(guide.record, style, Math.max(1, trav), Math.max(1, days));
  return <>
    <div className="form-grid">
      <label><span>Days</span><input type="number" min="1" max="21" value={days} onChange={e => setDays(Math.min(21, Math.max(1, +e.target.value || 1)))} /></label>
      <label><span>Travellers</span><input type="number" min="1" max="20" value={trav} onChange={e => setTrav(Math.min(20, Math.max(1, +e.target.value || 1)))} /></label>
      <label><span>Travel style</span><select value={style} onChange={e => setStyle(e.target.value)}><option value="budget">Budget</option><option value="balanced">Balanced</option><option value="premium">Premium</option></select></label>
      <label><span>Your total budget (₹)</span><input type="number" min="0" value={budget} onChange={e => setBudget(+e.target.value || 0)} /></label>
    </div>
    {est ? <>
      <div className="modal-callout"><CalendarDays /><div><b>{inr(est.total[0])} – {inr(est.total[1])} estimated</b><p>{trav} traveller{trav > 1 ? 's' : ''} · {days} day{days > 1 ? 's' : ''} · {style}. {budget < est.total[0] ? 'Your budget is below the low end of this estimate.' : budget > est.total[1] ? 'Your budget covers the top of this estimate.' : 'Your budget is within the estimated range.'}</p></div></div>
      <table className="ek-table"><thead><tr><th>Category</th><th>Estimate</th></tr></thead><tbody>{est.breakdown.map(b => <tr key={b.key}><th scope="row">{COST_LABELS[b.key]}</th><td>{inr(b.total[0])} – {inr(b.total[1])}</td></tr>)}</tbody></table>
      <p className="muted"><Badge tone="amber">Estimate</Badge> EKTA planning ranges, not live prices. Excludes long-distance transport and shopping. No live pricing integration is configured.</p>
    </> : <div className="modal-callout"><AlertTriangle /><div><b>No cost model for {guide.title}</b><p>EKTA has no sourced cost estimate for this destination and will not invent one. Use your own research for accommodation, food and transport.</p></div></div>}
  </>;
}

function printHTML(text, title) {
  const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;width:0;height:0;border:0';
  document.body.appendChild(f);
  const d = f.contentDocument; d.open();
  d.write(`<title>${title}</title><body style="font:14px/1.6 sans-serif;max-width:720px;margin:24px"><pre style="white-space:pre-wrap;font:inherit"></pre></body>`); d.close();
  d.querySelector('pre').textContent = text;
  f.contentWindow.focus(); f.contentWindow.print(); setTimeout(() => f.remove(), 1500);
}

export function ItineraryPanel({ guide, attractions, toast }) {
  const iso = n => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
  const [f, setF] = useState({ startDate: iso(7), endDate: iso(9), budget: 20000, travellers: 2, style: 'balanced', pace: 'balanced', interests: ['Food', 'Culture'] });
  const [res, setRes] = useState(null);
  const [seed, setSeed] = useState(0);
  const [err, setErr] = useState('');
  useEffect(() => { setRes(null); setErr(''); setSeed(0); }, [guide?.key]);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const run = s => {
    const dateErr = validateDates(f.startDate, f.endDate);
    if (dateErr) { setErr(dateErr); setRes(null); return; }
    const r = generateItinerary({ guide, attractions, ...f, seed: s });
    if (r.error) { setErr(r.error); setRes(null); } else { setErr(''); setRes(r); }
  };
  const edit = (di, slot, patch) => setRes(r => ({ ...r, days: r.days.map((d, i) => i === di ? { ...d, [slot]: { ...d[slot], ...patch } } : d) }));
  const text = res ? itineraryToText(res, guide.title) : '';
  const ints = ['Food', 'Culture', 'Nature', 'Adventure', 'History', 'Shopping', 'Spirituality'];
  return <>
    <p className="muted">Plan a trip to <b>{guide.title}</b>. Only attractions and dishes with data in EKTA’s records (or live sources) are scheduled; nothing is invented.</p>
    <div className="form-grid">
      <label><span>Start date</span><input type="date" value={f.startDate} onChange={e => set('startDate', e.target.value)} /></label>
      <label><span>End date</span><input type="date" min={f.startDate} value={f.endDate} onChange={e => set('endDate', e.target.value)} /></label>
      <label><span>Total budget (₹)</span><input type="number" min="1" value={f.budget} onChange={e => set('budget', e.target.value)} /></label>
      <label><span>Travellers</span><input type="number" min="1" max="20" value={f.travellers} onChange={e => set('travellers', e.target.value)} /></label>
      <label><span>Travel style</span><select value={f.style} onChange={e => set('style', e.target.value)}><option value="budget">Budget</option><option value="balanced">Balanced</option><option value="premium">Premium</option></select></label>
      <label><span>Pace</span><select value={f.pace} onChange={e => set('pace', e.target.value)}><option value="relaxed">Relaxed</option><option value="balanced">Balanced</option><option value="packed">Packed</option></select></label>
    </div>
    <label className="field-label">Interests</label>
    <div className="interest-chips">{ints.map(x => <button type="button" key={x} className={f.interests.includes(x) ? 'selected' : ''} aria-pressed={f.interests.includes(x)} onClick={() => set('interests', f.interests.includes(x) ? f.interests.filter(y => y !== x) : [...f.interests, x])}>{x}</button>)}</div>
    {err && <p className="search-error ek-inline" role="alert">{err}</p>}
    <button className="primary-button" type="button" onClick={() => { setSeed(0); run(0); }}><CalendarDays size={16} /> Generate itinerary</button>
    {res && <div className="itinerary-output">
      {res.warnings.map(w => <p key={w} className="ek-note ek-warn"><AlertTriangle size={15} /> {w}</p>)}
      {res.days.map((d, di) => <div key={d.iso}><b>Day {d.day} · {d.date}</b>
        {['morning', 'afternoon', 'evening'].map(s => <div className="ek-slot" key={s}>
          <small>{s.toUpperCase()}</small>
          <input aria-label={`Day ${d.day} ${s}`} value={d[s].title} onChange={e => edit(di, s, { title: e.target.value, kind: 'custom' })} />
          {d[s].note && <p>{d[s].note}</p>}
          <button type="button" className="ek-link" aria-label={`Clear day ${d.day} ${s}`} onClick={() => edit(di, s, { title: 'Open', note: '', kind: 'open' })}><Trash2 size={12} /> Clear</button>
        </div>)}
        {d.travelNotes.map(t => <p key={t} className="ek-small">⚠ {t}</p>)}
      </div>)}
      {res.notes.map(n => <p key={n} className="ek-small">{n}</p>)}
      {res.estimate && <p className="ek-small"><Badge tone="amber">Estimate</Badge> {inr(res.estimate.total[0])} – {inr(res.estimate.total[1])} for this trip (excludes long-distance transport).</p>}
      <div className="ek-actions">
        <button type="button" className="secondary-button" onClick={() => { const s = seed + 1; setSeed(s); run(s); }}><RefreshCw size={14} /> Regenerate</button>
        <button type="button" className="secondary-button" onClick={() => navigator.clipboard?.writeText(text).then(() => toast('Itinerary copied.'), () => toast('Copy unavailable.'))}><Copy size={14} /> Copy</button>
        <button type="button" className="secondary-button" onClick={() => printHTML(text, `EKTA itinerary — ${guide.title}`)}><Printer size={14} /> Print / save as PDF</button>
      </div>
    </div>}
  </>;
}
