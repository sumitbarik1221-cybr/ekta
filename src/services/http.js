// Small fetch wrapper: timeout + JSON + clear errors. Used by every service so failures are uniform.
export async function getJSON(url, { timeout = 12000, signal, headers } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  if (signal) signal.addEventListener('abort', () => ctrl.abort(), { once: true });
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json', ...headers } });
    if (!res.ok) { const e = new Error(`HTTP ${res.status}`); e.status = res.status; throw e; }
    return await res.json();
  } finally { clearTimeout(timer); }
}
export const API_BASE = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '');
