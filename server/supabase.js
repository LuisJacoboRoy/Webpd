import { createClient } from '@supabase/supabase-js';

export function getSupabase(options = {}) {
  const { url, serviceRoleKey } = options;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase URL or service role key');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
