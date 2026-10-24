import { createClient } from 'npm:@supabase/supabase-js@2';

const RETENTION_HOURS = 48;
const PAGE_SIZE = 1000;

function getAdminKey() {
  const directKey = Deno.env.get('SUPABASE_SECRET_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (directKey) return directKey;

  // Supabase's current Edge Function runtime injects named secret keys as JSON.
  try {
    const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
    return keys.default || Object.values(keys)[0] || null;
  } catch {
    return null;
  }
}

function authorized(request: Request, expectedToken: string) {
  const actual = new TextEncoder().encode(request.headers.get('authorization') || '');
  const expected = new TextEncoder().encode(`Bearer ${expectedToken}`);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual[index] ^ expected[index];
  return difference === 0;
}

Deno.serve(async request => {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = getAdminKey();
  const cleanupToken = Deno.env.get('CLEANUP_UNVERIFIED_TOKEN');
  if (!supabaseUrl || !serviceKey || !cleanupToken) {
    console.error('Missing required cleanup function secrets.');
    return Response.json({ error: 'Function is not configured' }, { status: 503 });
  }
  if (!authorized(request, cleanupToken)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const cutoff = Date.now() - RETENTION_HOURS * 60 * 60 * 1000;
  const expiredUsers: string[] = [];

  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
    if (error) {
      console.error(`Could not list auth users on page ${page}: ${error.message}`);
      return Response.json({ error: 'Could not list users for cleanup' }, { status: 502 });
    }

    const users = data.users || [];
    for (const user of users) {
      const createdAt = Date.parse(user.created_at);
      if (!user.email_confirmed_at && Number.isFinite(createdAt) && createdAt < cutoff) {
        expiredUsers.push(user.id);
      }
    }
    if (users.length < PAGE_SIZE) break;
  }

  let deleted = 0;
  for (const userId of expiredUsers) {
    const { data: current, error: lookupError } = await admin.auth.admin.getUserById(userId);
    if (lookupError || !current.user || current.user.email_confirmed_at) continue;
    const createdAt = Date.parse(current.user.created_at);
    if (!Number.isFinite(createdAt) || createdAt >= cutoff) continue;
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) {
      console.error(`Could not delete expired unverified auth user ${userId}: ${error.message}`);
      continue;
    }
    deleted += 1;
  }

  return Response.json({ deleted, retentionHours: RETENTION_HOURS });
});
