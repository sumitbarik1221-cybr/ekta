// Local EKTA API server and production static-file fallback.
// Production hosting uses the same API handlers through Netlify Functions.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
try { process.loadEnvFile(path.join(root, '.env')); } catch { /* .env is optional */ }
const { apiHealth, handleApiRequest } = await import('./api-handlers.js');

const PORT = Number(process.env.PORT || 8787);
const ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.woff2': 'font/woff2' };

function serveStatic(url, response) {
  const dist = path.join(root, 'dist');
  if (!fs.existsSync(dist)) {
    response.writeHead(404);
    return response.end('Not found. Run `npm run build` first, or use `npm run dev` for development.');
  }
  let file = path.join(dist, path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(dist)) { response.writeHead(403); return response.end(); }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, 'index.html');
  response.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
}

function jsonResponse(response, result) {
  response.writeHead(result.status, {
    'Content-Type': result.headers.get('content-type') || 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ORIGIN,
    Vary: 'Origin'
  });
  return result.arrayBuffer().then(body => response.end(Buffer.from(body)));
}

http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (request.method === 'OPTIONS') {
    response.writeHead(204, { 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Methods': 'GET,POST', 'Access-Control-Allow-Headers': 'Content-Type' });
    return response.end();
  }
  if (url.pathname.startsWith('/api/')) {
    if (url.pathname === '/api/health' && request.method === 'GET') return jsonResponse(response, apiHealth());
    try {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      const headers = new Headers();
      for (const [key, value] of Object.entries(request.headers)) {
        if (Array.isArray(value)) headers.set(key, value.join(', '));
        else if (value !== undefined) headers.set(key, value);
      }
      const init = { method: request.method, headers };
      if (request.method !== 'GET' && request.method !== 'HEAD') init.body = Buffer.concat(chunks);
      const webRequest = new Request(url, init);
      const result = await handleApiRequest(webRequest, request.socket.remoteAddress || 'unknown');
      return jsonResponse(response, result);
    } catch (error) {
      console.error('[API] Request failed:', error?.message || 'unknown error');
      response.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      return response.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
  return serveStatic(url, response);
}).listen(PORT, () => {
  const health = apiHealth();
  health.json().then(({ assistant, assistantProvider, brief }) => {
    console.log(`EKTA server on http://localhost:${PORT}`);
    console.log(`  AI assistant: ${assistant ? `${assistantProvider} configured` : 'NOT configured (set GROQ_API_KEY)'} · brief: ${brief ? 'configured' : 'not configured (optional ANTHROPIC_API_KEY)'}`);
  });
});
