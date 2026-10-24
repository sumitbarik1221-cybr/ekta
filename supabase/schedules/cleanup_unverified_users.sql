-- Run once in the Supabase SQL Editor after deploying the
-- cleanup-unverified-users Edge Function and storing the two Vault secrets below.
-- Replace the project URL and token placeholders. Use the same high-entropy token
-- as the Edge Function's CLEANUP_UNVERIFIED_TOKEN secret.

select vault.create_secret('https://YOUR_PROJECT_REF.supabase.co', 'ekta_cleanup_project_url');
select vault.create_secret('REPLACE_WITH_CLEANUP_TOKEN', 'ekta_cleanup_token');

-- Run hourly. Accounts with no confirmed email older than 48 hours are deleted.
select cron.schedule(
  'ekta-cleanup-unverified-users-hourly',
  '15 * * * *',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'ekta_cleanup_project_url')
        || '/functions/v1/cleanup-unverified-users',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'ekta_cleanup_token')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 10000
    );
  $$
);
