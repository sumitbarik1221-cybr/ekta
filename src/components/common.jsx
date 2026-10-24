import React from 'react';
import { ExternalLink, Info } from 'lucide-react';

export const searchLinks = (name, topic) => [
  { label: `Wikivoyage: ${name}`, url: `https://en.wikivoyage.org/wiki/Special:Search?search=${encodeURIComponent(name)}` },
  { label: `Wikipedia: ${topic ? topic + ' ' : ''}${name}`, url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent((topic ? topic + ' ' : '') + name)}` },
  { label: `Web search: ${topic || 'travel'} ${name}`, url: `https://www.google.com/search?q=${encodeURIComponent((topic || 'travel guide') + ' ' + name)}` }
];

export function Badge({ tone = 'neutral', children, title }) {
  return <span className={`ek-badge ek-${tone}`} title={title}>{children}</span>;
}

export function SourceLink({ source }) {
  if (!source) return null;
  return source.url
    ? <a className="ek-source" href={source.url} target="_blank" rel="noreferrer">{source.label} <ExternalLink size={11} /></a>
    : <span className="ek-source">{source.label}</span>;
}

/** The single, honest "we don't have this" box. Never filled with generic text. */
export function LimitedData({ title, missing, name, topic, children, onAsk }) {
  return (
    <div className="ek-limited" role="note">
      <Info size={18} aria-hidden="true" />
      <div>
        <b>{title}</b>
        <p>{missing || `EKTA has no verified information on this for ${name} yet.`}</p>
        {children}
        {onAsk && <button type="button" className="secondary-button ek-ask" onClick={onAsk}>Ask AI to check (suggestions are unverified)</button>}
        <div className="ek-limited-links">
          <span>Where to look:</span>
          {searchLinks(name, topic).map(l => <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label} <ExternalLink size={11} /></a>)}
        </div>
      </div>
    </div>
  );
}
