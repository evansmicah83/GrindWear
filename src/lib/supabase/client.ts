import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Avoid hard crash during runtime; log and let auth calls fail with clearer errors.
  // eslint-disable-next-line no-console
  console.error('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check .env.local and Vercel project settings.');
}

// Create the client only when env vars exist.
// On some deployments (e.g. Vercel) VITE_* may not be injected unless configured,
// so we guard to prevent runtime crashes.
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const isSupabaseConfigured = !!supabase;

