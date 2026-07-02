import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { getWorkOrderDetail } from '../api/workOrders';
import type { WorkOrderDetail, OperationalStatus } from '../api/types';

type WorkOrderDetailViewProps = {
  workOrderId: string;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'loaded'; workOrder: WorkOrderDetail }
  | { status: 'error'; message: string };

const operationalCopy: Record<OperationalStatus['status'], string> = {
  green: 'Orden operativamente liberada.',
  red: 'No enviar trabajadores todavía.',
  yellow: 'Hay pendientes por revisar antes de avanzar.',
};

export function WorkOrderDetailView({ workOrderId }: WorkOrderDetailViewProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let isCurrent = true;

    setLoadState({ status: 'loading' });

    getWorkOrderDetail(workOrderId)
      .then((workOrder) => {
        if (isCurrent) {
          setLoadState({ status: 'loaded', workOrder });
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLoadState({
            message:
              error instanceof Error ? error.message : 'No se pudo cargar la orden de trabajo.',
            status: 'error',
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [workOrderId]);

  if (loadState.status === 'loading') {
    return (
      <main className="work-order-detail-shell">
        <p className="detail-loading">Cargando orden de trabajo...</p>
      </main>
    );
  }

  if (loadState.status === 'error') {
    return (
      <main className="work-order-detail-shell">
        <section className="detail-error" role="alert">
          <p>{loadState.message}</p>
        </section>
      </main>
    );
  }

  const { workOrder } = loadState;
  const operationalStatus = workOrder.operational_status;

  return (
    <main className="work-order-detail-shell">
      <header className="work-order-detail-header">
        <div>
          <p className="eyebrow">Detalle operativo</p>
          <h1>{workOrder.title}</h1>
        </div>
        <div className="status-chip-group" aria-label="Estado de la orden">
          <span className="status-chip">{workOrder.status}</span>
          <span className={`status-chip operational-${operationalStatus.status}`}>
            {operationalStatus.status}
          </span>
        </div>
      </header>

      <section className={`operational-banner operational-${operationalStatus.status}`}>
        <div>
          <p className="eyebrow">Semáforo operativo</p>
          <h2>{operationalCopy[operationalStatus.status]}</h2>
        </div>
        <dl>
          <div>
            <dt>Puede enviar trabajadores</dt>
            <dd>{operationalStatus.can_dispatch_workers ? 'sí' : 'no'}</dd>
          </div>
        </dl>
      </section>

      <section className="detail-grid">
        <InfoSection title="Cliente">
          {workOrder.client === null ? (
            <p className="muted-text">Sin cliente asociado.</p>
          ) : (
            <dl className="detail-list">
              <DetailRow label="Nombre" value={workOrder.client.full_name} />
              <DetailRow label="Mostrar como" value={workOrder.client.display_name} />
              <DetailRow label="Ubicación habitual" value={workOrder.client.default_location} />
            </dl>
          )}
        </InfoSection>

        <InfoSection title="Datos básicos">
          <dl className="detail-list">
            <DetailRow label="Tipo de mueble" value={workOrder.furniture_type} />
            <DetailRow label="Ambiente" value={workOrder.room} />
            <DetailRow label="Ubicación" value={workOrder.location} />
            <DetailRow label="Prioridad" value={workOrder.priority} />
          </dl>
        </InfoSection>
      </section>

      <InfoSection title="Razones de bloqueo">
        {operationalStatus.blocking_reasons.length === 0 ? (
          <p className="muted-text">Sin bloqueos operativos activos.</p>
        ) : (
          <ul className="plain-list">
            {operationalStatus.blocking_reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
      </InfoSection>

      <InfoSection title="Readiness checks">
        <div className="item-list">
          {workOrder.operational_readiness_checks.map((check) => (
            <article className="detail-item" key={check.id}>
              <div>
                <p className="item-kicker">{check.check_type}</p>
                <h3>{check.title}</h3>
              </div>
              <dl className="compact-detail-list">
                <DetailRow label="Estado" value={check.status} />
                <DetailRow label="Responsable" value={check.responsible_party} />
                <DetailRow
                  label="Bloquea despacho"
                  value={check.blocks_worker_dispatch ? 'sí' : 'no'}
                />
              </dl>
            </article>
          ))}
        </div>
      </InfoSection>

      <InfoSection title="Planning alerts">
        <div className="item-list">
          {workOrder.planning_alerts.map((alert) => (
            <article className="detail-item" key={alert.id}>
              <div>
                <p className="item-kicker">{alert.alert_type}</p>
                <h3>{alert.title}</h3>
              </div>
              <dl className="compact-detail-list">
                <DetailRow label="Severidad" value={alert.severity} />
                <DetailRow label="Estado" value={alert.status} />
                <DetailRow label="Asignada a" value={alert.assigned_to} />
              </dl>
            </article>
          ))}
        </div>
      </InfoSection>
    </main>
  );
}

function InfoSection({ children, title }: { children: ReactNode; title: string }) {
  const titleId = `detail-section-${title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <section className="detail-section" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      {children}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value ?? 'Sin dato'}</dd>
    </div>
  );
}
