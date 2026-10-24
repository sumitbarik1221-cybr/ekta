import { handleApiRequest } from '../../server/api-handlers.js';

export default async function emailExists(request, context) {
  return handleApiRequest(request, context.ip || 'unknown');
}

export const config = {
  path: '/api/auth/email-exists',
  method: 'POST',
  rateLimit: { windowSize: 60, windowLimit: 10, aggregateBy: 'ip' }
};
