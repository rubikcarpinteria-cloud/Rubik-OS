import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { PublicEnvironment } from './env';

export function createPublicSupabaseClient(environment: PublicEnvironment): SupabaseClient | null {
  if (
    environment.VITE_SUPABASE_URL === undefined ||
    environment.VITE_SUPABASE_ANON_KEY === undefined
  ) {
    return null;
  }

  return createClient(environment.VITE_SUPABASE_URL, environment.VITE_SUPABASE_ANON_KEY);
}
