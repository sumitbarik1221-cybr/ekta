import React, { useEffect, useMemo, useState } from 'react';
import { Utensils } from 'lucide-react';
import { wikiSummary } from '../services/wikipedia.js';
import { globalFoodProfile } from '../data/globalFood.js';
import { excerpt } from '../services/wikivoyage.js';
import { Badge, LimitedData, searchLinks } from './common.jsx';

// Photos come ONLY from the Wikipedia article named in the record (wikiTitle). No guessing of file names,
// no stock photos. If the article has no image, or it fails to load, a plain placeholder is shown.
function useWikiImage(title) {
  const [s, setS] = useState({ status: title ? 'loading' : 'none' });
  useEffect(() => {
    if (!title) { setS({ status: 'none' }); return; }
    let off = false; setS({ status: 'loading' });
    wikiSummary(title).then(w => { if (!off) setS(w?.image ? { status: 'ok', url: w.image, page: w.pageUrl, title: w.title } : { status: 'none' }); });
    return () => { off = true; };
  }, [title]);
  return [s, () => setS({ status: 'none' })];
}

const DIET = {
  veg: ['green', 'Vegetarian'], 'non-veg': ['red', 'Non-vegetarian'], varies: ['amber', 'Varies — ask'], beverage: ['neutral', 'Drink']
};

function DishCard({ dish, place }) {
  const [img, fail] = useWikiImage(dish.imageKind ? dish.wikiTitle : null);
  const [tone, label] = DIET[dish.diet] || [null, null];
  return (
    <article className="ek-dish">
      <div className="ek-dish-photo">
        {img.status === 'ok'
          ? <img src={img.url} alt={`${dish.name}${dish.imageKind === 'ingredient' ? ' (key ingredient)' : ''}`} loading="lazy" onError={fail} />
          : <div className="ek-dish-empty" aria-label="No verified photo">{img.status === 'loading' ? <span className="ek-skel" /> : <><Utensils size={22} aria-hidden="true" /><small>No verified photo</small></>}</div>}
      </div>
      <div className="ek-dish-body">
        <div className="ek-dish-tags">
          {label && <Badge tone={tone}>{label}</Badge>}
          {dish.scope === 'shared' && <Badge tone="neutral" title={`Also found in ${(dish.sharedWith || []).join(', ')}`}>Shared across region</Badge>}
        </div>
        <b>{dish.name}</b>
        {dish.description ? <p>{dish.description}</p> : <p className="ek-muted">No verified description yet.</p>}
        {dish.ingredients?.length > 0 && <p className="ek-small"><b>Typical ingredients:</b> {dish.ingredients.join(', ')}</p>}
        {dish.dietNote && <p className="ek-small"><b>Diet note:</b> {dish.dietNote}</p>}
        {dish.variations && <p className="ek-small">{dish.variations}</p>}
        {dish.sharedWith?.length > 0 && <p className="ek-small">Also found in: {dish.sharedWith.join(', ')}.</p>}
        {img.status === 'ok' && (
          <p className="ek-small ek-credit">
            Photo: <a href={img.page} target="_blank" rel="noreferrer">Wikipedia “{img.title}”</a>
            {dish.imageKind === 'ingredient' ? ' — shows the key ingredient, not necessarily this dish' : ''}
            {dish.note ? ` — ${dish.note}` : ''}
          </p>
        )}
        {!dish.description && <a className="ek-small" href={searchLinks(dish.name, 'dish')[1].url} target="_blank" rel="noreferrer">Look this dish up</a>}
      </div>
    </article>
  );
}

export default function FoodExplorer({ guide, onAsk }) {
  const curatedFood = globalFoodProfile(guide);
  const record = guide.record || (curatedFood ? { ...curatedFood, name: curatedFood.city, type: 'region', tier: 'curated-food' } : null);
  const parentRecord = guide.parentRecord;
  const scope = guide.scope;
  const name = guide.title;
  const [filter, setFilter] = useState('all');
  useEffect(() => setFilter('all'), [guide.key]);

  const groups = useMemo(() => {
    if (!record || !record.dishes?.length) return [];
    const seen = new Set();
    const take = list => list.filter(d => { const k = d.wikiTitle || d.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
    const out = [];
    if (record.type === 'city') {
      out.push({ id: 'local', title: `Associated with ${record.name}`, items: take(record.dishes.filter(d => d.scope === 'city')) });
      out.push({ id: 'region', title: `Also eaten across ${parentRecord?.name || 'the wider region'}`, note: `Not unique to ${record.name}.`, items: take([...record.dishes.filter(d => d.scope !== 'city'), ...(parentRecord?.dishes || [])]) });
    } else if (scope === 'parent' || scope === 'country') {
      out.push({ id: 'region', title: `Across ${record.name}`, note: `This is ${record.type === 'country' ? 'country' : 'state'}-wide information. EKTA has no dish records specific to ${name}, so these dishes are not necessarily unique to it.`, items: take(record.dishes) });
    } else {
      out.push({ id: 'regional', title: `Traditional food of ${record.name}`, items: take(record.dishes.filter(d => d.scope !== 'shared')) });
      out.push({ id: 'shared', title: 'Shared with neighbouring regions', note: 'Popular here, but not unique to this place.', items: take(record.dishes.filter(d => d.scope === 'shared')) });
    }
    return out.filter(g => g.items.length);
  }, [record, parentRecord, scope, name, guide.key]);

  if (!record || !record.dishes?.length) {
    const eat = guide.voyage?.sections?.eat;
    return <div className="ek-food">
      {eat ? <section className="ek-voyage">
        <Badge tone="blue">Food and eating · Wikivoyage · CC BY-SA</Badge>
        <p className="ek-voyage-text">{excerpt(eat, 2200)}</p>
        <p className="ek-small">Community-written food notes for {name}; this is sourced destination coverage, not a complete dish catalog. EKTA does not infer ingredients, diet, dish origins, or photos from these notes. <a href={guide.voyage.url} target="_blank" rel="noreferrer">Read the full Wikivoyage guide</a>.</p>
      </section> : <LimitedData title={`Local food in ${name}`} name={name} topic="cuisine"
        onAsk={onAsk && (() => onAsk(`What are the traditional local dishes of ${name}? Say which are vegetarian, and flag anything you are not sure about.`))}
        missing={`No sourced food section was available for ${name}. EKTA will not substitute dishes from another place.`} />}
      <p className="ek-small">No destination-verified dish photographs are available here yet. Photos are not filled with generic search results.</p>
    </div>;
  }

  const described = record.dishes.some(d => d.description);
  if (record.tier === 'starter' && !described) {
    return (
      <div>
        <div className="ek-note"><b>Starter notes — names only.</b> These dish names come from EKTA’s early notes for {record.name}{scope !== 'exact' ? ` as a whole — they are not verified as specific to ${name}` : ''}. They have no descriptions, photos or dietary labels yet, so none are shown rather than guessed.</div>
        <div className="ek-chips">{record.dishes.map(d => <a key={d.id} className="ek-chip" href={searchLinks(d.name, 'dish')[1].url} target="_blank" rel="noreferrer">{d.name}</a>)}</div>
        <div className="ek-limited-links"><span>Find more:</span>{searchLinks(record.name, 'cuisine').map(l => <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label}</a>)}</div>
      </div>
    );
  }

  const keep = d => filter === 'all' || d.diet === filter;
  const hasDiet = record.dishes.some(d => d.diet);
  return (
    <div className="ek-food">
      {hasDiet && (
        <div className="ek-filter" role="group" aria-label="Filter dishes by diet">
          {[['all', 'All'], ['veg', 'Vegetarian'], ['non-veg', 'Non-vegetarian'], ['varies', 'Varies']].map(([k, l]) =>
            <button key={k} type="button" className={filter === k ? 'on' : ''} aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>)}
        </div>
      )}
      <p className="ek-small">Diet labels are typical, not guaranteed — recipes vary by household and vendor. “Vegetarian” here is not “vegan”; always ask about ingredients.</p>
      {groups.map(g => {
        const items = g.items.filter(keep);
        return (
          <section key={g.id} className="ek-food-group">
            <h4>{g.title}</h4>
            {g.note && <p className="ek-small">{g.note}</p>}
            {items.length ? <div className="ek-dish-grid">{items.map(d => <DishCard key={d.id} dish={d} place={name} />)}</div> : <p className="ek-muted">No dishes in this group match the filter.</p>}
          </section>
        );
      })}
      {curatedFood && !guide.record && <p className="ek-small">Curated destination associations for {curatedFood.city}, {curatedFood.region}, {curatedFood.country}. These dishes are associated with the area; that does not establish where a dish originated. Photos appear only when a named Wikipedia dish article supplies one. Article-level matching is not independent visual verification, so uncertain or unavailable photos remain clearly identified.</p>}
      <p className="ek-small">Restaurants and food markets: EKTA has no verified listings. Use the map’s nearby search or a local source.</p>
    </div>
  );
}
