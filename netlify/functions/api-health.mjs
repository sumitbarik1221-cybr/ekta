import { apiHealth } from '../../server/api-handlers.js';

export default async function health() {
  return apiHealth();
}

export const config = { path: '/api/health', method: 'GET' };
