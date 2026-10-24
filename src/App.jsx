import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, MapPin, Compass, Heart, Menu, X, ArrowRight, Sparkles, Sun, Moon, Globe2, CloudSun, ShieldCheck, Hospital, Accessibility, PawPrint, Map, Palette, ShoppingBag, Mic, Bot, Languages, CalendarDays, Wallet, Leaf, Star, Wifi, Camera, Landmark, Users, Clock, ChevronRight, Navigation, LocateFixed, Send, Bookmark, CheckCircle2, Info, SlidersHorizontal, ExternalLink, Copy, Plus, Minus, Route, Wind, ThermometerSun, Share2 } from 'lucide-react';

import { destinations, destinationImageOverrides } from './data/curatedDestinations.js';
import { resolveDestination, toPlace, DestinationNotFound } from './services/resolver.js';
import { loadLiveAttractions, mergeAttractions, haversineKm } from './services/places.js';
import { searchPlaces } from './services/geocode.js';
import { fetchWeather } from './services/weather.js';
import SearchInput from './components/SearchInput.jsx';
import DestinationGuide from './components/DestinationGuide.jsx';
import GuideMap from './components/GuideMap.jsx';
import WeatherPanel from './components/WeatherPanel.jsx';
import FoodExplorer from './components/FoodExplorer.jsx';
import { SourceLink } from './components/common.jsx';
import { AssistantPanel, BudgetPanel, ItineraryPanel } from './components/ToolPanels.jsx';
import AuthPage from './auth/AuthPage.jsx';
import { useAuth } from './auth/AuthContext.jsx';
import { supabase } from './lib/supabase.js';
import CommunityPanel from './components/CommunityPanel.jsx';
import './auth/nav.css';


const featureList = [
 ['Cultural Intelligence','Local customs, temple etiquette, dress and photography guidance.',Landmark,'#c58b46'],['Off-Season Discovery','Find calmer alternatives and the best time to visit.',Compass,'#629b84'],['Crowd Intelligence','Crowd guidance with source, timestamp and confidence.',Users,'#d68c64'],['Hidden Gems Explorer','Go beyond the usual tourist checklist.',Sparkles,'#8c7bc5'],['Unknown Facts & History','Context, local history and interesting facts.',BookIcon,'#bd8951'],['Weather Intelligence','Current conditions and forecast for your destination.',CloudSun,'#5f9ec7'],["Women’s Safety & SOS",'Safety checklist, emergency guidance and trusted contacts.',ShieldCheck,'#d26f76'],['Nearby Essentials','Find hospitals, pharmacies, clinics and police stations.',Hospital,'#d26f76'],['Accessibility Guide','Check mobility information and accessibility notes.',Accessibility,'#7298ad'],['Wildlife Awareness','Responsible wildlife viewing and safety guidance.',PawPrint,'#6d9b67'],['Interactive Map','Explore places and services on a live map.',Map,'#5d9da4'],['Local Artisans','Discover craft traditions and maker communities.',Palette,'#b58b62'],['Local Shops & Food','Markets, regional food and locally made products.',ShoppingBag,'#d28e55'],['Local Stories','Stories and heritage shared by communities.',Mic,'#9477b5'],['Local Experiences','Workshops, heritage walks and community experiences.',Users,'#5f9e8d'],['AI Travel Guide','Ask destination-aware questions and get trip ideas.',Bot,'#7a7bd0'],['Translator','Translate travel phrases and use speech where supported.',Languages,'#539caa'],['Itinerary Builder','Build a day-by-day plan around budget and interests.',CalendarDays,'#d59a4b'],['Nearby Discovery','Use your permission-based location to find places nearby.',LocateFixed,'#5b9a85'],['Smart Budget','Estimate food, transport, stays and activities.',Wallet,'#69a17a'],['Responsible Travel Score','Understand practical, transparent sustainable choices.',Leaf,'#6c9d74'],['Reviews & Corrections','Share feedback and flag information that needs checking.',Star,'#c99c4e'],['Saved Places & Trips','Keep a shortlist and plan for your next journey.',Heart,'#d47d8a'],['Offline Travel Guide','Save a destination snapshot for low-connectivity travel.',Wifi,'#7a9aa5'],['Photo Place Discovery','Upload a photo for help identifying a place or craft.',Camera,'#947ac1']
];
function BookIcon(props){return <Landmark {...props}/>}
const shorten=(t,n)=>{if(!t||t.length<=n)return t;const cut=t.slice(0,n);const i=Math.max(cut.lastIndexOf('. '),cut.lastIndexOf('; '));return (i>n*0.5?cut.slice(0,i+1):cut.replace(/\s+\S*$/,'')+'…')};
const safeFetch=async(url)=>{const r=await fetch(url);if(!r.ok)throw new Error('Service unavailable');return r.json()};
function App(){
 const {user,signOut,passwordRecovery,clearPasswordRecovery}=useAuth(); const [authMode,setAuthMode]=useState(null); const [authError,setAuthError]=useState('');
 useEffect(()=>{if(passwordRecovery){setAuthMode('reset');setAuthError('')}},[passwordRecovery]);
 const [query,setQuery]=useState(''); const [guide,setGuide]=useState(null); const [aiSeed,setAiSeed]=useState(null); const [live,setLive]=useState({status:'idle',items:[],key:null}); const [selectedSpot,setSelectedSpot]=useState(null); const [located,setLocated]=useState({key:null,map:{}}); const [weatherState,setWeatherState]=useState({status:'idle'}); const [budgetStyle,setBudgetStyle]=useState('balanced'); const [recents,setRecents]=useState(()=>{try{return JSON.parse(localStorage.getItem('ekta-recent')||'[]')}catch{return[]}}); const ctrlRef=useRef(null); const reqRef=useRef(0); const guideKeyRef=useRef(null); const [locating,setLocating]=useState(false); const [searching,setSearching]=useState(false); const [searchError,setSearchError]=useState(''); const [saved,setSaved]=useState(()=>JSON.parse(localStorage.getItem('ekta-saved')||'[]')); const [dark,setDark]=useState(false); const [menu,setMenu]=useState(false); const [feature,setFeature]=useState(null); const [toast,setToast]=useState(''); const [nearby,setNearby]=useState([]); const [nearbyLoading,setNearbyLoading]=useState(false); const [currentCoords,setCurrentCoords]=useState(null); const [currentLocationLabel,setCurrentLocationLabel]=useState(''); const [aiQuestion,setAiQuestion]=useState(''); const [aiAnswer,setAiAnswer]=useState(''); const [budget,setBudget]=useState({days:3,amount:12000,style:'balanced',startDate:new Date().toISOString().slice(0,10),endDate:new Date(Date.now()+2*86400000).toISOString().slice(0,10)}); const [interests,setInterests]=useState(['Culture','Food']); const [itinerary,setItinerary]=useState(null); const [language,setLanguage]=useState('hi'); const [phrase,setPhrase]=useState('Where is the nearest hospital?'); const [translated,setTranslated]=useState(''); const [translating,setTranslating]=useState(false); const [review,setReview]=useState(''); const [reviews,setReviews]=useState(()=>JSON.parse(localStorage.getItem('ekta-reviews')||'[]')); const [photo,setPhoto]=useState(null); const [photoResult,setPhotoResult]=useState(''); const [crowd,setCrowd]=useState(''); const [checklist,setChecklist]=useState([]); const [tripNote,setTripNote]=useState('');
 const [showHiddenGems,setShowHiddenGems]=useState(false);
 const [dbGems,setDbGems]=useState([]);
 const [gemSelections,setGemSelections]=useState(()=>{try{return JSON.parse(localStorage.getItem('ekta-gem-map-selection-v1')||'{}')}catch{return{}}});
 useEffect(()=>{localStorage.setItem('ekta-saved',JSON.stringify(saved))},[saved]);
 useEffect(()=>{try{localStorage.setItem('ekta-gem-map-selection-v1',JSON.stringify(gemSelections))}catch{/* Browser storage may be unavailable. */}},[gemSelections]);
 useEffect(()=>{
  const move=e=>{
   document.documentElement.style.setProperty('--cursor-x',`${e.clientX}px`);
   document.documentElement.style.setProperty('--cursor-y',`${e.clientY}px`);
   const card=e.target.closest?.('.destination-card, .feature-card, .destination-food-card, .food-card, .mini-destinations button');
   if(card && window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    const r=card.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
    card.style.setProperty('--pointer-x',`${px*100}%`); card.style.setProperty('--pointer-y',`${py*100}%`);
    card.style.setProperty('--tilt-x',`${(0.5-py)*3}deg`); card.style.setProperty('--tilt-y',`${(px-0.5)*3}deg`);
   }
  };
  const reset=e=>{const card=e.target.closest?.('.destination-card, .feature-card, .destination-food-card, .food-card, .mini-destinations button');if(card){card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg')}};
  window.addEventListener('pointermove',move,{passive:true}); document.addEventListener('pointerout',reset,{passive:true});
  return()=>{window.removeEventListener('pointermove',move);document.removeEventListener('pointerout',reset)};
 },[]);
 useEffect(()=>{
  if(!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const nodes=document.querySelectorAll('.trust-strip, #explore .section-heading, .destination-card, .mini-destinations button, #destination-detail .detail-header, #destination-detail .detail-main, #destination-detail .detail-side, .feature-card, .planner-content, .planner-stamp, .community-copy, .community-quote');
  nodes.forEach((node,i)=>{node.classList.add('scroll-reveal');node.style.setProperty('--reveal-delay',`${Math.min(i%6,5)*65}ms`)});
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -35px 0px'});
  nodes.forEach(node=>observer.observe(node));
  return()=>observer.disconnect();
 },[]);
 useEffect(()=>{localStorage.setItem('ekta-reviews',JSON.stringify(reviews))},[reviews]);useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),3000);return()=>clearTimeout(t)}},[toast]);
 useEffect(()=>{
  let active=true;
  if(!supabase||!guide){setDbGems([]);return()=>{active=false}};
  supabase.from('gem_suggestions')
   .select('id,name,description,latitude,longitude,ai_checked,ai_passed,admin_approved,status')
   .eq('destination_key',guide.key)
   .in('status',['possible','user_verified','admin_approved','verified_all'])
   .then(({data,error})=>{
    if(!active)return;
    if(error){setDbGems([]);return}
    setDbGems((data||[]).map(row=>({
     name:row.name,note:row.description,kind:'community hidden gem',place:guide.title,
     hidden:true,source:'EKTA community suggestion',
     ...(Number.isFinite(row.latitude)&&Number.isFinite(row.longitude)?{lat:row.latitude,lon:row.longitude,hasCoords:true}:{}),
     verification:{
      aiChecked:row.ai_checked,aiPassed:row.ai_passed,
      userVerified:row.status==='user_verified'||row.status==='verified_all',
      adminApproved:row.admin_approved||row.status==='admin_approved'||row.status==='verified_all'
     }
    })));
   });
  return()=>{active=false};
 },[guide?.key]);
 const place=guide?toPlace(guide):destinations[0];
 const remember=name=>setRecents(prev=>{const n=[name,...prev.filter(x=>x.toLowerCase()!==name.toLowerCase())].slice(0,6);try{localStorage.setItem('ekta-recent',JSON.stringify(n))}catch{}return n});
 // Every search gets a token; only the newest request may update the page (prevents stale results).
 async function searchPlace(e, queryOverride, suggestion, curated){
  e?.preventDefault(); const q=(suggestion?.name ?? queryOverride ?? query).trim(); if(!q)return;
  const token=++reqRef.current; ctrlRef.current?.abort(); const ctrl=new AbortController(); ctrlRef.current=ctrl;
  setSearching(true); setSearchError('');
  try{
   const g=await resolveDestination({query:q,suggestion,signal:ctrl.signal});
   if(token!==reqRef.current)return;
   const pickedCurated=curated||destinations.find(d=>d.name.toLowerCase()===g.title.toLowerCase());
   if(pickedCurated){g.curated=pickedCurated;if(!g.image&&pickedCurated.image)g.image={url:pickedCurated.image,credit:'EKTA curated card'};if(!g.description)g.description={text:pickedCurated.description,source:{label:'EKTA curated card'}}}
   const imageName=(g.title||'').normalize('NFKC').toLocaleLowerCase().split(/[,(]/)[0].trim();
   if(destinationImageOverrides[imageName])g.image=destinationImageOverrides[imageName];
   guideKeyRef.current=g.key; setGuide(g); setQuery(g.title); setSelectedSpot(null); setShowHiddenGems(false); remember(g.title);
   setTimeout(()=>document.getElementById('destination-detail')?.scrollIntoView({behavior:'smooth',block:'start'}),180);
  }catch(err){
   if(token!==reqRef.current||err?.name==='AbortError')return;
   setSearchError(err instanceof DestinationNotFound?`No place found for “${q}”. Check the spelling, or try a larger nearby place, a state or a country.`:err?.name==='GeocoderUnavailable'?'Place search is unavailable right now (network or service). Destinations EKTA already has records for still work; try again shortly.':'Something went wrong while searching. Please try again.');
  }finally{if(token===reqRef.current)setSearching(false)}
 }
 function openCurated(d){setQuery(d.name);searchPlace(null,d.name,{id:'curated:'+d.name,name:d.name,kind:d.name===d.state?'region':'city',lat:d.lat,lon:d.lon,state:d.state,city:d.name===d.state?null:d.name,country:'India',countryCode:'in',bbox:null,displayName:`${d.name}, ${d.state}, India`,source:'EKTA curated card'},d)}
 const gemLookupRef=useRef(new Set());
 async function locateSpot(a,{select=true}={}){
  if(!guide)return;const key=guide.key;
  if(gemLookupRef.current.has(`${key}::${a.name}`))return;
  gemLookupRef.current.add(`${key}::${a.name}`);
  try{const r=await searchPlaces(`${a.name}, ${guide.record?.name||guide.title}`,{countryCode:guide.geo.countryCode,limit:1});const hit=r[0];if(guideKeyRef.current!==key)return;
   if(!hit||haversineKm(hit,guide.geo)>150){setToast(`Could not find “${a.name}” near ${guide.title}. Try searching it directly.`);return}
   setLocated(p=>({key,map:{...(p.key===key?p.map:{}),[a.name]:{lat:hit.lat,lon:hit.lon}}}));if(select)setSelectedSpot({...a,lat:hit.lat,lon:hit.lon,hasCoords:true,precision:'approx'});
  }catch{setToast('Map lookup is unavailable right now.')}
  finally{gemLookupRef.current.delete(`${key}::${a.name}`)}
 }
 const attractions=useMemo(()=>{if(!guide)return [];const wide=guide.record?.tier==='starter'&&guide.scope!=='exact';const editorial=wide?[]:(guide.record?.attractions||[]);const curatedGems=(guide.curated?.gems||[]).map(name=>({name,kind:'hidden gem',place:guide.title,hidden:true,source:'EKTA curated destination notes'}));const base=mergeAttractions([...editorial,...curatedGems,...dbGems],live.key===guide.key?live.items:[]);const loc=located.key===guide.key?located.map:{};return base.map(a=>loc[a.name]&&!a.hasCoords?{...a,...loc[a.name],hasCoords:true,precision:'approx'}:a)},[guide,live,located,dbGems]);
 const hiddenGemKey=name=>String(name||'').normalize('NFKC').trim().toLocaleLowerCase();
 const isHiddenGemChecked=a=>gemSelections[`${guide?.key}::${hiddenGemKey(a.name)}`]??true;
 function toggleHiddenGem(a,checked){setGemSelections(previous=>({...previous,[`${guide?.key}::${hiddenGemKey(a.name)}`]:checked}));if(!checked&&selectedSpot?.name===a.name)setSelectedSpot(null);if(checked&&showHiddenGems&&!a.hasCoords)locateSpot(a,{select:false})}
 function toggleHiddenGemLayer(checked){setShowHiddenGems(checked);if(!checked&&selectedSpot?.hidden)setSelectedSpot(null);if(checked){const key=guide?.key;const missing=attractions.filter(a=>a.hidden&&isHiddenGemChecked(a)&&!a.hasCoords&&!gemLookupRef.current.has(`${key}::${a.name}`));(async()=>{for(const [index,gem] of missing.entries()){if(index)await new Promise(resolve=>setTimeout(resolve,1100));if(guideKeyRef.current!==key)return;await locateSpot(gem,{select:false})}})()}}
 async function loadWeather(g){const key=g.key;setWeatherState({status:'loading'});try{const d=await fetchWeather(g.geo.lat,g.geo.lon);if(guideKeyRef.current!==key)return;setWeatherState({status:'ok',data:d})}catch{if(guideKeyRef.current!==key)return;setWeatherState({status:'error'})}}
 // Everything below is keyed to the current guide: switching destination cancels and resets it.
 useEffect(()=>{
  if(!guide)return;const ctrl=new AbortController();const key=guide.key;
  setLive({status:'loading',items:[],key});setNearby([]);
  loadLiveAttractions(guide,{signal:ctrl.signal}).then(r=>{if(!ctrl.signal.aborted)setLive({status:r.placesStatus,items:r.items,key})});
  loadWeather(guide);
  return()=>ctrl.abort();
 },[guide?.key]);

 async function useCurrentLocation(){
  if(!navigator.geolocation){setSearchError('This browser does not support location.');return;}
  setLocating(true);setSearchError('');
  navigator.geolocation.getCurrentPosition(async position=>{
   try{
    const {latitude,longitude}=position.coords;
    const data=await safeFetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
    const address=data.address||{};
    const destination=address.city||address.town||address.village||address.suburb||address.state_district||address.state||address.country||'My current location';
    setCurrentCoords({lat:latitude,lon:longitude});
    setCurrentLocationLabel(data.display_name||destination);
    setQuery(destination);
    setLocating(false);
    await loadNearbyAt({lat:latitude,lon:longitude});
    await searchPlace(null,destination);
   }catch{
    setLocating(false);
    setSearchError('Could not identify your location. Please try searching your city or state manually.');
   }
  },()=>{
   setLocating(false);
   setSearchError('Location permission was denied or unavailable. You can still search any destination manually.');
  },{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
 }

 async function loadNearbyAt(coords){if(!coords?.lat||!coords?.lon)return;setNearbyLoading(true);setNearby([]);try{const q=`[out:json][timeout:20];(node(around:5000,${coords.lat},${coords.lon})[amenity~"hospital|clinic|pharmacy|police|doctors|restaurant|cafe|marketplace"];way(around:5000,${coords.lat},${coords.lon})[tourism~"attraction|museum|viewpoint|hotel"];);out center tags 40;`;const d=await safeFetch('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(q));setNearby((d.elements||[]).map(x=>({id:x.id,name:x.tags?.name||x.tags?.amenity||x.tags?.tourism||'Nearby place',type:(x.tags?.amenity||x.tags?.tourism||'Place').replaceAll('_',' '),lat:x.lat||x.center?.lat,lon:x.lon||x.center?.lon})).filter(x=>x.lat&&x.lon).slice(0,24));}catch{setNearby([]);setToast('Nearby map service is busy. Please try again in a moment.')}finally{setNearbyLoading(false)}}
 async function loadNearby(){const coords=currentCoords||place;if(!coords)return;await loadNearbyAt(coords)}
 function toggleSave(p){setSaved(prev=>prev.some(x=>x.name===p.name)?prev.filter(x=>x.name!==p.name):[...prev,{name:p.name,state:p.state,lat:p.lat,lon:p.lon,image:p.image}]);setToast(saved.some(x=>x.name===p.name)?'Removed from saved places':'Destination saved for your trip')}
 function openFeature(i){setFeature(i);setMenu(false)}
 async function translateText(){setTranslating(true);setTranslated('');try{const d=await safeFetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(phrase)}&langpair=en|${language}`);setTranslated(d.responseData?.translatedText||'Translation unavailable')}catch{const local={'hi':'नज़दीकी अस्पताल कहाँ है?','bn':'নিকটতম হাসপাতাল কোথায়?','ta':'அருகிலுள்ள மருத்துவமனை எங்கே?','te':'సమీప ఆసుపత్రి ఎక్కడ ఉంది?','mr':'जवळचे रुग्णालय कुठे आहे?','es':'¿Dónde está el hospital más cercano?'};setTranslated(local[language]||'Translation service unavailable. Please try again online.')}finally{setTranslating(false)}}
 function submitReview(e){e.preventDefault();if(!review.trim())return;setReviews(prev=>[{place:place.name,text:review.trim(),date:new Date().toLocaleDateString()},...prev].slice(0,30));setReview('');setToast('Thanks! Your local note is saved on this device for demo purposes.')}
 function identifyPhoto(file){if(!file)return;setPhoto(URL.createObjectURL(file));setPhotoResult(`Photo selected: ${file.name}. This demo cannot verify image identity without a configured vision API. Compare it with the destination photos and use the AI guide for contextual help.`)}
 const savedNames=useMemo(()=>new Set(saved.map(x=>x.name)),[saved]);
  if(authMode)return <AuthPage initialMode={authMode} onBack={()=>{clearPasswordRecovery();setAuthMode(null)}}/>;
  return <div className={dark?'app dark':'app'}>
  <div className="cursor-glow" aria-hidden="true"/>
  <div className="topline">
  <span>✦ INDIA, THROUGH LOCAL EYES</span>
  <span>Travel curious. Travel conscious. <span className="top-dot">●</span>
  </span>
  </div>
  <header className="nav">
  <a className="brand" href="#home" onClick={()=>{setGuide(null);guideKeyRef.current=null;setQuery('')}}>
  <span className="brand-mark">
  <Compass size={25}/>
  </span>
  <span>ekta<span className="brand-dot">.</span>
  <small>ONE INDIA. ENDLESS JOURNEYS.</small>
  </span>
  </a>
  <nav className={menu?'navlinks show':'navlinks'}>
  <a href="#explore" onClick={()=>setMenu(false)}>Explore the world</a>
  <a href="#features" onClick={()=>setMenu(false)}>Experiences</a>
  <a href="#planner" onClick={()=>setMenu(false)}>Trip planner</a>
  <a href="#community" onClick={()=>setMenu(false)}>Community</a>
  </nav>
  <div className="nav-actions">
  <button className="icon-button" aria-label="Toggle theme" onClick={()=>setDark(!dark)}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button>
   {user?<button className="auth-nav-button" title={user.email||'Signed in'} onClick={async()=>{setAuthError('');try{await signOut()}catch(e){setAuthError(e.message||'Could not sign out')}}}>Sign out</button>:<button className="auth-nav-button" onClick={()=>setAuthMode('signin')}>Sign in</button>}
  <button className="saved-top" onClick={()=>openFeature(22)}>
  <Heart size={17}/> <span>Saved</span>
  <b>{saved.length}</b>
  </button>
  <button className="icon-button mobile-menu" onClick={()=>setMenu(!menu)} aria-label="Menu">{menu?<X/>:<Menu/>}</button>
  </div>
  </header>
  {authError&&<div className="auth-nav-error" role="alert">{authError}</div>}
  <main id="home">
  <section className="hero">
  <div className="hero-image">
  </div>
  <div className="hero-overlay">
  </div>
  <div className="hero-content">
  <div className="eyebrow">
  <span>
  </span> A MORE MEANINGFUL WAY TO EXPLORE</div>
  <h1>Find your <em>world.</em>
  <br/>Feel its <em>stories.</em>
  </h1>
  <p>From hidden mountain trails to living heritage lanes — discover the places, people and traditions that make every journey matter.</p>
  <SearchInput value={query} onChange={setQuery} onSubmit={searchPlace} onPick={sg=>{setQuery(sg.name);searchPlace(null,sg.name,sg)}} busy={searching} recents={recents}/>
  <button className="current-location-button" type="button" onClick={useCurrentLocation} disabled={locating}>
  <LocateFixed size={16}/>{locating?'Finding your location…':'Use my current location'}</button>
  <div className="search-note">
  <MapPin size={14}/> Worldwide discovery <span>·</span> Local insights <span>·</span> Thoughtful travel</div>{searchError&&<div className="search-error">{searchError}</div>}</div>
  <div className="hero-bottom">
  <span>
  <b>25</b> thoughtful travel tools</span>
  <span>
  <b>08</b> curated destinations</span>
  <span>
  <b>01</b> diverse India</span>
  </div>
  <div className="hero-caption">THE WORLD IS YOURS <span>— EXPLORE WITH EKTA</span>
  </div>
  </section>
  {currentCoords&&<section className="current-location-section content-width" aria-live="polite">
   <div className="current-location-heading"><div><span className="kicker">YOUR NEIGHBOURHOOD</span><h2>Explore <em>around you</em></h2><p>{currentLocationLabel||'Your current location'} · Nearby results are based on your browser-approved location.</p></div><button className="secondary-button" onClick={()=>loadNearbyAt(currentCoords)} disabled={nearbyLoading}><LocateFixed size={16}/>{nearbyLoading?'Refreshing…':'Refresh nearby'}</button></div>
   {nearbyLoading&&nearby.length===0?<p className="muted">Finding nearby places from OpenStreetMap…</p>:nearby.length>0?<div className="current-nearby-grid">{nearby.slice(0,8).map(n=><a className="current-nearby-card" key={n.id} href={`https://www.openstreetmap.org/?mlat=${n.lat}&mlon=${n.lon}#map=17/${n.lat}/${n.lon}`} target="_blank" rel="noreferrer"><span className="nearby-icon"><MapPin size={17}/></span><span><b>{n.name}</b><small>{n.type}</small></span><ExternalLink size={14}/></a>)}</div>:<p className="muted">No nearby places returned just now. Try refresh or open the map around your location.</p>}
   <a className="current-map-link" href={`https://www.openstreetmap.org/#map=15/${currentCoords.lat}/${currentCoords.lon}`} target="_blank" rel="noreferrer"><Map size={16}/> Open map around my location <ArrowRight size={15}/></a>
  </section>}
  <section className="trust-strip">
  <div>
  <ShieldCheck/>
  <span>
  <b>Travel with care</b>
  <small>Safety & cultural context</small>
  </span>
  </div>
  <div>
  <Leaf/>
  <span>
  <b>Leave a lighter footprint</b>
  <small>Responsible choices</small>
  </span>
  </div>
  <div>
  <Users/>
  <span>
  <b>Meet local India</b>
  <small>People, craft & stories</small>
  </span>
  </div>
  <div>
  <Globe2/>
  <span>
  <b>Made for curious travellers</b>
  <small>One place to plan more</small>
  </span>
  </div>
  </section>
  <section className="section content-width" id="explore">
  <div className="section-heading">
  <div>
  <span className="kicker">A WORLD OF MANY WONDERS</span>
  <h2>Where will your story <em>begin?</em>
  </h2>
  <p>Handpicked destinations to start your journey. Search any country, state, city or landmark worldwide for a location-specific guide.</p>
  </div>
  <a className="text-button" href="#features">Explore all tools <ArrowRight size={16}/>
  </a>
  </div>
  <div className="destination-grid">{destinations.slice(0,4).map(d=>
  <DestinationCard key={d.name} d={d} saved={savedNames.has(d.name)} onOpen={()=>openCurated(d)} onSave={()=>toggleSave(d)}/>)}</div>
  <div className="mini-destinations">{destinations.slice(4).map(d=>
  <button key={d.name} onClick={()=>openCurated(d)}>
  <span>{d.category}</span>
  <b>{d.name}</b>
  <small>{d.state} <ArrowRight size={13}/>
  </small>
  </button>)}</div>
  </section>
  <section className="detail-section" id="destination-detail">
  <div className="content-width">{guide?<>
  <div className="detail-header">
  <div>
  <span className="kicker">YOUR DESTINATION GUIDE</span>
  <h2>{guide.title}{guide.subtitle&&<span>, {guide.subtitle}</span>}</h2>
  {guide.description?<><p>{shorten(guide.description.text,520)}</p><small className="ek-small">Source: <SourceLink source={guide.description.source}/></small></>:<p className="ek-muted">No sourced description of {guide.title} was found.</p>}
  {guide.geocodeNote&&<p className="ek-small">{guide.geocodeNote}</p>}
  {guide.geocoderDown&&<p className="ek-small">Live place search is unavailable; the map position comes from EKTA’s own record.</p>}
  </div>
  <button className={'save-button '+(savedNames.has(guide.title)?'is-saved':'')} onClick={()=>toggleSave(place)}>{savedNames.has(guide.title)?<CheckCircle2 size={17}/>:<Heart size={17}/>} {savedNames.has(guide.title)?'Saved':'Save place'}</button>
  </div>
  <div className="destination-detail-grid">
  <div className="detail-main">
  <div className={'detail-photo'+(guide.image?'':' ek-photo-empty')} style={guide.image?{backgroundImage:`url(${guide.image.url})`}:undefined} role="img" aria-label={guide.image?`Photo related to ${guide.title}`:`No photo available for ${guide.title}`}>
  <span className="photo-tag">{{country:'Country',region:'State / region',city:'City / town',attraction:'Attraction',place:'Place'}[guide.geo.kind]}</span>
  <div className="photo-caption">
  <small>DISCOVER</small>
  <h3>{guide.title}</h3>
  </div>
  </div>
  {guide.image?<small className="ek-small">Photo: {guide.image.pageUrl?<a href={guide.image.pageUrl} target="_blank" rel="noreferrer">{guide.image.credit}</a>:guide.image.credit}{guide.image.pageUrl?'. Open the source page for photo details and license.':'. The image comes from the article for this place and may not show it at its best.'}</small>:<small className="ek-small">No openly licensed photo was found for this place, so none is shown.</small>}
  <DestinationGuide guide={guide} attractions={attractions} attractionsStatus={live.key===guide.key?live.status:'loading'} selected={selectedSpot} onSelect={setSelectedSpot} onLocate={locateSpot} isHiddenGemChecked={isHiddenGemChecked} onToggleHiddenGem={toggleHiddenGem} budgetStyle={budgetStyle} setBudgetStyle={setBudgetStyle} onSwitch={n=>{setQuery(n);searchPlace(null,n)}} onAsk={q=>{setAiSeed({q,n:Date.now()});openFeature(15)}} user={user} supabase={supabase}/>
  </div>
  <aside className="detail-side">
  <div className="map-panel">
  <div className="panel-title">
  <div>
  <span className="kicker">FIND YOUR WAY</span>
  <h3>Explore the map</h3>
  </div>
  <Navigation size={20}/>
  </div>
  <GuideMap guide={guide} attractions={attractions} selected={selectedSpot} onSelect={setSelectedSpot} showHiddenGems={showHiddenGems} onToggleHiddenGems={toggleHiddenGemLayer} isHiddenGemChecked={isHiddenGemChecked} onToggleHiddenGem={toggleHiddenGem}/>
  </div>
  <WeatherPanel name={guide.title} state={weatherState} onRetry={()=>loadWeather(guide)}/>
  <div className="nearby-panel">
  <div className="panel-title">
  <div>
  <span className="kicker">AROUND HERE</span>
  <h3>Nearby essentials</h3>
  </div>
  <Hospital size={20}/>
  </div>
  <p>Look up mapped clinics, pharmacies, police stations, food and attractions near this point (OpenStreetMap data, which can be incomplete).</p>
  <button className="primary-wide" onClick={loadNearby} disabled={nearbyLoading}>{nearbyLoading?'Searching map…':<>
  <LocateFixed size={16}/> Find nearby places</>}</button>{nearby.length>0&&<div className="nearby-list">{nearby.slice(0,8).map(n=>
  <a key={n.id} href={`https://www.openstreetmap.org/?mlat=${n.lat}&mlon=${n.lon}#map=17/${n.lat}/${n.lon}`} target="_blank" rel="noreferrer">
  <span>
  <b>{n.name}</b>
  <small>{n.type}</small>
  </span>
  <ExternalLink size={14}/>
  </a>)}</div>}</div>
  </aside>
  </div>
  </>:<div className="empty-detail">
  <div className="empty-icon">
  <MapPin/>
  </div>
  <span className="kicker">YOUR NEXT ADVENTURE STARTS HERE</span>
  <h2>Search a place. <em>Unlock its story.</em>
  </h2>
  <p>Search any destination worldwide or choose one from Explore to open its detailed guide, map, weather, local culture and nearby discovery.</p>
  <button className="primary-button" onClick={()=>openCurated(destinations[0])}>Explore Jaipur <ArrowRight size={17}/>
  </button>
  </div>}</div>
  </section>
  <section className="section feature-section" id="features">
  <div className="content-width">
  <div className="section-heading">
  <div>
  <span className="kicker">MORE THAN A TRAVEL SEARCH</span>
  <h2>One platform. <em>25 ways to explore.</em>
  </h2>
  <p>Open a tool to try it. Live data availability depends on the connected service and location.</p>
  </div>
  <div className="feature-count">25 <span>TOOLS</span>
  </div>
  </div>
  <div className="feature-grid">{featureList.map(([name,desc,Icon,color],i)=>
  <button className="feature-card" key={name} onClick={()=>openFeature(i)} style={{'--feature-color':color,'--delay':`${i%5*60}ms`}}>
  <span className="feature-icon">
  <Icon size={22}/>
  </span>
  <span className="feature-number">{String(i+1).padStart(2,'0')}</span>
  <b>{name}</b>
  <p>{desc}</p>
  <span className="feature-open">Open tool <ArrowRight size={14}/>
  </span>
  </button>)}</div>
  </div>
  </section>
  <section className="planner-band" id="planner">
  <div className="planner-art">
  </div>
  <div className="planner-content">
  <span className="kicker">YOUR JOURNEY, YOUR WAY</span>
  <h2>Less scrolling.<br/>
  <em>More experiencing.</em>
  </h2>
  <p>Build a flexible trip plan around your time, budget and what makes you curious.</p>
  <button className="light-button" onClick={()=>openFeature(17)}>Build my itinerary <ArrowRight size={17}/>
  </button>
  </div>
  <div className="planner-stamp">
  <Sparkles size={20}/>
  <span>Thoughtful travel<br/>
  <b>starts here</b>
  </span>
  </div>
  </section>
  <section className="section community-section content-width" id="community">
  <div className="community-copy">
  <span className="kicker">LOCAL VOICES MATTER</span>
  <h2>Travel leaves a mark.<br/>
  <em>Make it a good one.</em>
  </h2>
  <p>Account holders can share reviews and hidden-gem suggestions. Community submissions are stored securely and reviewed before publication.</p>
  <button className="primary-button" onClick={()=>openFeature(21)}>Share a local note <ArrowRight size={16}/>
  </button>
  </div>
  <div className="community-quote">
  <span className="quote-mark">“</span>
  <p>The best souvenir is a story you heard, a craft you understood, and a place you left as beautiful as you found it.</p>
  <small>THE EKTA TRAVEL PROMISE</small>
  <div className="quote-line">
  </div>
  </div>
  </section>
  </main>
  <footer className="footer">
  <a className="brand footer-brand" href="#home">
  <span className="brand-mark">
  <Compass size={22}/>
  </span>
  <span>ekta<span className="brand-dot">.</span>
  <small>ONE INDIA. ENDLESS JOURNEYS.</small>
  </span>
  </a>
  <p>Discover India thoughtfully. Respect the places and people that make it extraordinary.</p>
  <div className="footer-bottom">
  <span>© 2026 EKTA · Hackathon concept</span>
  <span>Built for curious, responsible travellers <Leaf size={14}/>
  </span>
  </div>
  </footer>
  {feature!==null&&<FeatureModal index={feature} place={place} guide={guide} user={user} onSignIn={()=>{setFeature(null);setAuthMode('signin')}} aiSeed={aiSeed} attractions={attractions} saved={saved} toggleSave={toggleSave} onClose={()=>setFeature(null)} language={language} setLanguage={setLanguage} phrase={phrase} setPhrase={setPhrase} translated={translated} translating={translating} translateText={translateText} review={review} setReview={setReview} reviews={reviews} submitReview={submitReview} photo={photo} photoResult={photoResult} identifyPhoto={identifyPhoto} crowd={crowd} setCrowd={setCrowd} checklist={checklist} setChecklist={setChecklist} tripNote={tripNote} setTripNote={setTripNote} toast={setToast}/>}
  {toast&&<div className="toast">
  <CheckCircle2 size={17}/>{toast}</div>}
 </div>
}
function DestinationCard({d,saved,onOpen,onSave}){return <article className="destination-card"><button className="destination-image" onClick={onOpen} style={{backgroundImage:`url(${d.image})`}} aria-label={`Open ${d.name}`}><span className="card-category">{d.category}</span><span className="image-arrow"><ArrowRight size={17}/></span></button><div className="destination-info"><div><span className="destination-state">{d.state}</span><h3>{d.name}</h3></div><button className={'heart-button '+(saved?'saved':'')} onClick={onSave} aria-label={saved?'Remove saved place':'Save place'}><Heart size={18} fill={saved?'currentColor':'none'}/></button><p>{d.description}</p><button className="card-link" onClick={onOpen}>Explore destination <ArrowRight size={15}/></button></div></article>}
function FeatureModal(p){const {index,place,onClose}=p;const [sosName,setSosName]=useState(localStorage.getItem('ekta-sos-name')||'');const [sosPhone,setSosPhone]=useState(localStorage.getItem('ekta-sos-phone')||'');const [sosLink,setSosLink]=useState('');const [localEmergency,setLocalEmergency]=useState(localStorage.getItem(`ekta-emergency-${place.name}`)||'');const [season,setSeason]=useState('October – March');const [score,setScore]=useState({local:true,refill:true,transit:false,waste:true});const [customNote,setCustomNote]=useState('');const [activeTab,setActiveTab]=useState('guide');const [offlineSaved,setOfflineSaved]=useState(!!localStorage.getItem('ekta-offline-'+place.name));const [copied,setCopied]=useState(false);const [loading,setLoading]=useState(false);const [shareSelection,setShareSelection]=useState(()=>new Set(p.saved.map(s=>s.name)));const [shareChecklist,setShareChecklist]=useState(false);const emNum=p.guide?.record?.emergency?.numbers?.[0]?.value||null;const item=featureList[index];const Icon=item[2];
 function saveContact(){localStorage.setItem('ekta-sos-name',sosName);localStorage.setItem('ekta-sos-phone',sosPhone);p.toast('Trusted contact saved on this device.')}
 function shareLocation(){if(!navigator.geolocation){p.toast('Location is not supported by this browser.');return}setLoading(true);navigator.geolocation.getCurrentPosition(pos=>{const url=`https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;setSosLink(url);setLoading(false)},()=>{setLoading(false);p.toast('Location permission denied. You can still use emergency guidance.')},{enableHighAccuracy:true,timeout:10000})}
 async function copyText(text){try{await navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),1500)}catch{p.toast('Copy unavailable; please select the text manually.')}}
 function toggleShareSelection(name){setShareSelection(prev=>{const next=new Set(prev);next.has(name)?next.delete(name):next.add(name);return next})}
 const shareMessage=[...p.saved.filter(s=>shareSelection.has(s.name)).map(s=>`${s.name}${s.state?`, ${s.state}`:''}\nMap: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name}${s.state?`, ${s.state}`:''}`)}`),...(shareChecklist&&p.tripNote.trim()?[`Trip checklist:\n${p.tripNote.trim()}`]:[])].join('\n\n');
 function saveOffline(){const snapshot={name:place.name,state:place.state,description:place.description,customs:place.customs,facts:place.facts,gems:place.gems,food:place.food,best:place.best,savedAt:new Date().toISOString()};localStorage.setItem('ekta-offline-'+place.name,JSON.stringify(snapshot));setOfflineSaved(true);p.toast('Destination snapshot saved on this device.')}
 const toolContent=()=>{switch(index){
 case 0:return <><div className="modal-callout"><Landmark/><div><b>Respect local customs in {place.name}</b><p>{place.customs||`EKTA has no verified etiquette notes for ${place.name}.`}</p></div></div><h4>Before you go</h4><ul className="modal-list"><li>Check posted dress and footwear guidance at religious sites.</li><li>Ask permission before photographing people, ceremonies or private spaces.</li><li>Follow official site rules; etiquette may differ between communities.</li></ul><small className="source-note">General guidance based on destination notes. Confirm with local/official sources.</small></>;
 case 1:return <><label className="field-label">When are you thinking of travelling?</label><select value={season} onChange={e=>setSeason(e.target.value)}><option>October – March</option><option>April – June</option><option>July – September</option></select><div className="modal-callout"><Compass/><div><b>Season-aware ideas for {place.name}</b><p>{place.best?`Seasonal guidance: ${place.best}`:`EKTA has no seasonal guidance for ${place.name}.`} Check current weather, closures and local advisories.</p></div></div><p className="muted">This is a planning suggestion, not a live crowd or availability prediction.</p></>;
 case 2:return <><div className="modal-callout"><Users/><div><b>Crowd status is not currently verified</b><p>EKTA does not have a connected live crowd sensor for this destination. Avoid treating estimates as real-time facts.</p></div></div><label className="field-label">Add your on-the-ground observation</label><select value={p.crowd} onChange={e=>p.setCrowd(e.target.value)}><option value="">Choose current observation</option><option>Quiet</option><option>Moderate</option><option>Busy</option><option>Very busy</option></select><button className="primary-button" onClick={()=>{if(p.crowd)p.toast(`Demo crowd note recorded: ${p.crowd}. Not publicly verified.`)}}>Record demo observation <ArrowRight size={15}/></button><small className="source-note">User observations are demo-only and are not independently verified.</small></>;
 case 3:return <><p>{place.gems.length?`Lesser-known ideas from EKTA’s notes around ${place.name}. Check access and local guidance before setting out.`:`EKTA has no verified hidden-gem list for ${place.name}.`}</p><div className="modal-place-list">{place.gems.map((g,i)=><div key={g}><span>0{i+1}</span><div><b>{g}</b><small>Local discovery · verify opening/access details</small></div><button onClick={()=>p.toast(`${g} added to your discovery shortlist.`)}><Plus size={16}/></button></div>)}</div><div className="ek-gem-submit-box"><b>Suggest a hidden gem</b><p>Place suggestions are for signed-in account holders. AI can screen relevance and ask short follow-up questions, but that is not factual verification.</p><button type="button" className="secondary-button" disabled>Sign-in is not connected yet</button></div><button className="secondary-button" onClick={()=>{p.toggleSave(place);}}>Save destination <Heart size={15}/></button></>;
 case 4:return <><h4>Stories and context</h4>{!place.facts.length&&<p className="muted">EKTA has no verified stories for {place.name}.</p>}{place.facts.map((f,i)=><div className="story-row" key={f}><span>0{i+1}</span><p>{f}</p></div>)}<div className="modal-callout"><Info/><div><b>Source awareness</b><p>These are concise destination notes, not a substitute for museum interpretation, scholarly references or official heritage information. Verify historical details before publishing.</p></div></div></>;
 case 5:return <><div className="weather-modal"><CloudSun size={36}/><div><b>Weather for {place.name}</b><p>Open the destination guide for live temperature, humidity and wind from Open-Meteo.</p></div></div><button className="primary-button" onClick={()=>{onClose();document.getElementById('destination-detail')?.scrollIntoView({behavior:'smooth'})}}>View live weather panel <ArrowRight size={16}/></button><p className="muted">Weather data needs internet access and can change quickly. Follow official warnings.</p></>;
 case 6:return <><div className="emergency-banner"><ShieldCheck size={25}/><div><b>{emNum?`Destination emergency number: ${emNum}`:`No verified local emergency number stored for ${place.name}`}</b><p>In India, call 112 for emergency help. Emergency numbers differ by country; confirm the local number when travelling internationally. EKTA is not an emergency dispatch service.</p></div></div><div className="modal-actions"><a className="primary-button" href="tel:112">Call 112 · India</a>{emNum&&<a className="secondary-button" href={`tel:${emNum}`}>Call listed local number {emNum} <ExternalLink size={14}/></a>}</div><h4>Other local emergency number (optional)</h4><div className="form-grid"><label><span>Number to dial for {place.name}</span><input value={localEmergency} onChange={e=>setLocalEmergency(e.target.value)} placeholder="Enter a local number" type="tel"/></label><button className="secondary-button" onClick={()=>{localStorage.setItem(`ekta-emergency-${place.name}`,localEmergency.trim());p.toast('Alternate emergency number saved on this device.')}}>Save alternate number <CheckCircle2 size={15}/></button></div>{localEmergency.trim()&&<div className="modal-actions"><a className="secondary-button" href={`tel:${localEmergency.replace(/[^+\d]/g,'')}`}>Call saved alternate number <ExternalLink size={14}/></a></div>}<h4>Trusted contact (saved on this device only)</h4><div className="form-grid"><label><span>Contact name</span><input value={sosName} onChange={e=>setSosName(e.target.value)} placeholder="Trusted person"/></label><label><span>Phone number</span><input value={sosPhone} onChange={e=>setSosPhone(e.target.value)} placeholder="Phone number" type="tel"/></label></div><button className="secondary-button" onClick={saveContact}>Save contact locally <CheckCircle2 size={15}/></button><div className="modal-actions"><button className="primary-button" onClick={shareLocation} disabled={loading}>{loading?'Getting permission…':<><LocateFixed size={16}/> Get my location link</>}</button></div>{sosLink&&<div className="share-box"><p>Share this link with your trusted contact:</p><a href={sosLink} target="_blank" rel="noreferrer">{sosLink}</a><button onClick={()=>copyText(sosLink)}><Copy size={14}/>{copied?'Copied':'Copy link'}</button></div>}<small className="source-note">Phone links open your device’s calling app. EKTA does not place calls. Location is requested only after you press the button.</small></>;
 case 7:return <><p>Mapped nearby places for {place.name}. This uses Google Places results may be incomplete or outdated.</p><button className="primary-button" onClick={()=>{onClose();document.getElementById('destination-detail')?.scrollIntoView({behavior:'smooth'})}}>Open Nearby Essentials <ArrowRight size={16}/></button><a className="external-row" href={`https://www.openstreetmap.org/#map=13/${place.lat}/${place.lon}`} target="_blank" rel="noreferrer">View OpenStreetMap around {place.name} <ExternalLink size={15}/></a><small className="source-note">For emergencies in India call 112. Verify the facility is open before travelling.</small></>;
 case 8:return <><h4>Accessibility questions to verify</h4>{['Step-free entry and ramps','Accessible toilets','Seating and shaded rest areas','Surface quality and walking distance','Accessible parking / drop-off','Lift availability at multi-level sites'].map(x=><label className="check-row" key={x}><input type="checkbox" checked={p.checklist.includes(x)} onChange={e=>p.setChecklist(prev=>e.target.checked?[...prev,x]:prev.filter(y=>y!==x))}/><span>{x}</span></label>)}<div className="modal-callout"><Accessibility/><div><b>Verification needed</b><p>Checklist answers are your planning notes, not verified accessibility claims. Contact the venue before visiting.</p></div></div></>;
 case 9:return <><div className="modal-callout"><PawPrint/><div><b>Wildlife first</b><p>Keep distance, never feed or touch wild animals, stay on authorised paths and follow park staff instructions.</p></div></div><ul className="modal-list"><li>Do not use flash around wildlife unless explicitly permitted.</li><li>Check official forest department notices, closures and safari rules.</li><li>Use authorised guides and never buy products made from protected wildlife.</li></ul><a className="external-row" href="https://moef.gov.in/" target="_blank" rel="noreferrer">Ministry of Environment, Forest and Climate Change <ExternalLink size={15}/></a></>;
 case 10:return <><p>Interactive map for {place.name} is available in the destination guide. The map uses OpenStreetMap tiles.</p><button className="primary-button" onClick={()=>{onClose();document.getElementById('destination-detail')?.scrollIntoView({behavior:'smooth'})}}>Open interactive map <Map size={16}/></button><a className="external-row" href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=12/${place.lat}/${place.lon}`} target="_blank" rel="noreferrer">Open full-screen map <ExternalLink size={15}/></a></>;
 case 11:return <><p>Explore crafts connected to {place.state} and ask makers about the time, technique and origin of each piece.</p><div className="modal-place-list">{['Handloom and textiles','Pottery and clay craft','Wood / metal / stone craft','Regional painting and folk art'].map((x,i)=><div key={x}><span>0{i+1}</span><div><b>{x}</b><small>Look for artisan collectives and transparent sourcing.</small></div><button onClick={()=>p.toast('Craft interest saved in this demo session.')}><Heart size={15}/></button></div>)}</div><p className="muted">No individual artisan profiles are claimed as verified in this demo.</p></>;
 case 12:return p.guide?<><h4>Local food in {place.name}</h4><FoodExplorer guide={p.guide}/></>:<p className="muted">Search for or choose a destination first to see its local food.</p>;
 case 13:return <><p>Local stories work best when shared with permission and context. This demo lets you add a short story idea for your own notes.</p><label className="field-label">Story / interview note</label><textarea value={p.tripNote} onChange={e=>p.setTripNote(e.target.value)} placeholder="What did a local resident share? Avoid personal information without consent." rows="4"/><button className="primary-button" onClick={()=>{localStorage.setItem('ekta-story-'+place.name,p.tripNote);p.toast('Story note saved locally. Make sure you have consent before publishing.')}}>Save story note <CheckCircle2 size={15}/></button><small className="source-note">No public upload, audio hosting or consent management is connected in this prototype.</small></>;
 case 14:return <><div className="modal-place-list">{['Community-led heritage walk','Cooking / food workshop','Traditional craft session','Nature walk with local guide'].map((x,i)=><div key={x}><span>0{i+1}</span><div><b>{x}</b><small>Experience idea · confirm availability and provider credentials</small></div><button onClick={()=>p.toast(`${x} added to your trip ideas.`)}><Plus size={15}/></button></div>)}</div><small className="source-note">These are activity suggestions, not bookable verified partner listings.</small></>;
 case 15:return p.guide?<AssistantPanel guide={p.guide} seed={p.aiSeed}/>:<p className="muted">Search for or choose a destination first, then ask the assistant about it.</p>;
 case 16:return <><label className="field-label">Text to translate</label><textarea rows="3" value={p.phrase} onChange={e=>p.setPhrase(e.target.value)}/><label className="field-label">Translate into</label><select value={p.language} onChange={e=>p.setLanguage(e.target.value)}><option value="hi">Hindi · हिन्दी</option><option value="bn">Bengali · বাংলা</option><option value="ta">Tamil · தமிழ்</option><option value="te">Telugu · తెలుగు</option><option value="mr">Marathi · मराठी</option><option value="es">Spanish · Español</option><option value="fr">French · Français</option></select><button className="primary-button" onClick={p.translateText} disabled={p.translating}>{p.translating?'Translating…':<><Languages size={16}/> Translate text</>}</button>{p.translated&&<div className="translation-result"><small>TRANSLATION</small><p>{p.translated}</p><button onClick={()=>copyText(p.translated)}><Copy size={14}/> {copied?'Copied':'Copy translation'}</button></div>}<button className="secondary-button" onClick={()=>{if('speechSynthesis'in window){const u=new SpeechSynthesisUtterance(p.translated||p.phrase);u.lang=p.language==='hi'?'hi-IN':p.language==='ta'?'ta-IN':p.language==='te'?'te-IN':'en-US';speechSynthesis.speak(u)}else p.toast('Speech is not supported in this browser.')}}> <Mic size={15}/> Speak text (device support)</button><small className="source-note">Translation requires internet; verify important medical/legal translations with a qualified speaker.</small></>;
 case 17:return p.guide?<ItineraryPanel guide={p.guide} attractions={p.attractions} toast={p.toast}/>:<p className="muted">Search for or choose a destination first to plan a trip.</p>;
 case 18:return <><div className="modal-callout"><LocateFixed/><div><b>Discover places near your current location</b><p>Your browser will ask for permission. EKTA only uses the coordinates in this session to open a nearby map search.</p></div></div><button className="primary-button" onClick={()=>{if(!navigator.geolocation){p.toast('Geolocation not supported.');return}setLoading(true);navigator.geolocation.getCurrentPosition(pos=>{setLoading(false);window.open(`https://www.openstreetmap.org/#map=14/${pos.coords.latitude}/${pos.coords.longitude}`,'_blank','noopener');},()=>{setLoading(false);p.toast('Location permission denied or unavailable.')},{timeout:10000})}} disabled={loading}>{loading?'Waiting for permission…':<><LocateFixed size={16}/> Use my location</>}</button><small className="source-note">Browser location works on localhost or HTTPS. Location is not continuously tracked.</small></>;
 case 19:return p.guide?<BudgetPanel guide={p.guide}/>:<p className="muted">Search for or choose a destination first to estimate its costs.</p>;
 case 20:return <><p>Responsible travel score uses a transparent self-check, not an environmental certification.</p>{[['local','Support local businesses (25%)'],['refill','Carry/refill reusable water bottle (25%)'],['transit','Use shared/public transport where practical (25%)'],['waste','Avoid litter and respect nature/heritage (25%)']].map(([k,label])=><label className="check-row" key={k}><input type="checkbox" checked={!!score[k]} onChange={e=>setScore({...score,[k]:e.target.checked})}/><span>{label}</span></label>)}<div className="score-circle"><strong>{Math.round(Object.values(score).filter(Boolean).length/4*100)}</strong><span>/100</span></div><p className="muted">Self-assessed score based on selected actions. Not independently audited.</p></>;
 case 21:return <CommunityPanel place={place} guide={p.guide} user={p.user} onSignIn={p.onSignIn} toast={p.toast}/>;
 case 22:return <><h4>Your saved places</h4>{p.saved.length?p.saved.map(s=><div className="saved-row" key={s.name}><label className="saved-select" title={`Select ${s.name} to share`}><input type="checkbox" checked={shareSelection.has(s.name)} onChange={()=>toggleShareSelection(s.name)} aria-label={`Select ${s.name} to share`}/></label><img src={s.image||place.image} alt=""/><div><b>{s.name}</b><small>{s.state}</small></div><button aria-label={`Remove ${s.name} from saved places`} onClick={()=>p.toggleSave(s)}><X size={16}/></button></div>):<p className="muted">No saved places yet. Tap the heart on a destination card to save it.</p>}{p.tripNote.trim()&&<label className="check-row share-checklist"><input type="checkbox" checked={shareChecklist} onChange={e=>setShareChecklist(e.target.checked)}/><span>Include my saved trip checklist note</span></label>}<div className="saved-share-actions"><a className={`secondary-button${!shareMessage?' is-disabled':''}`} href={shareMessage?`https://wa.me/?text=${encodeURIComponent(shareMessage)}`:undefined} target="_blank" rel="noreferrer" aria-disabled={!shareMessage} onClick={e=>{if(!shareMessage)e.preventDefault()}}><Share2 size={15}/> WhatsApp</a><a className={`secondary-button${!shareMessage?' is-disabled':''}`} href={shareMessage?`sms:?body=${encodeURIComponent(shareMessage)}`:undefined} aria-disabled={!shareMessage} onClick={e=>{if(!shareMessage)e.preventDefault()}}><Send size={15}/> SMS</a></div><small className="source-note">Choose the saved places to include. WhatsApp or your device’s messaging app opens with a draft; you review and send it yourself.</small><label className="field-label">Trip checklist note</label><textarea rows="3" value={p.tripNote} onChange={e=>p.setTripNote(e.target.value)} placeholder="Tickets, medicines, refill bottle, local guide…"/><button className="secondary-button" onClick={()=>{localStorage.setItem('ekta-trip-checklist',p.tripNote);p.toast('Trip checklist saved locally.')}}>Save checklist <CheckCircle2 size={15}/></button></>;
 case 23:return <><div className="modal-callout"><Wifi/><div><b>Save {place.name} for offline reference</b><p>This stores a small text snapshot in your browser. Maps, images and live weather still need internet. Full offline mode requires a service worker/PWA setup.</p></div></div><button className="primary-button" onClick={saveOffline}>{offlineSaved?'Update offline snapshot':'Save offline snapshot'} <Bookmark size={16}/></button>{offlineSaved&&<div className="translation-result"><small>AVAILABLE LOCALLY</small><p>{place.name}: {place.description}</p><p>Best time: {place.best}</p><p>Local tip: {place.customs}</p></div>}<small className="source-note">Stored in this browser’s localStorage, not a cloud account.</small></>;
 case 24:return <><div className="photo-upload"><Camera size={28}/><b>Photo-based place discovery</b><p>Select a photo of a monument, craft or dish to begin. Actual AI identification needs a configured vision model/API.</p><label className="upload-button">Choose a photo<input type="file" accept="image/*" onChange={e=>p.identifyPhoto(e.target.files?.[0])}/></label>{p.photo&&<img className="photo-preview" src={p.photo} alt="Selected upload"/>}{p.photoResult&&<p className="photo-result">{p.photoResult}</p>}</div><small className="source-note">Your selected photo is previewed locally; it is not uploaded to a server by this demo.</small></>;
 default:return <p>Tool coming soon.</p>}}
 return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="feature-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header className="modal-header"><span className="modal-icon" style={{'--feature-color':item[3]}}><Icon size={22}/></span><div><small>EKTA TOOLKIT · {String(index+1).padStart(2,'0')} / 25</small><h2 id="modal-title">{item[0]}</h2><p>{item[1]}</p></div><button className="icon-button close-modal" onClick={onClose} aria-label="Close"><X/></button></header><div className="modal-body">{toolContent()}</div><footer className="modal-footer"><span><ShieldCheck size={14}/> Travel thoughtfully. Verify important details.</span><button onClick={onClose}>Done <CheckCircle2 size={15}/></button></footer></section></div>
}
export default App;





