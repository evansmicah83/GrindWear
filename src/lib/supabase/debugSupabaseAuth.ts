import { supabase, isSupabaseConfigured } from './client';

export async function debugSupabaseAuth(email: string) {
  if (!isSupabaseConfigured || !supabase) {
    // eslint-disable-next-line no-console
    console.warn('[SupabaseAuth][debug] Supabase client not configured. Cannot debug auth.');
    return;
  }

  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  // eslint-disable-next-line no-console
  console.log('[SupabaseAuth][debug] getSession error:', sessionErr);
  // eslint-disable-next-line no-console
  console.log('[SupabaseAuth][debug] session:', sessionData);

  // Attempt sign-in only if credentials are provided.
  // NOTE: This function expects the caller to catch errors.

  // We'll just fetch an access token / user after login elsewhere.
}

