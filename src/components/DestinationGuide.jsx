import React, { useEffect, useState } from 'react';
import { CalendarDays, Wallet, Sparkles, Landmark, Compass, Utensils, ShieldCheck, MapPin, ArrowRight, Info, Phone, BadgeCheck, Star } from 'lucide-react';
import { COST_LABELS, sumCosts } from '../data/regions/helpers.js';
import { getGemVerification, GEM_USER_VERIFY_MIN_RATINGS, GEM_USER_VERIFY_MIN_AVERAGE } from '../services/gemVerification.js';
import FoodExplorer from './FoodExplorer.jsx';
import { Badge, LimitedData, SourceLink } from './common.jsx';
import { excerpt } from '../services/wikivoyage.js';
import { organiseWithAI } from '../services/brief.js';
import { destinationBudgetEstimates } from '../data/curatedDestinations.js';

// Attributed Wikivoyage text for places without an EKTA record. Shown as an excerpt, not rewritten.
function Voyage({ guide, keys, title }) {
  const v = guide.voyage; const parts = v ? keys.filter(k => v.sections[k]) : [];
  if (!parts.length) return null;
  return (
    <div className="ek-voyage">
      <Badge tone="blue">Excerpt from Wikivoyage · CC BY-SA</Badge>
      {parts.map(k => <div key={k}><h4 className="ek-sub">{title[k]}</h4><p className="ek-voyage-text">{excerpt(v.sections[k])}</p></div>)}
      <p className="ek-small">Community-written and may be out of date. <a href={v.url} target="_blank" rel="noreferrer">Read the full guide on Wikivoyage</a></p>
    </div>
  );
}

// Optional: the backend AI re-organises ONLY the retrieved Wikipedia/Wikivoyage text into short lists.
function AiBrief({ guide }) {
  const [st, setSt] = useState({ status: 'idle' });
  useEffect(() => setSt({ status: 'idle' }), [guide.key]);
  const run = async () => { setSt({ status: 'loading' }); const r = await organiseWithAI(guide); setSt(r.ok ? { status: 'ok', d: r.data } : { status: r.reason }); };
  if (!guide.voyage && guide.description?.source?.label !== 'Wikipedia') return null;
  const msg = { 'not-configured': 'The backend has no AI key configured (see README).', unreachable: 'The EKTA backend could not be reached. Start it with npm run server.', error: 'The AI service failed. Try again.', 'no-sources': 'No source text to organise.' }[st.status];
  const d = st.d;
  return (
    <div className="ek-aibrief">
      <button type="button" className="secondary-button" onClick={run} disabled={st.status === 'loading'}><Sparkles size={14} /> {st.status === 'loading' ? 'Organising…' : 'Organise these sources with AI'}</button>
      {msg && <p className="ek-small" role="status">{msg}</p>}
      {d && <div className="ek-note"><div>
        <Badge tone="blue">AI-organised · from Wikipedia/Wikivoyage text only · {d.model}</Badge>
        {[['etiquette', 'Etiquette'], ['safety', 'Safety (as stated in sources)'], ['highlights', 'Highlights']].map(([k, l]) => d[k]?.length > 0 && <div key={k}><h4 className="ek-sub">{l}</h4><ul className="ek-list">{d[k].map(x => <li key={x}>{x}</li>)}</ul></div>)}
        {d.food?.length > 0 && <div><h4 className="ek-sub">Food mentioned</h4><ul className="ek-list">{d.food.map(f => <li key={f.name}><b>{f.name}</b>{f.diet !== 'unknown' ? ` (${f.diet})` : ''}{f.description ? ` — ${f.description}` : ''}</li>)}</ul></div>}
        {!d.etiquette?.length && !d.food?.length && !d.highlights?.length && <p className="ek-small">The sources contain nothing that could be organised for this place.</p>}
        <p className="ek-small">AI can misread sources. Nothing here comes from outside the retrieved text.</p>
      </div></div>}
    </div>
  );
}


const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const range = ([a, b]) => `${inr(a)} – ${inr(b)}`;

function Coverage({ guide }) {
  const r = guide.record;
  if (!r) return <Badge tone="amber">Live data only — no EKTA regional record</Badge>;
  if (r.tier === 'starter') return <Badge tone="amber">Starter notes — limited detail</Badge>;
  if (r.tier === 'basic') return <Badge tone="blue">Basic EKTA record — some sections limited</Badge>;
  return <Badge tone="green">Detailed EKTA record · editorial</Badge>;
}

function ScopeNotice({ guide }) {
  const { record, scope, title } = guide;
  if (!record || scope === 'exact') return null;
  const where = scope === 'country' ? `country-wide information for ${record.name}` : `${record.name}-wide information`;
  return <div className="ek-note"><Info size={16} aria-hidden="true" /><span>EKTA has no record specific to <b>{title}</b>. The sections below show {where}; it describes the wider area and may not apply to {title} itself.</span></div>;
}

function Budget({ guide, style, setStyle }) {
  const r = guide.record, name = guide.title;
  if (r?.costs) {
    const t = r.costs[style], total = sumCosts(t);
    return (
      <article className="ek-card ek-wide">
        <span className="detail-icon"><Wallet aria-hidden="true" /></span>
        <small>ESTIMATED DAILY BUDGET (PER PERSON) <Badge tone="amber">Estimate</Badge></small>
        <div className="ek-filter" role="group" aria-label="Travel style">
          {['budget', 'balanced', 'premium'].map(s => <button key={s} type="button" className={style === s ? 'on' : ''} aria-pressed={style === s} onClick={() => setStyle(s)}>{s[0].toUpperCase() + s.slice(1)}</button>)}
        </div>
        <b className="ek-big">{range(total)} <span>per day</span></b>
        <table className="ek-table"><tbody>{Object.entries(t).map(([k, v]) => <tr key={k}><th scope="row">{COST_LABELS[k]}</th><td>{range(v)}</td></tr>)}</tbody></table>
        <ul className="ek-small ek-assume">{r.costAssumptions.map(a => <li key={a}>{a}</li>)}</ul>
        <p className="ek-small">No live prices are configured. Check current hotel, transport and entry prices before booking.</p>
      </article>
    );
  }
  if (r?.budgetText) return (
    <article className="ek-card"><span className="detail-icon"><Wallet aria-hidden="true" /></span><small>ESTIMATED DAILY BUDGET</small><b>{r.budgetText}</b>
      <p className="ek-small">Starter planning range from early EKTA notes — indicative only, with no breakdown or sources.</p></article>
  );
  const estimate = guide.curated?.budget
    ? { text: guide.curated.budget, note: 'Indicative range from EKTA’s curated destination notes; actual costs vary by season and travel style.' }
    : destinationBudgetEstimates[String(name).normalize('NFKC').toLowerCase().split(/[,(]/)[0].trim()];
  if (estimate) return <article className="ek-card"><span className="detail-icon"><Wallet aria-hidden="true" /></span><small>ESTIMATED DAILY BUDGET</small><b>{estimate.text}</b><p className="ek-small">{estimate.note} This is a planning estimate, not a live quote.</p></article>;
  return <article className="ek-card"><span className="detail-icon"><Wallet aria-hidden="true" /></span><small>ESTIMATED DAILY BUDGET</small>
    <p className="ek-muted">No sourced cost estimate for {name}{r?.type === 'country' ? ' (costs are in a local currency EKTA has no sourced figures for)' : ''}. EKTA will not guess one.</p></article>;
}

export default function DestinationGuide({ guide, attractions, attractionsStatus, selected, onSelect, onLocate, isHiddenGemChecked, onToggleHiddenGem, budgetStyle, setBudgetStyle, onSwitch, onAsk, user, supabase }) {
  const r = guide.record, name = guide.title;
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [guide.key]);
  const curated = guide.curated;
  // Starter notes describe a whole state. When the user searched a place INSIDE it, they must not read as facts about that place.
  const wideOnly = r?.tier === 'starter' && guide.scope !== 'exact';
  const stories = wideOnly ? [] : (r?.stories || []);
  const ask = q => onAsk && (() => onAsk(q));

  const missing = [];
  if (!r?.bestTime) missing.push('best time to visit');
  if (!r?.costs && !r?.budgetText && !guide.curated?.budget && !destinationBudgetEstimates[String(name).normalize('NFKC').toLowerCase().split(/[,(]/)[0].trim()]) missing.push('budget estimate');
  if (!r?.character) missing.push('local character');
  if (!r?.etiquette?.length) missing.push('culture and etiquette');
  if (!stories.length) missing.push('heritage stories');
  if (!r?.dishes?.length) missing.push('local food');
  if (!r?.emergency) missing.push('emergency numbers');

  return (
    <div className="ek-guide">
      {guide.ambiguity && (
        <div className="ek-note ek-warn" role="status"><Info size={16} aria-hidden="true" /><span>{guide.ambiguity.message}
          {guide.ambiguity.alternatives.map(a => <button key={a.id} type="button" className="ek-link" onClick={() => onSwitch(a.name)}>Show {a.name} instead <ArrowRight size={12} /></button>)}</span></div>
      )}
      <div className="ek-coverage"><Coverage guide={guide} />{r && <Badge tone="neutral" title={r.review?.note}>{r.review?.status === 'editorial' ? 'Editorial — not expert-reviewed' : 'Starter notes'}</Badge>}</div>
      <ScopeNotice guide={guide} />

      <div className="ek-cards">
        <article className="ek-card"><span className="detail-icon"><CalendarDays aria-hidden="true" /></span><small>BEST TIME TO VISIT</small>
          {r?.bestTime ? <><b>{r.bestTime.summary}</b>
            {r.bestTime.seasons?.length > 0 && <><button type="button" className="ek-link" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'} seasonal detail</button>
              {open && <ul className="ek-seasons">{r.bestTime.seasons.map(s => <li key={s.label}><b>{s.label}</b> · {s.months}<br /><span>{s.note}</span></li>)}</ul>}</>}</>
            : <p className="ek-muted">No seasonal guidance for {name} in EKTA’s records. The live weather panel shows current conditions only.</p>}
        </article>
        <article className="ek-card"><span className="detail-icon"><Sparkles aria-hidden="true" /></span><small>LOCAL CHARACTER</small>
          {r?.character ? <b>{r.character}</b> : <p className="ek-muted">No verified description of {name}’s character{guide.description ? ' beyond the Wikipedia summary above' : ''}.</p>}
        </article>
        <Budget guide={guide} style={budgetStyle} setStyle={setBudgetStyle} />
      </div>

      {curated && (
        <div className="info-panel ek-curated"><h3><Compass /> Curated EKTA notes for {curated.name}</h3>
          <p className="ek-small">Starter notes from EKTA’s original destination card — brief and not independently sourced.</p>
          <p><b>Best time:</b> {curated.best} · <b>Budget:</b> {curated.budget} (indicative)</p>
          {curated.facts.map(f => <p key={f} className="fact"><span>•</span>{f}</p>)}
          <p><b>Etiquette:</b> {curated.customs}</p>
        </div>
      )}

      <div className="info-panel">
        <h3><Landmark /> Culture &amp; local etiquette</h3>
        {r?.etiquette?.length ? <ul className="ek-list">{r.etiquette.map(e => <li key={e}>{e}</li>)}</ul>
          : (guide.voyage?.sections.respect || guide.voyage?.sections.staysafe)
            ? <Voyage guide={guide} keys={['respect', 'staysafe']} title={{ respect: 'Respect (local customs)', staysafe: 'Stay safe' }} />
            : <LimitedData title="Etiquette notes unavailable" name={name} topic="etiquette customs" onAsk={ask(`Check the available EKTA, Wikipedia and Wikivoyage information for etiquette in ${name}. Say clearly what is supported by those sources; if they do not verify any details, say so and give only clearly labelled unverified suggestions.`)} />}

        <h3><Sparkles /> Stories worth knowing</h3>
        {stories.length ? stories.map((s, i) => <p className="fact" key={i}><span>{String(i + 1).padStart(2, '0')}</span><span className="ek-story">{s.title && <b>{s.title}. </b>}{s.text}</span></p>)
          : guide.voyage?.sections.understand
            ? <Voyage guide={guide} keys={['understand']} title={{ understand: 'Background' }} />
            : <LimitedData title="Heritage stories unavailable" name={name} topic="history" onAsk={ask(`Check the available EKTA, Wikipedia and Wikivoyage information for the history and heritage of ${name}. Separate sourced facts from unverified suggestions, and do not invent dates or stories.`)} missing={`EKTA has no verified history or heritage notes for ${name} itself.${guide.description ? ' The Wikipedia summary above is the only sourced description.' : ''}`} />}
        {wideOnly && r.stories?.length > 0 && <details className="ek-details"><summary>{r.name}-wide starter notes (about the state, not about {name})</summary>{r.stories.map((s, i) => <p className="ek-small" key={i}>• {s.text}</p>)}</details>}

        <h3><MapPin /> Attractions &amp; hidden gems</h3>
        <AttractionList attractions={attractions} status={attractionsStatus} selected={selected} onSelect={onSelect} onLocate={onLocate} guide={guide} isHiddenGemChecked={isHiddenGemChecked} onToggleHiddenGem={onToggleHiddenGem} onAsk={onAsk} user={user} supabase={supabase} />

        <h3><Utensils /> Local food in {name}</h3>
        <FoodExplorer guide={guide} onAsk={onAsk} />
        <AiBrief guide={guide} />

        {r?.festivals?.length > 0 && <><h3><CalendarDays /> Festivals &amp; events</h3><ul className="ek-list">{r.festivals.map(f => <li key={f.name}><b>{f.name}.</b> {f.note}</li>)}</ul></>}

        <h3><ShieldCheck /> Safety &amp; emergency</h3>
        {r?.emergency ? <div className="ek-emergency"><Phone size={16} aria-hidden="true" />
          <div>{r.emergency.numbers.map(n => <b key={n.value}>{n.label}: {n.value}</b>)}<p className="ek-small">{r.emergency.note} <SourceLink source={r.emergency.source} /></p></div></div>
          : <LimitedData title="Emergency numbers unavailable" name={name} topic="emergency numbers" onAsk={ask(`Check whether the available sources provide an official emergency number for ${name}. Never guess a phone number; if none is in the sources, say it cannot be verified and direct me to an official government source.`)} missing={`EKTA has no verified emergency numbers for ${name}. Confirm the local number before you travel.`} />}
        {r?.safetyNotes?.length > 0 && <ul className="ek-list">{r.safetyNotes.map(s => <li key={s}>{s}</li>)}</ul>}
      </div>

      {r?.sources?.length > 0 && <div className="ek-sources"><b>Sources &amp; further reading</b> {r.sources.map(s => <SourceLink key={s.url} source={s} />)}
        <p className="ek-small">{r.review?.note} Wikipedia text is CC BY-SA.</p></div>}
      {missing.length > 0 && <LimitedData title="Limited data for this destination" name={name} missing={`EKTA has no verified information on: ${missing.join(', ')}. The sections above show only what is available; nothing has been filled in with generic text.`} onAsk={ask(`Check EKTA's available sources for ${name}. These fields are missing: ${missing.join(', ')}. Tell me which, if any, are supported by the available sources. For unsupported fields, say you cannot verify them and keep any ideas clearly labelled as unverified suggestions.`)} />}
    </div>
  );
}

function AttractionList({ attractions, status, selected, onSelect, onLocate, guide, isHiddenGemChecked, onToggleHiddenGem, onAsk, user, supabase }) {
  const name = guide.title;
  const gems = attractions.filter(a => a.hidden);
  const rest = attractions.filter(a => !a.hidden);
  const [ratings, setRatings] = useState(() => { try { return JSON.parse(localStorage.getItem('ekta-gem-ratings-v1') || '{}'); } catch { return {}; } });
  const [sharedRatings, setSharedRatings] = useState({});
  const [myRatings, setMyRatings] = useState({});
  useEffect(() => { try { localStorage.setItem('ekta-gem-ratings-v1', JSON.stringify(ratings)); } catch { /* Browser storage may be unavailable. */ } }, [ratings]);
  const ratingKey = a => `${guide.key}::${String(a.name).normalize('NFKC').trim().toLocaleLowerCase()}`;
  const gemKey = a => String(a.name).normalize('NFKC').trim().toLocaleLowerCase();
  useEffect(() => {
    let active = true;
    if (!supabase) { setSharedRatings({}); setMyRatings({}); return () => { active = false; }; }
    supabase.from('gem_rating_summary').select('gem_key,rating_count,average_rating').eq('place_key', guide.key)
      .then(({ data }) => {
        if (!active) return;
        setSharedRatings(Object.fromEntries((data || []).map(row => [row.gem_key, row])));
      });
    if (!user) { setMyRatings({}); return () => { active = false; }; }
    supabase.from('gem_ratings').select('gem_key,rating').eq('place_key', guide.key).eq('user_id', user.id)
      .then(({ data }) => {
        if (!active) return;
        setMyRatings(Object.fromEntries((data || []).map(row => [row.gem_key, row.rating])));
      });
    return () => { active = false; };
  }, [guide.key, supabase, user?.id]);
  const rate = async (a, value) => {
    setRatings(previous => ({ ...previous, [ratingKey(a)]: value }));
    if (!user || !supabase) return;
    const key = gemKey(a);
    setMyRatings(previous => ({ ...previous, [key]: value }));
    const { error } = await supabase.from('gem_ratings').upsert({
      user_id: user.id, place_key: guide.key, gem_key: key, rating: value
    }, { onConflict: 'user_id,place_key,gem_key' });
    if (error) {
      setMyRatings(previous => ({ ...previous, [key]: 0 }));
      return;
    }
    const { data } = await supabase.from('gem_rating_summary').select('gem_key,rating_count,average_rating').eq('place_key', guide.key);
    setSharedRatings(Object.fromEntries((data || []).map(row => [row.gem_key, row])));
  };
  const statusMsg = status === 'loading' ? 'Loading live attractions…'
    : status === 'not-configured' ? 'Google Places is not configured. Add a restricted Google Maps key to .env; showing EKTA records and nearby Wikipedia articles.'
    : status === 'unavailable' ? 'Google Places could not be reached. Check the key, enabled APIs, billing and network. Showing EKTA records and nearby Wikipedia articles.' : '';
  if (!attractions.length) return <>
    {statusMsg && <p className="ek-small" role="status">{statusMsg}</p>}
    {status !== 'loading' && <LimitedData title="No attractions found" name={name} topic="things to do" onAsk={onAsk && (() => onAsk(`Check the available EKTA, Wikipedia and Wikivoyage context for attractions and lesser-known places in ${name}. Do not claim places are verified unless the context supports them; identify any unsupported ideas as unverified suggestions.`))} missing={`No attractions with verified data were found for ${name}. Source coverage is incomplete, so this does not mean there is nothing to see.`} />}
  </>;
  const Row = a => {
    const stats = sharedRatings[gemKey(a)];
    const evidence = getGemVerification({ ...a.verification, ratingCount: stats?.rating_count || 0, averageRating: stats?.average_rating || 0 });
    const myRating = user ? (myRatings[gemKey(a)] || 0) : (ratings[ratingKey(a)] || 0);
    return <li key={`${a.name}|${a.source}`} className={selected?.name === a.name ? 'on' : ''}>
      <div className="ek-attraction-main"><b>{a.name}</b><small>{[a.kind, a.place].filter(Boolean).join(' · ')}</small>{a.note && <p>{a.note}</p>}
        <span className="ek-src">{a.source}{a.precision === 'approx' ? ' · approx. position' : ''}</span></div>
      {a.hidden ? <label className="ek-gem-map-check"><input type="checkbox" checked={isHiddenGemChecked?.(a) ?? true} onChange={event => onToggleHiddenGem?.(a, event.target.checked)} /><span>Show on map</span></label>
        : a.hasCoords ? <button type="button" className="ek-link" onClick={() => onSelect(a)}>Show on map</button>
          : <button type="button" className="ek-link" onClick={() => onLocate(a)}>Find on map</button>}
      {a.hidden && <div className="ek-gem-verification">
        <div className="ek-gem-statuses">
          <span className={evidence.aiChecked ? 'is-confirmed' : ''}>{evidence.aiChecked ? <><BadgeCheck size={13}/> AI checked</> : 'AI screening pending'}</span>
          <span className={evidence.userVerified ? 'is-confirmed' : ''}>{evidence.userVerified ? <><BadgeCheck size={13}/> User verified · {evidence.ratingCount || 'threshold met'}</> : `Community ${evidence.ratingCount}/${GEM_USER_VERIFY_MIN_RATINGS} ratings${evidence.ratingCount ? ` · ${evidence.averageRating.toFixed(1)}/5` : ''}`}</span>
          <span className={evidence.adminApproved ? 'is-admin-approved' : ''}>{evidence.adminApproved ? <><BadgeCheck size={13}/> Admin approved</> : 'Admin approval pending'}</span>
          {evidence.fullyVerified && <strong className="ek-gem-all-verified"><BadgeCheck size={14}/> Verified by all</strong>}
          {evidence.aiPassed && !evidence.userVerified && <small className="ek-gem-stage">Possible location · AI content-screened, not fact-verified</small>}
        </div>
        <div className="ek-gem-rating"><span>{user ? 'Community rating:' : 'Guest rating (this browser only):'}</span><div role="group" aria-label={`Rate ${a.name}`}>
          {[1, 2, 3, 4, 5].map(value => <button type="button" key={value} onClick={() => rate(a, value)} aria-label={`${value} star${value === 1 ? '' : 's'}`} aria-pressed={myRating === value} className={myRating >= value ? 'is-rated' : ''}><Star size={15} fill={myRating >= value ? 'currentColor' : 'none'} /></button>)}
        </div>{myRating > 0 && <small>{user ? `Your ${myRating}-star rating is saved to your account.` : `Your ${myRating}-star rating is saved on this device. Sign in to contribute to shared ratings.`}</small>}{stats?.rating_count > 0 && <small>{stats.rating_count} shared rating{stats.rating_count === 1 ? '' : 's'} · {Number(stats.average_rating).toFixed(1)}/5 average</small>}</div>
        <p className="ek-gem-review-note">Written reviews and new hidden-gem suggestions are available in the Community section.</p>
      </div>}
    </li>;
  };
  return <>
    {statusMsg && <p className="ek-small" role="status">{statusMsg}</p>}
    {gems.length > 0 && <><h4 className="ek-sub">Hidden gems (from EKTA’s record)</h4><ul className="ek-attr">{gems.map(Row)}</ul></>}
    {rest.length > 0 && <><h4 className="ek-sub">{gems.length ? 'Other attractions' : 'Attractions'}</h4><ul className="ek-attr">{rest.slice(0, 30).map(Row)}</ul></>}
    <p className="ek-small">Lists combine EKTA records, Google Places (when configured) and Wikipedia. None is guaranteed complete — confirm opening times and access with official sources.</p>
    {gems.length > 0 && <p className="ek-small">Verification policy preview: AI checks content quality only; it does not prove a place is factually safe or real. User verification requires at least {GEM_USER_VERIFY_MIN_RATINGS} ratings with an average of {GEM_USER_VERIFY_MIN_AVERAGE}+ stars. Admin approval remains separate.</p>}
  </>;
}

