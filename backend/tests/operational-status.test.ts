import { describe, expect, it } from 'vitest';

import { calculateOperationalStatus } from '../src/modules/work-orders/operationalStatus.js';
import type {
  OperationalReadinessCheckSummary,
  PlanningAlertSummary,
} from '../src/modules/work-orders/types.js';

function readinessCheck(
  overrides: Partial<OperationalReadinessCheckSummary> = {},
): OperationalReadinessCheckSummary {
  return {
    id: 'check-1',
    check_type: 'site_ready_for_installation',
    title: 'Confirmar obra lista',
    description: null,
    status: 'confirmed',
    required_evidence_type: null,
    responsible_party: null,
    requested_by_agent: null,
    confirmed_by: null,
    confirmed_at: null,
    expires_at: null,
    blocks_next_stage: false,
    blocks_worker_dispatch: false,
    created_at: '2026-07-01T10:00:00.000Z',
    updated_at: '2026-07-01T10:00:00.000Z',
    ...overrides,
  };
}

function planningAlert(overrides: Partial<PlanningAlertSummary> = {}): PlanningAlertSummary {
  return {
    id: 'alert-1',
    alert_type: 'capacidad_taller',
    title: 'Alerta de planificacion',
    message: 'Mensaje de prueba',
    severity: 'low',
    status: 'open',
    generated_by: 'planning_ai',
    assigned_to: null,
    resolved_at: null,
    created_at: '2026-07-01T10:00:00.000Z',
    updated_at: '2026-07-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('calculateOperationalStatus', () => {
  it('returns red when a worker-dispatch readiness check is pending', () => {
    expect(
      calculateOperationalStatus(
        [readinessCheck({ blocks_worker_dispatch: true, status: 'requested' })],
        [],
      ),
    ).toEqual({
      status: 'red',
      can_dispatch_workers: false,
      blocking_reasons: [
        'Hay un check operativo que bloquea despacho de trabajadores y no esta confirmado.',
      ],
    });
  });

  it('returns red when an open planning alert marks the site as not ready', () => {
    expect(
      calculateOperationalStatus(
        [readinessCheck({ blocks_worker_dispatch: true, status: 'confirmed' })],
        [planningAlert({ alert_type: 'obra_no_lista', severity: 'high' })],
      ),
    ).toMatchObject({
      status: 'red',
      can_dispatch_workers: false,
      blocking_reasons: ['Existe una alerta abierta de obra no lista.'],
    });
  });

  it('returns red when an open planning alert has critical severity', () => {
    expect(
      calculateOperationalStatus(
        [readinessCheck({ blocks_worker_dispatch: true, status: 'confirmed' })],
        [planningAlert({ severity: 'critical' })],
      ),
    ).toMatchObject({
      status: 'red',
      can_dispatch_workers: false,
      blocking_reasons: ['Existe una alerta critica abierta.'],
    });
  });

  it('returns yellow when a high severity alert is open but no red condition exists', () => {
    expect(
      calculateOperationalStatus(
        [readinessCheck({ blocks_worker_dispatch: true, status: 'confirmed' })],
        [planningAlert({ alert_type: 'capacidad_taller', severity: 'high' })],
      ),
    ).toEqual({
      status: 'yellow',
      can_dispatch_workers: false,
      blocking_reasons: ['Hay alertas de planeamiento abiertas.'],
    });
  });

  it('returns yellow when there are no checks or alerts', () => {
    expect(calculateOperationalStatus([], [])).toEqual({
      status: 'yellow',
      can_dispatch_workers: false,
      blocking_reasons: ['No hay checks operativos configurados para validar despacho.'],
    });
  });

  it('returns green when dispatch checks are complete and there are no open alerts', () => {
    expect(
      calculateOperationalStatus(
        [readinessCheck({ blocks_worker_dispatch: true, status: 'confirmed' })],
        [],
      ),
    ).toEqual({
      status: 'green',
      can_dispatch_workers: true,
      blocking_reasons: [],
    });
  });

  it('ignores resolved, false-positive and cancelled planning alerts', () => {
    expect(
      calculateOperationalStatus(
        [readinessCheck({ blocks_worker_dispatch: true, status: 'confirmed' })],
        [
          planningAlert({ alert_type: 'obra_no_lista', status: 'resolved' }),
          planningAlert({ alert_type: 'dependencia_bloqueante', status: 'false_positive' }),
          planningAlert({ severity: 'critical', status: 'cancelled' }),
        ],
      ),
    ).toEqual({
      status: 'green',
      can_dispatch_workers: true,
      blocking_reasons: [],
    });
  });
});
