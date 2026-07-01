import type { SupabaseClient } from '@supabase/supabase-js';

import type { PlanningAlertUpdate, PlanningAlertUpdateInput } from './types.js';

const PLANNING_ALERT_UPDATE_COLUMNS =
  'id, work_order_id, alert_type, title, message, severity, status, generated_by, assigned_to, acknowledged_by, acknowledged_at, resolved_at, created_at, updated_at';

function toSafePlanningAlert(alert: PlanningAlertUpdate): PlanningAlertUpdate {
  return {
    id: alert.id,
    work_order_id: alert.work_order_id,
    alert_type: alert.alert_type,
    title: alert.title,
    message: alert.message,
    severity: alert.severity,
    status: alert.status,
    generated_by: alert.generated_by,
    assigned_to: alert.assigned_to,
    acknowledged_by: alert.acknowledged_by,
    acknowledged_at: alert.acknowledged_at,
    resolved_at: alert.resolved_at,
    created_at: alert.created_at,
    updated_at: alert.updated_at,
  };
}

export async function getPlanningAlertForWorkOrder(
  supabase: SupabaseClient,
  workOrderId: string,
  alertId: string,
): Promise<{ data: PlanningAlertUpdate | null; error: unknown }> {
  const { data, error } = await supabase
    .from('planning_alerts')
    .select(PLANNING_ALERT_UPDATE_COLUMNS)
    .eq('id', alertId)
    .eq('work_order_id', workOrderId)
    .maybeSingle();

  return {
    data: data ?? null,
    error,
  };
}

export async function updatePlanningAlert(
  supabase: SupabaseClient,
  alert: PlanningAlertUpdate,
  input: PlanningAlertUpdateInput,
): Promise<{ data: PlanningAlertUpdate | null; error: unknown }> {
  const patch: Record<string, string> = {
    status: input.status,
  };

  if (input.status === 'acknowledged') {
    patch.acknowledged_at = new Date().toISOString();

    if (input.acknowledged_by !== undefined) {
      patch.acknowledged_by = input.acknowledged_by;
    }
  }

  if (
    input.status === 'resolved' ||
    input.status === 'false_positive' ||
    input.status === 'cancelled'
  ) {
    patch.resolved_at = new Date().toISOString();

    if (input.resolution_notes !== undefined) {
      patch.resolution_notes = input.resolution_notes;
    }
  }

  const { data, error } = await supabase
    .from('planning_alerts')
    .update(patch)
    .eq('id', alert.id)
    .eq('work_order_id', alert.work_order_id)
    .select(PLANNING_ALERT_UPDATE_COLUMNS)
    .single();

  return {
    data: data === null ? null : toSafePlanningAlert(data),
    error,
  };
}
