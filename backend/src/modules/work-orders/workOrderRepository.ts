import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  OperationalReadinessCheckSummary,
  PlanningAlertSummary,
  WorkOrderDetail,
  WorkOrderFilters,
  WorkOrderSummary,
} from './types.js';

const WORK_ORDER_SUMMARY_COLUMNS =
  'id, client_id, title, description, furniture_type, room, location, priority, status, is_blocked, tentative_delivery_date, confirmed_delivery_date, created_at, updated_at';
const WORK_ORDER_DETAIL_COLUMNS = `${WORK_ORDER_SUMMARY_COLUMNS}, client:clients(id, full_name, display_name, default_location)`;
const OPERATIONAL_READINESS_CHECK_COLUMNS =
  'id, check_type, title, description, status, required_evidence_type, responsible_party, requested_by_agent, confirmed_by, confirmed_at, expires_at, blocks_next_stage, blocks_worker_dispatch, created_at, updated_at';
const PLANNING_ALERT_COLUMNS =
  'id, alert_type, title, message, severity, status, generated_by, assigned_to, resolved_at, created_at, updated_at';

type RawWorkOrderDetail = WorkOrderSummary & {
  client: WorkOrderDetail['client'] | WorkOrderDetail['client'][];
};

function toSafeOperationalReadinessCheck(
  check: OperationalReadinessCheckSummary,
): OperationalReadinessCheckSummary {
  return {
    id: check.id,
    check_type: check.check_type,
    title: check.title,
    description: check.description,
    status: check.status,
    required_evidence_type: check.required_evidence_type,
    responsible_party: check.responsible_party,
    requested_by_agent: check.requested_by_agent,
    confirmed_by: check.confirmed_by,
    confirmed_at: check.confirmed_at,
    expires_at: check.expires_at,
    blocks_next_stage: check.blocks_next_stage,
    blocks_worker_dispatch: check.blocks_worker_dispatch,
    created_at: check.created_at,
    updated_at: check.updated_at,
  };
}

function toSafePlanningAlert(alert: PlanningAlertSummary): PlanningAlertSummary {
  return {
    id: alert.id,
    alert_type: alert.alert_type,
    title: alert.title,
    message: alert.message,
    severity: alert.severity,
    status: alert.status,
    generated_by: alert.generated_by,
    assigned_to: alert.assigned_to,
    resolved_at: alert.resolved_at,
    created_at: alert.created_at,
    updated_at: alert.updated_at,
  };
}

function toSafeWorkOrderDetail(
  workOrder: RawWorkOrderDetail,
  operationalReadinessChecks: OperationalReadinessCheckSummary[],
  planningAlerts: PlanningAlertSummary[],
): WorkOrderDetail {
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
    operational_readiness_checks: operationalReadinessChecks.map(toSafeOperationalReadinessCheck),
    planning_alerts: planningAlerts.map(toSafePlanningAlert),
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
  const { data: workOrder, error: workOrderError } = await supabase
    .from('work_orders')
    .select(WORK_ORDER_DETAIL_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (workOrderError !== null || workOrder === null) {
    return {
      data: null,
      error: workOrderError,
    };
  }

  const { data: operationalReadinessChecks, error: operationalReadinessChecksError } =
    await supabase
      .from('operational_readiness_checks')
      .select(OPERATIONAL_READINESS_CHECK_COLUMNS)
      .eq('work_order_id', id)
      .order('created_at', { ascending: true });

  if (operationalReadinessChecksError !== null) {
    return {
      data: null,
      error: operationalReadinessChecksError,
    };
  }

  const { data: planningAlerts, error: planningAlertsError } = await supabase
    .from('planning_alerts')
    .select(PLANNING_ALERT_COLUMNS)
    .eq('work_order_id', id)
    .order('created_at', { ascending: false });

  return {
    data:
      planningAlertsError === null
        ? toSafeWorkOrderDetail(workOrder, operationalReadinessChecks ?? [], planningAlerts ?? [])
        : null,
    error: planningAlertsError,
  };
}
