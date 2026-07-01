import type { SupabaseClient } from '@supabase/supabase-js';

import type { ClientSummary } from './types.js';

const CLIENT_SUMMARY_COLUMNS =
  'id, full_name, display_name, default_location, created_at, updated_at';

export async function listClients(
  supabase: SupabaseClient,
  limit: number,
): Promise<{ data: ClientSummary[]; error: unknown }> {
  const { data, error } = await supabase
    .from('clients')
    .select(CLIENT_SUMMARY_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit);

  return {
    data: data ?? [],
    error,
  };
}
