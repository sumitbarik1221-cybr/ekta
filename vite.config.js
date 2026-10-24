import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, /api/* is forwarded to the EKTA backend (npm run server). No keys live in the front end.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': { target: 'http://localhost:8787', changeOrigin: true } } }
});
