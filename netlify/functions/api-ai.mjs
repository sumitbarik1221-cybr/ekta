import { handleApiRequest } from '../../server/api-handlers.js';

export default async function ai(request, context) {
  return handleApiRequest(request, context.ip || 'unknown');
}

export const config = {
  path: ['/api/assistant', '/api/brief'],
  method: 'POST',
  rateLimit: { windowSize: 60, windowLimit: 12, aggregateBy: 'ip' }
};
