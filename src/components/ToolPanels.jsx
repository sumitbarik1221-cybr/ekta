import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, CalendarDays, Printer, Copy, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { askAssistant, rulesBasedAnswer } from '../services/assistant.js';
import { generateItinerary, itineraryToText, validateDates, estimateTrip } from '../services/itinerary.js';
import { COST_LABELS } from '../data/regions/helpers.js';
import { Badge } from './common.jsx';

const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');

function cleanAiText(value) {
  return String(value || '')
    .replace(/\\([*_`])/g, '$1')
    .replace(/&#x20;|&nbsp;/gi, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\u00a0/g, ' ');
}

function renderAiInline(text, sources) {
  const pattern = /(\*\*.+?\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|【\d+†L\d+(?:-L?\d+)?】)/g;
  return text.split(pattern).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    const citation = part.match(/^【(\d+)†L\d+(?:-L?\d+)?】$/);
    if (citation) {
      const source = sources[Number(citation[1]) - 1];
      return source ? <a key={index} href={source.url} target="_blank" rel="noreferrer" aria-label={`Open source ${citation[1]}`} className="ai-inline-citation">[{citation[1]}]</a> : <sup key={index}>[{citation[1]}]</sup>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function AssistantAnswer({ text, sources = [] }) {
  const lines = cleanAiText(text).split('\n');
  const blocks = [];
  let list = [];
  const flushList = () => {
    if (list.length) { blocks.push(<ul key={`list-${blocks.length}`}>{list}</ul>); list = []; }
  };
  lines.forEach((line, index) => {
    const bullet = line.match(/^\s*(?:[*•-])\s+(.+)$/);
    if (bullet) { list.push(<li key={`item-${index}`}>{renderAiInline(bullet[1], sources)}</li>); return; }
    flushList();
    if (line.trim()) blocks.push(<p key={`line-${index}`}>{renderAiInline(line.trim(), sources)}</p>);
  });
  flushList();
  return <div className="ai-answer-copy">{blocks}</div>;
}

export function AssistantPanel({ guide, seed }) {
  const [q, setQ] = useState('');
  const [webCheck, setWebCheck] = useState(false);
  const [state, setState] = useState({ status: 'idle' });
  const ctrl = useRef(null);
  useEffect(() => { setState({ status: 'idle' }); return () => ctrl.current?.abort(); }, [guide?.key]);
  const ask = async (question, useWeb = webCheck) => {
    if (!question.trim()) return;
    ctrl.current?.abort(); ctrl.current = new AbortController();
    setState({ status: 'loading', question });
    const r = await askAssistant({ question, guide, signal: ctrl.current.signal, webSearch: useWeb });
    if (ctrl.current.signal.aborted) return;
    if (r.ok) setState({ status: 'ai', question, answer: r.answer, model: r.model, sources: r.sources, webSearch: r.webSearch });
    else if (r.reason === 'error') setState({ status: 'error', question, message: r.message });
    else setState({ status: 'fallback', question, reason: r.reason, answer: rulesBasedAnswer(question, guide) });
  };
  useEffect(() => {
    if (!seed?.q) return;
    setQ(seed.q);
    setWebCheck(true);
    ask(seed.q, true);
  }, [seed?.n]);
  return <>
    <div className="ai-context"><span><Bot size={17} /> CONTEXT: {guide.title}{guide.subtitle ? `, ${guide.subtitle}` : ''}</span>
      <p>Ask about food, seasons, etiquette, attractions or emergency numbers. For missing results, EKTA can search the web and show sources. AI research is a suggestion, not factual or admin verification.</p></div>
    <div className="quick-prompts">{['What local food should I try?', 'What is the best season?', 'What etiquette should I follow?', 'What are the emergency numbers?'].map(x => <button key={x} type="button" onClick={() => { setQ(x); ask(x); }}>{x}</button>)}</div>
    <form className="ai-form" onSubmit={e => { e.preventDefault(); ask(q); }}>
      <input value={q} onChange={e => setQ(e.target.value)} maxLength={600} placeholder={`Ask about ${guide.title}…`} aria-label="Your question" />
      <button type="submit" aria-label="Send" disabled={state.status === 'loading'}><Send size={17} /></button>
    </form>
    <label className="check-row ai-web-check"><input type="checkbox" checked={webCheck} onChange={e => setWebCheck(e.target.checked)} /><span>Search current web sources (uses Groq browser search and your API usage limits)</span></label>
    {state.status === 'loading' && <p className="ek-muted" role="status">Thinking…</p>}
    {state.status === 'error' && <div className="ai-answer" role="alert"><AlertTriangle size={19} /><div><p>{state.message || 'The AI service returned an error. No answer was generated.'}</p><button type="button" className="secondary-button" onClick={() => ask(state.question)}><RefreshCw size={14} /> Retry</button></div></div>}
    {state.status === 'ai' && <div className="ai-answer"><Bot size={19} /><div><Badge tone="amber">{state.webSearch ? 'AI web research · admin review required' : 'AI suggestion · unverified'} · {state.model || 'model'}</Badge><AssistantAnswer text={state.answer} sources={state.sources} />{state.sources?.length > 0 && <div className="ai-citations"><b>Sources found</b>{state.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}<span>{source.url}</span></a>)}</div>}<small className="source-note">Web sources provide evidence to review; AI cannot establish factual truth or grant EKTA verification/admin approval. Check the cited pages before accepting a suggestion.</small></div></div>}
    {state.status === 'fallback' && <div className="ai-answer"><Bot size={19} /><div><Badge tone="amber">Not from an AI model — offline helper</Badge><p>{state.answer}</p>
      <small className="source-note">{state.reason === 'not-configured' ? 'The backend is running but no Groq key is configured.' : 'The EKTA backend could not be reached.'} Start it with <code>npm.cmd run server</code> and set <code>GROQ_API_KEY</code> in .env (see README).</small></div></div>}
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
