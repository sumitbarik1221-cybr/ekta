let mapsPromise;

export function loadGoogleMaps() {
  if (mapsPromise) return mapsPromise;
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) return Promise.reject(new Error('Google Maps key is missing. Add VITE_GOOGLE_MAPS_API_KEY to .env.'));
  mapsPromise = new Promise((resolve, reject) => {
    if (window.google?.maps?.places?.Place) { resolve(window.google.maps); return; }
    const callbackName = `ektaGoogleMapsLoaded_${Date.now()}`;
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => { cleanup(); reject(new Error('Google Maps did not load. Check the API key, enabled APIs, billing, and website restrictions.')); }, 20000);
    const cleanup = () => { clearTimeout(timeout); delete window[callbackName]; };
    window[callbackName] = () => { cleanup(); resolve(window.google.maps); };
    script.onerror = () => { cleanup(); reject(new Error('Google Maps could not load. Check the API key and internet connection.')); };
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&v=weekly&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }).catch(error => { mapsPromise = null; throw error; });
  return mapsPromise;
}
