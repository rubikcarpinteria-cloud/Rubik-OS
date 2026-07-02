import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from '../src/App';
import { createPublicSupabaseClient } from '../src/supabase';

vi.mock('../src/supabase', () => ({
  createPublicSupabaseClient: vi.fn(),
}));

const workOrderDetailResponse = {
  data: {
    client: {
      default_location: 'Rosario',
      display_name: 'Cliente Staging',
      full_name: 'Cliente Prueba Staging',
      id: 'client-1',
    },
    client_id: 'client-1',
    confirmed_delivery_date: null,
    created_at: '2026-07-01T10:00:00.000Z',
    description: 'Orden de prueba',
    furniture_type: 'bajo mesada',
    id: 'f801a28e-7aea-4346-badf-2992513c32e5',
    is_blocked: false,
    location: 'Cocina principal',
    operational_readiness_checks: [
      {
        blocks_next_stage: true,
        blocks_worker_dispatch: true,
        check_type: 'site_ready_for_installation',
        confirmed_at: null,
        confirmed_by: null,
        created_at: '2026-07-01T10:00:00.000Z',
        description: 'Confirmar obra lista',
        expires_at: null,
        id: 'check-1',
        requested_by_agent: 'operational_control_ai',
        required_evidence_type: 'mixed',
        responsible_party: 'client',
        status: 'requested',
        title: 'Confirmar obra lista para instalar',
        updated_at: '2026-07-01T10:00:00.000Z',
      },
    ],
    operational_status: {
      blocking_reasons: ['Existe una alerta abierta de obra no lista.'],
      can_dispatch_workers: false,
      status: 'red',
    },
    planning_alerts: [
      {
        alert_type: 'obra_no_lista',
        assigned_to: 'diego',
        created_at: '2026-07-01T10:00:00.000Z',
        generated_by: 'planning_ai',
        id: 'alert-1',
        message: 'Falta evidencia verificable de obra lista.',
        resolved_at: null,
        severity: 'high',
        status: 'open',
        title: 'No enviar instaladores',
        updated_at: '2026-07-01T10:00:00.000Z',
      },
    ],
    priority: 'high',
    room: 'cocina',
    status: 'nuevo_contacto',
    tentative_delivery_date: null,
    title: 'Prueba staging - bajo mesada',
    updated_at: '2026-07-01T10:00:00.000Z',
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function mockFetch(response: unknown, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' },
        status,
      }),
    ),
  );
}

describe('Work order operational detail view', () => {
  it('renders the visual demo on the root route', () => {
    window.history.pushState(null, '', '/');

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Constructor visual modular' })).toBeInTheDocument();
  });

  it('renders a work order detail from the backend route', async () => {
    mockFetch(workOrderDetailResponse);
    window.history.pushState(null, '', '/work-orders/f801a28e-7aea-4346-badf-2992513c32e5');

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'Prueba staging - bajo mesada' }),
    ).toBeInTheDocument();
    expect(screen.getByText('No enviar trabajadores todavía.')).toBeInTheDocument();
    expect(screen.getByText('Cliente Prueba Staging')).toBeInTheDocument();
    expect(screen.getByText('Confirmar obra lista para instalar')).toBeInTheDocument();
    expect(screen.getByText('No enviar instaladores')).toBeInTheDocument();
    expect(screen.getByText('Existe una alerta abierta de obra no lista.')).toBeInTheDocument();

    const readinessSection = screen.getByRole('region', { name: 'Readiness checks' });
    expect(within(readinessSection).getByText('site_ready_for_installation')).toBeInTheDocument();
    expect(within(readinessSection).getByText('client')).toBeInTheDocument();

    const alertsSection = screen.getByRole('region', { name: 'Planning alerts' });
    expect(within(alertsSection).getByText('obra_no_lista')).toBeInTheDocument();
    expect(within(alertsSection).getByText('high')).toBeInTheDocument();
    expect(within(alertsSection).getByText('diego')).toBeInTheDocument();
  });

  it('shows a friendly 404 state', async () => {
    mockFetch({ error: 'work_order_not_found' }, 404);
    window.history.pushState(null, '', '/work-orders/missing-order');

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No encontramos esa orden de trabajo.',
    );
  });

  it('shows a friendly 503 state', async () => {
    mockFetch({ error: 'work_order_query_failed' }, 503);
    window.history.pushState(null, '', '/work-orders/backend-down');

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El backend o Supabase staging no está disponible.',
    );
  });

  it('does not create a public Supabase client for the work order detail flow', async () => {
    mockFetch(workOrderDetailResponse);
    window.history.pushState(null, '', '/work-orders/f801a28e-7aea-4346-badf-2992513c32e5');

    render(<App />);

    expect(await screen.findByText('Prueba staging - bajo mesada')).toBeInTheDocument();
    expect(createPublicSupabaseClient).not.toHaveBeenCalled();
  });
});
