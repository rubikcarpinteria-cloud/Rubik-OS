import type { SupabaseClient } from '@supabase/supabase-js';

import type { WorkOrderFilters, WorkOrderSummary } from './types.js';

const WORK_ORDER_SUMMARY_COLUMNS =
  'id, client_id, title, description, furniture_type, room, location, priority, status, is_blocked, tentative_delivery_date, confirmed_delivery_date, created_at, updated_at';

export async function listWorkOrders(
  supabase: SupabaseClient,
  limit: number,
  filters: WorkOrderFilters,
): Promise<{ data: WorkOrderSummary[]; error: unknown }> {
  let query = supabase.from('work_orders').select(WORK_ORDER_SUMMARY_COLUMNS);

  if (filters.status !== null) {
    query = query.eq('status', filters.status);
  }

  if (filters.client_id !== null) {
    query = query.eq('client_id', filters.client_id);
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);

  return {
    data: data ?? [],
    error,
  };
}
