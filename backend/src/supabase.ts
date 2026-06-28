import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { AppConfig } from './config.js';

export function createSupabaseAdminClient(config: AppConfig): SupabaseClient | null {
  if (config.SUPABASE_URL === undefined || config.SUPABASE_SERVICE_ROLE_KEY === undefined) {
    return null;
  }

  return createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
