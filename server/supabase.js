import { createClient } from '@supabase/supabase-js';

export function getSupabase() {
  const url = process.env.STORAGE_SUPABASE_URL;
  const serviceKey = process.env.STORAGE_SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing STORAGE_SUPABASE_URL or STORAGE_SUPABASE_SERVICE_KEY');
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
