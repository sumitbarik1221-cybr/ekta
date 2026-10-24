import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function getAdminKey() {
  const directKey = Deno.env.get('SUPABASE_SECRET_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (directKey) return directKey;
  try {
    const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
    return keys.default || Object.values(keys)[0] || null;
  } catch {
    return null;
  }
}

function getPublicKey(request: Request) {
  const directKey = Deno.env.get('SUPABASE_ANON_KEY') || request.headers.get('apikey');
  if (directKey) return directKey;
  try {
    const keys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}');
    return keys.default || Object.values(keys)[0] || null;
  } catch {
    return null;
  }
}

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: corsHeaders });
}

async function hashEmail(email: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const publicKey = getPublicKey(request);
  const adminKey = getAdminKey();
  if (!supabaseUrl || !publicKey || !adminKey) {
    console.error('Missing required Supabase keys for guarded sign-in.');
    return json({ error: 'Sign-in protection is not configured on the server.' }, 503);
  }

  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return json({ error: 'Invalid request body.' }, 400); }
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320 || !password || password.length > 1024) {
    return json({ error: 'Enter a valid email and password.' }, 400);
  }

  const admin = createClient(supabaseUrl, adminKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const auth = createClient(supabaseUrl, publicKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const emailHash = await hashEmail(email);

  const { data: lockRows, error: lockError } = await admin.rpc('ekta_check_auth_login_lock', { p_email_hash: emailHash });
  if (lockError) {
    console.error('Could not check EKTA sign-in lock:', lockError.message);
    return json({ error: 'Sign-in protection is temporarily unavailable. Please try again shortly.' }, 503);
  }
  const lock = Array.isArray(lockRows) ? lockRows[0] : lockRows;
  if (lock?.is_locked) {
    const retryAfterSeconds = Number(lock.retry_after_seconds) || 7200;
    return json({ code: 'auth_locked', error: `Too many unsuccessful sign-in attempts. Try again in ${Math.ceil(retryAfterSeconds / 3600)} hours.` }, 429);
  }

  const { data, error } = await auth.auth.signInWithPassword({ email, password });
  if (error) {
    const unconfirmed = error.code === 'email_not_confirmed' || /email not confirmed/i.test(error.message || '');
    const invalidCredentials = error.code === 'invalid_credentials' || /invalid login credentials/i.test(error.message || '');
    if (!unconfirmed && !invalidCredentials) {
      return json({ code: error.code || 'sign_in_failed', error: error.message || 'Could not sign in. Please try again.' }, error.status === 429 ? 429 : 400);
    }
    const { data: failureRows, error: failureError } = await admin.rpc('ekta_record_auth_login_failure', { p_email_hash: emailHash });
    if (failureError) {
      console.error('Could not record failed EKTA sign-in:', failureError.message);
      return json({ error: 'Sign-in protection is temporarily unavailable. Please try again shortly.' }, 503);
    }
    const failure = Array.isArray(failureRows) ? failureRows[0] : failureRows;
    if (failure?.is_locked) {
      return json({ code: 'auth_locked', error: 'Too many unsuccessful sign-in attempts. Try again in 2 hours.' }, 429);
    }
    return json({ code: unconfirmed ? 'email_not_confirmed' : 'invalid_credentials', error: unconfirmed ? 'Email not confirmed' : 'Invalid email or password.' }, 401);
  }

  const { error: clearError } = await admin.rpc('ekta_clear_auth_login_failures', { p_email_hash: emailHash });
  if (clearError) console.error('Could not clear EKTA sign-in failures:', clearError.message);
  if (!data.session) return json({ error: 'Sign-in succeeded but no session was returned. Please try again.' }, 502);
  return json({ session: { access_token: data.session.access_token, refresh_token: data.session.refresh_token } });
});
