import type {
  OperationalReadinessCheckSummary,
  OperationalStatus,
  PlanningAlertSummary,
} from './types.js';

const activePlanningAlertStatuses = new Set(['open', 'acknowledged', 'investigating']);
const inactivePlanningAlertStatuses = new Set(['resolved', 'false_positive', 'cancelled']);
const completeReadinessStatuses = new Set(['confirmed', 'not_applicable']);

function isActivePlanningAlert(alert: PlanningAlertSummary): boolean {
  if (activePlanningAlertStatuses.has(alert.status)) {
    return true;
  }

  if (inactivePlanningAlertStatuses.has(alert.status)) {
    return false;
  }

  return false;
}

function isPendingReadinessCheck(check: OperationalReadinessCheckSummary): boolean {
  return !completeReadinessStatuses.has(check.status);
}

function uniqueReasons(reasons: string[]): string[] {
  return [...new Set(reasons)];
}

export function calculateOperationalStatus(
  operationalReadinessChecks: OperationalReadinessCheckSummary[],
  planningAlerts: PlanningAlertSummary[],
): OperationalStatus {
  const blockingReasons: string[] = [];
  const activePlanningAlerts = planningAlerts.filter(isActivePlanningAlert);

  if (operationalReadinessChecks.length === 0 && planningAlerts.length === 0) {
    return {
      status: 'yellow',
      can_dispatch_workers: false,
      blocking_reasons: ['No hay checks operativos configurados para validar despacho.'],
    };
  }

  if (
    operationalReadinessChecks.some(
      (check) => check.blocks_worker_dispatch && isPendingReadinessCheck(check),
    )
  ) {
    blockingReasons.push(
      'Hay un check operativo que bloquea despacho de trabajadores y no esta confirmado.',
    );
  }

  if (activePlanningAlerts.some((alert) => alert.severity === 'critical')) {
    blockingReasons.push('Existe una alerta critica abierta.');
  }

  if (activePlanningAlerts.some((alert) => alert.alert_type === 'obra_no_lista')) {
    blockingReasons.push('Existe una alerta abierta de obra no lista.');
  }

  if (activePlanningAlerts.some((alert) => alert.alert_type === 'dependencia_bloqueante')) {
    blockingReasons.push('Existe una alerta abierta de dependencia bloqueante.');
  }

  if (blockingReasons.length > 0) {
    return {
      status: 'red',
      can_dispatch_workers: false,
      blocking_reasons: uniqueReasons(blockingReasons),
    };
  }

  if (activePlanningAlerts.some((alert) => alert.severity === 'high' || alert.severity === 'medium')) {
    blockingReasons.push('Hay alertas de planeamiento abiertas.');
  }

  if (
    operationalReadinessChecks.some(
      (check) => check.blocks_next_stage && isPendingReadinessCheck(check),
    )
  ) {
    blockingReasons.push('Hay un check operativo pendiente que bloquea el siguiente paso.');
  }

  if (activePlanningAlerts.length > 0) {
    blockingReasons.push('Hay alertas de planeamiento abiertas.');
  }

  if (blockingReasons.length > 0) {
    return {
      status: 'yellow',
      can_dispatch_workers: false,
      blocking_reasons: uniqueReasons(blockingReasons),
    };
  }

  return {
    status: 'green',
    can_dispatch_workers: true,
    blocking_reasons: [],
  };
}
