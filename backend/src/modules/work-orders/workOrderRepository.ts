import type { SupabaseClient } from '@supabase/supabase-js';

import type { WorkOrderDetail, WorkOrderFilters, WorkOrderSummary } from './types.js';

const WORK_ORDER_SUMMARY_COLUMNS =
  'id, client_id, title, description, furniture_type, room, location, priority, status, is_blocked, tentative_delivery_date, confirmed_delivery_date, created_at, updated_at';
const WORK_ORDER_DETAIL_COLUMNS = `${WORK_ORDER_SUMMARY_COLUMNS}, client:clients(id, full_name, display_name, default_location)`;

type RawWorkOrderDetail = WorkOrderSummary & {
  client: WorkOrderDetail['client'] | WorkOrderDetail['client'][];
};

function toSafeWorkOrderDetail(workOrder: RawWorkOrderDetail): WorkOrderDetail {
  const client = Array.isArray(workOrder.client) ? (workOrder.client[0] ?? null) : workOrder.client;

  return {
    id: workOrder.id,
    client_id: workOrder.client_id,
    title: workOrder.title,
    description: workOrder.description,
    furniture_type: workOrder.furniture_type,
    room: workOrder.room,
    location: workOrder.location,
    priority: workOrder.priority,
    status: workOrder.status,
    is_blocked: workOrder.is_blocked,
    tentative_delivery_date: workOrder.tentative_delivery_date,
    confirmed_delivery_date: workOrder.confirmed_delivery_date,
    created_at: workOrder.created_at,
    updated_at: workOrder.updated_at,
    client:
      client === null
        ? null
        : {
            id: client.id,
            full_name: client.full_name,
            display_name: client.display_name,
            default_location: client.default_location,
          },
  };
}

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

export async function getWorkOrderById(
  supabase: SupabaseClient,
  id: string,
): Promise<{ data: WorkOrderDetail | null; error: unknown }> {
  const { data, error } = await supabase
    .from('work_orders')
    .select(WORK_ORDER_DETAIL_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  return {
    data: data === null ? null : toSafeWorkOrderDetail(data),
    error,
  };
}
