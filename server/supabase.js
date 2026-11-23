import { createClient } from '@supabase/supabase-js';

export function getSupabase(options = {}) {
  const url = options.url || process.env.STORAGE_SUPABASE_URL;
  const serviceKey = options.serviceRoleKey || process.env.STORAGE_SUPABASE_SERVICE_KEY;

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
