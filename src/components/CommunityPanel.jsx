import { useEffect, useState } from 'react';
import { Info, Send, Star } from 'lucide-react';
import { supabase } from '../lib/supabase.js';

function placeKeyFor(place, guide) {
  if (guide?.key) return guide.key;
  if (place?.key) return place.key;
  return String(place?.name || 'ekta')
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-');
}

export default function CommunityPanel({ place, guide, user, onSignIn, toast }) {
  const placeKey = placeKeyFor(place, guide);
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState('');
  const [gemName, setGemName] = useState('');
  const [gemDescription, setGemDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!supabase) return () => { active = false; };
    supabase.from('reviews')
      .select('id,body,created_at')
      .eq('place_key', placeKey)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error: queryError }) => {
        if (!active) return;
        if (queryError) {
          setError('Community reviews could not be loaded right now.');
          return;
        }
        setReviews(data || []);
      });
    return () => { active = false; };
  }, [placeKey]);

  async function submitReview(event) {
    event.preventDefault();
    if (!user || !supabase) return;
    setBusy(true);
    setError('');
    const { error: submitError } = await supabase.from('reviews').insert({
      user_id: user.id,
      place_key: placeKey,
      body: review.trim(),
      status: 'pending'
    });
    setBusy(false);
    if (submitError) {
      setError(submitError.message || 'Could not submit your review.');
      return;
    }
    setReview('');
    toast?.('Review submitted for moderation. It will appear after approval.');
  }

  async function submitGem(event) {
    event.preventDefault();
    if (!user || !supabase || !guide) return;
    setBusy(true);
    setError('');
    const { error: submitError } = await supabase.from('gem_suggestions').insert({
      destination_key: guide.key,
      destination_name: guide.title,
      name: gemName.trim(),
      description: gemDescription.trim(),
      latitude: latitude === '' ? null : Number(latitude),
      longitude: longitude === '' ? null : Number(longitude),
      submitted_by: user.id,
      status: 'pending_ai'
    });
    setBusy(false);
    if (submitError) {
      setError(submitError.message || 'Could not submit your suggestion.');
      return;
    }
    setGemName('');
    setGemDescription('');
    setLatitude('');
    setLongitude('');
    toast?.('Hidden-gem suggestion submitted for review.');
  }

  if (!supabase) return <div className="modal-callout"><Info/><div><b>Community database is unavailable</b><p>Check the Supabase project URL and publishable key configuration.</p></div></div>;

  return <div className="community-panel">
    {!user ? <div className="modal-callout"><Star/><div><b>Sign in to contribute</b><p>Reviews and hidden-gem suggestions are stored in Supabase and moderated before they become public.</p></div><button className="primary-button" type="button" onClick={onSignIn}>Sign in <Send size={15}/></button></div>
      : <p className="source-note">Signed in as {user.email || 'your account'}. Community submissions are reviewed before publication.</p>}

    <h4>Community reviews for {place.name}</h4>
    {reviews.length ? <ul className="community-review-list">{reviews.map(item => <li key={item.id}><p>{item.body}</p><small>{new Date(item.created_at).toLocaleDateString()}</small></li>)}</ul> : <p className="muted">No approved community reviews yet.</p>}
    {user && <form onSubmit={submitReview}>
      <label className="field-label" htmlFor="community-review">Write a review (10–2000 characters)</label>
      <textarea id="community-review" rows="4" minLength="10" maxLength="2000" required value={review} onChange={event => setReview(event.target.value)} placeholder="Share a useful first-hand experience."/>
      <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit review for moderation'} <Send size={15}/></button>
    </form>}

    <h4>Suggest a hidden gem{guide ? ` near ${guide.title}` : ''}</h4>
    {user && guide ? <form onSubmit={submitGem}>
      <label className="field-label" htmlFor="community-gem-name">Place name</label>
      <input id="community-gem-name" required minLength="2" maxLength="160" value={gemName} onChange={event => setGemName(event.target.value)} placeholder="A small cafe, viewpoint, park…"/>
      <label className="field-label" htmlFor="community-gem-description">Why should travellers visit? (20–1200 characters)</label>
      <textarea id="community-gem-description" required minLength="20" maxLength="1200" value={gemDescription} onChange={event => setGemDescription(event.target.value)} placeholder="Describe what you experienced and how travellers can find it."/>
      <div className="form-grid">
        <label><span>Latitude (optional)</span><input type="number" min="-90" max="90" step="any" value={latitude} onChange={event => setLatitude(event.target.value)}/></label>
        <label><span>Longitude (optional)</span><input type="number" min="-180" max="180" step="any" value={longitude} onChange={event => setLongitude(event.target.value)}/></label>
      </div>
      <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit suggestion for moderation'} <Send size={15}/></button>
    </form> : <p className="muted">Search for a destination to suggest a hidden gem there.</p>}
    {error && <p role="status" className="source-note">{error}</p>}
    <small className="source-note">Submissions remain private while pending. AI content screening and admin approval are separate; a community rating does not prove a place is safe or accurate.</small>
  </div>;
}
