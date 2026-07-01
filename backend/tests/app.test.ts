import { afterEach, describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';

const apps: Awaited<ReturnType<typeof buildApp>>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map(async (app) => app.close()));
});

describe('GET /health', () => {
  it('reports a healthy service without requiring Supabase credentials', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config);
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      service: 'rubik-os-backend',
      status: 'ok',
      supabase: 'not_configured',
    });
  });
});

describe('GET /health/supabase', () => {
  it('reports not_configured when Supabase credentials are omitted', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config);
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/health/supabase' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      service: 'rubik-os-backend',
      status: 'not_configured',
      supabase: 'not_configured',
    });
  });

  it('runs a safe technical-table query when Supabase is configured', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: (table: string) => ({
        select: (columns: string, options: { count: 'exact'; head: true }) => {
          expect(table).toBe('ai_agents');
          expect(columns).toBe('code');
          expect(options).toEqual({ count: 'exact', head: true });

          return Promise.resolve({ count: 7, error: null });
        },
      }),
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/health/supabase' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      service: 'rubik-os-backend',
      status: 'ok',
      supabase: 'connected',
      table: 'ai_agents',
      count: 7,
    });
  });

  it('reports query failures without exposing credentials', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: () => ({
        select: () => Promise.resolve({ count: null, error: { message: 'permission denied' } }),
      }),
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/health/supabase' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      service: 'rubik-os-backend',
      status: 'error',
      supabase: 'query_failed',
      table: 'ai_agents',
    });
  });
});

describe('GET /clients', () => {
  it('returns a client list from Supabase', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: (table: string) => {
        expect(table).toBe('clients');

        return {
          select: (columns: string) => {
            expect(columns).toBe(
              'id, full_name, display_name, default_location, created_at, updated_at',
            );

            return {
              order: (column: string, options: { ascending: boolean }) => {
                expect(column).toBe('created_at');
                expect(options).toEqual({ ascending: false });

                return {
                  limit: (limit: number) => {
                    expect(limit).toBe(25);

                    return Promise.resolve({
                      data: [
                        {
                          id: 'client-1',
                          full_name: 'Cliente Demo',
                          display_name: 'Demo',
                          default_location: 'Taller',
                          created_at: '2026-07-01T10:00:00.000Z',
                          updated_at: '2026-07-01T10:00:00.000Z',
                        },
                      ],
                      error: null,
                    });
                  },
                };
              },
            };
          },
        };
      },
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/clients' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [
        {
          id: 'client-1',
          full_name: 'Cliente Demo',
          display_name: 'Demo',
          default_location: 'Taller',
          created_at: '2026-07-01T10:00:00.000Z',
          updated_at: '2026-07-01T10:00:00.000Z',
        },
      ],
      meta: {
        limit: 25,
      },
    });
  });

  it('respects the limit query parameter', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: () => ({
        select: () => ({
          order: () => ({
            limit: (limit: number) => {
              expect(limit).toBe(10);

              return Promise.resolve({ data: [], error: null });
            },
          }),
        }),
      }),
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/clients?limit=10' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [],
      meta: {
        limit: 10,
      },
    });
  });

  it('caps the limit query parameter at 100', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: () => ({
        select: () => ({
          order: () => ({
            limit: (limit: number) => {
              expect(limit).toBe(100);

              return Promise.resolve({ data: [], error: null });
            },
          }),
        }),
      }),
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/clients?limit=500' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [],
      meta: {
        limit: 100,
      },
    });
  });

  it('returns 503 when Supabase is not configured', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config);
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/clients' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: 'supabase_not_configured',
    });
  });

  it('returns 503 when Supabase fails', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: null, error: { message: 'permission denied' } }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/clients' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: 'clients_query_failed',
    });
  });
});

describe('GET /work-orders', () => {
  it('returns a work order list from Supabase', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: (table: string) => {
        expect(table).toBe('work_orders');

        return {
          select: (columns: string) => {
            expect(columns).toBe(
              'id, client_id, title, description, furniture_type, room, location, priority, status, is_blocked, tentative_delivery_date, confirmed_delivery_date, created_at, updated_at',
            );

            return {
              order: (column: string, options: { ascending: boolean }) => {
                expect(column).toBe('created_at');
                expect(options).toEqual({ ascending: false });

                return {
                  limit: (limit: number) => {
                    expect(limit).toBe(25);

                    return Promise.resolve({
                      data: [
                        {
                          id: 'work-order-1',
                          client_id: 'client-1',
                          title: 'Cocina demo',
                          description: 'Proyecto de prueba',
                          furniture_type: 'kitchen',
                          room: 'Cocina',
                          location: 'Obra staging',
                          priority: 'normal',
                          status: 'new',
                          is_blocked: false,
                          tentative_delivery_date: null,
                          confirmed_delivery_date: null,
                          created_at: '2026-07-01T10:00:00.000Z',
                          updated_at: '2026-07-01T10:00:00.000Z',
                        },
                      ],
                      error: null,
                    });
                  },
                };
              },
            };
          },
        };
      },
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [
        {
          id: 'work-order-1',
          client_id: 'client-1',
          title: 'Cocina demo',
          description: 'Proyecto de prueba',
          furniture_type: 'kitchen',
          room: 'Cocina',
          location: 'Obra staging',
          priority: 'normal',
          status: 'new',
          is_blocked: false,
          tentative_delivery_date: null,
          confirmed_delivery_date: null,
          created_at: '2026-07-01T10:00:00.000Z',
          updated_at: '2026-07-01T10:00:00.000Z',
        },
      ],
      meta: {
        limit: 25,
        status: null,
        client_id: null,
      },
    });
  });

  it('respects the limit query parameter', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: () => ({
        select: () => ({
          order: () => ({
            limit: (limit: number) => {
              expect(limit).toBe(10);

              return Promise.resolve({ data: [], error: null });
            },
          }),
        }),
      }),
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders?limit=10' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [],
      meta: {
        limit: 10,
        status: null,
        client_id: null,
      },
    });
  });

  it('caps the limit query parameter at 100', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: () => ({
        select: () => ({
          order: () => ({
            limit: (limit: number) => {
              expect(limit).toBe(100);

              return Promise.resolve({ data: [], error: null });
            },
          }),
        }),
      }),
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders?limit=500' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [],
      meta: {
        limit: 100,
        status: null,
        client_id: null,
      },
    });
  });

  it('filters by status', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: () => ({
        select: () => ({
          eq: (column: string, value: string) => {
            expect(column).toBe('status');
            expect(value).toBe('new');

            return {
              order: () => ({
                limit: () => Promise.resolve({ data: [], error: null }),
              }),
            };
          },
        }),
      }),
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders?status=new' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [],
      meta: {
        limit: 25,
        status: 'new',
        client_id: null,
      },
    });
  });

  it('filters by client_id', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: () => ({
        select: () => ({
          eq: (column: string, value: string) => {
            expect(column).toBe('client_id');
            expect(value).toBe('client-1');

            return {
              order: () => ({
                limit: () => Promise.resolve({ data: [], error: null }),
              }),
            };
          },
        }),
      }),
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders?client_id=client-1' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [],
      meta: {
        limit: 25,
        status: null,
        client_id: 'client-1',
      },
    });
  });

  it('returns 503 when Supabase is not configured', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config);
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: 'supabase_not_configured',
    });
  });

  it('returns 503 when Supabase fails', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: null, error: { message: 'permission denied' } }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: 'work_orders_query_failed',
    });
  });
});

describe('GET /work-orders/:id', () => {
  it('returns a work order detail with its client from Supabase', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: (table: string) => {
        if (table === 'operational_readiness_checks') {
          return {
            select: (columns: string) => {
              expect(columns).toBe(
                'id, check_type, title, description, status, required_evidence_type, responsible_party, requested_by_agent, confirmed_by, confirmed_at, expires_at, blocks_next_stage, blocks_worker_dispatch, created_at, updated_at',
              );

              return {
                eq: (column: string, value: string) => {
                  expect(column).toBe('work_order_id');
                  expect(value).toBe('work-order-1');

                  return {
                    order: (column: string, options: { ascending: boolean }) => {
                      expect(column).toBe('created_at');
                      expect(options).toEqual({ ascending: true });

                      return Promise.resolve({
                        data: [
                          {
                            id: 'check-1',
                            check_type: 'site_ready_for_installation',
                            title: 'Confirmar obra lista para instalar',
                            description:
                              'No enviar instaladores hasta recibir evidencia verificable de obra lista.',
                            status: 'requested',
                            required_evidence_type: 'mixed',
                            responsible_party: 'client',
                            requested_by_agent: 'operational_control_ai',
                            confirmed_by: null,
                            confirmed_at: null,
                            expires_at: null,
                            blocks_next_stage: true,
                            blocks_worker_dispatch: true,
                            created_at: '2026-07-01T11:00:00.000Z',
                            updated_at: '2026-07-01T11:00:00.000Z',
                          },
                        ],
                        error: null,
                      });
                    },
                  };
                },
              };
            },
          };
        }

        if (table === 'planning_alerts') {
          return {
            select: (columns: string) => {
              expect(columns).toBe(
                'id, alert_type, title, message, severity, status, generated_by, assigned_to, resolved_at, created_at, updated_at',
              );

              return {
                eq: (column: string, value: string) => {
                  expect(column).toBe('work_order_id');
                  expect(value).toBe('work-order-1');

                  return {
                    order: (column: string, options: { ascending: boolean }) => {
                      expect(column).toBe('created_at');
                      expect(options).toEqual({ ascending: false });

                      return Promise.resolve({
                        data: [
                          {
                            id: 'alert-1',
                            alert_type: 'obra_no_lista',
                            title: 'No enviar instaladores',
                            message: 'Falta evidencia verificable de obra lista.',
                            severity: 'high',
                            status: 'open',
                            generated_by: 'planning_ai',
                            assigned_to: 'diego',
                            resolved_at: null,
                            created_at: '2026-07-01T12:00:00.000Z',
                            updated_at: '2026-07-01T12:00:00.000Z',
                          },
                        ],
                        error: null,
                      });
                    },
                  };
                },
              };
            },
          };
        }

        expect(table).toBe('work_orders');

        return {
          select: (columns: string) => {
            expect(columns).toBe(
              'id, client_id, title, description, furniture_type, room, location, priority, status, is_blocked, tentative_delivery_date, confirmed_delivery_date, created_at, updated_at, client:clients(id, full_name, display_name, default_location)',
            );

            return {
              eq: (column: string, value: string) => {
                expect(column).toBe('id');
                expect(value).toBe('work-order-1');

                return {
                  maybeSingle: () =>
                    Promise.resolve({
                      data: {
                        id: 'work-order-1',
                        client_id: 'client-1',
                        title: 'Cocina demo',
                        description: 'Proyecto de prueba',
                        furniture_type: 'kitchen',
                        room: 'Cocina',
                        location: 'Obra staging',
                        priority: 'normal',
                        status: 'new',
                        is_blocked: false,
                        tentative_delivery_date: null,
                        confirmed_delivery_date: null,
                        created_at: '2026-07-01T10:00:00.000Z',
                        updated_at: '2026-07-01T10:00:00.000Z',
                        client: {
                          id: 'client-1',
                          full_name: 'Cliente Demo',
                          display_name: 'Demo',
                          default_location: 'Taller',
                        },
                      },
                      error: null,
                    }),
                };
              },
            };
          },
        };
      },
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders/work-order-1' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: {
        id: 'work-order-1',
        client_id: 'client-1',
        title: 'Cocina demo',
        description: 'Proyecto de prueba',
        furniture_type: 'kitchen',
        room: 'Cocina',
        location: 'Obra staging',
        priority: 'normal',
        status: 'new',
        is_blocked: false,
        tentative_delivery_date: null,
        confirmed_delivery_date: null,
        created_at: '2026-07-01T10:00:00.000Z',
        updated_at: '2026-07-01T10:00:00.000Z',
        client: {
          id: 'client-1',
          full_name: 'Cliente Demo',
          display_name: 'Demo',
          default_location: 'Taller',
        },
        operational_readiness_checks: [
          {
            id: 'check-1',
            check_type: 'site_ready_for_installation',
            title: 'Confirmar obra lista para instalar',
            description: 'No enviar instaladores hasta recibir evidencia verificable de obra lista.',
            status: 'requested',
            required_evidence_type: 'mixed',
            responsible_party: 'client',
            requested_by_agent: 'operational_control_ai',
            confirmed_by: null,
            confirmed_at: null,
            expires_at: null,
            blocks_next_stage: true,
            blocks_worker_dispatch: true,
            created_at: '2026-07-01T11:00:00.000Z',
            updated_at: '2026-07-01T11:00:00.000Z',
          },
        ],
        planning_alerts: [
          {
            id: 'alert-1',
            alert_type: 'obra_no_lista',
            title: 'No enviar instaladores',
            message: 'Falta evidencia verificable de obra lista.',
            severity: 'high',
            status: 'open',
            generated_by: 'planning_ai',
            assigned_to: 'diego',
            resolved_at: null,
            created_at: '2026-07-01T12:00:00.000Z',
            updated_at: '2026-07-01T12:00:00.000Z',
          },
        ],
        operational_status: {
          status: 'red',
          can_dispatch_workers: false,
          blocking_reasons: [
            'Hay un check operativo que bloquea despacho de trabajadores y no esta confirmado.',
            'Existe una alerta abierta de obra no lista.',
          ],
        },
      },
    });
  });

  it('does not return excluded work order or client fields', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: (table: string) => {
        if (table === 'operational_readiness_checks') {
          return {
            select: () => ({
              eq: () => ({
                order: () =>
                  Promise.resolve({
                    data: [
                      {
                        id: 'check-1',
                        check_type: 'site_ready_for_installation',
                        title: 'Confirmar obra lista',
                        description: 'Descripcion publica',
                        status: 'requested',
                        required_evidence_type: 'mixed',
                        responsible_party: 'client',
                        requested_by_agent: 'operational_control_ai',
                        confirmed_by: null,
                        confirmed_at: null,
                        expires_at: null,
                        blocks_next_stage: true,
                        blocks_worker_dispatch: true,
                        notes: 'internal check notes',
                        created_at: '2026-07-01T11:00:00.000Z',
                        updated_at: '2026-07-01T11:00:00.000Z',
                      },
                    ],
                    error: null,
                  }),
              }),
            }),
          };
        }

        if (table === 'planning_alerts') {
          return {
            select: () => ({
              eq: () => ({
                order: () =>
                  Promise.resolve({
                    data: [
                      {
                        id: 'alert-1',
                        alert_type: 'obra_no_lista',
                        title: 'No enviar instaladores',
                        message: 'Falta evidencia verificable de obra lista.',
                        severity: 'high',
                        status: 'open',
                        generated_by: 'planning_ai',
                        assigned_to: 'diego',
                        resolved_at: null,
                        created_at: '2026-07-01T12:00:00.000Z',
                        updated_at: '2026-07-01T12:00:00.000Z',
                      },
                    ],
                    error: null,
                  }),
              }),
            }),
          };
        }

        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: {
                    id: 'work-order-1',
                    client_id: 'client-1',
                    source_channel_id: 'channel-1',
                    title: 'Cocina demo',
                    description: 'Proyecto de prueba',
                    furniture_type: 'kitchen',
                    room: 'Cocina',
                    location: 'Obra staging',
                    priority: 'normal',
                    status: 'new',
                    is_blocked: false,
                    requires_diego_approval: true,
                    tentative_delivery_date: null,
                    confirmed_delivery_date: null,
                    created_by: 'internal-user',
                    assigned_to: 'internal-user',
                    notes: 'internal notes',
                    created_at: '2026-07-01T10:00:00.000Z',
                    updated_at: '2026-07-01T10:00:00.000Z',
                    client: {
                      id: 'client-1',
                      full_name: 'Cliente Demo',
                      display_name: 'Demo',
                      document_id: 'secret-document',
                      notes: 'client notes',
                      default_location: 'Taller',
                    },
                  },
                  error: null,
                }),
            }),
          }),
        };
      },
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders/work-order-1' });
    const responseBody = response.body;
    const responseData = response.json().data;

    expect(response.statusCode).toBe(200);
    expect(responseBody).not.toContain('notes');
    expect(responseBody).not.toContain('created_by');
    expect(responseBody).not.toContain('requires_diego_approval');
    expect(responseBody).not.toContain('source_channel_id');
    expect(responseBody).not.toContain('document_id');
    expect(responseData).not.toHaveProperty('assigned_to');
  });

  it('returns an empty readiness check list when the work order has no checks', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: (table: string) => {
        if (table === 'operational_readiness_checks') {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
          };
        }

        if (table === 'planning_alerts') {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
          };
        }

        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: {
                    id: 'work-order-1',
                    client_id: 'client-1',
                    title: 'Cocina demo',
                    description: 'Proyecto de prueba',
                    furniture_type: 'kitchen',
                    room: 'Cocina',
                    location: 'Obra staging',
                    priority: 'normal',
                    status: 'new',
                    is_blocked: false,
                    tentative_delivery_date: null,
                    confirmed_delivery_date: null,
                    created_at: '2026-07-01T10:00:00.000Z',
                    updated_at: '2026-07-01T10:00:00.000Z',
                    client: {
                      id: 'client-1',
                      full_name: 'Cliente Demo',
                      display_name: 'Demo',
                      default_location: 'Taller',
                    },
                  },
                  error: null,
                }),
            }),
          }),
        };
      },
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders/work-order-1' });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.operational_readiness_checks).toEqual([]);
  });

  it('returns 503 when the readiness check query fails', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: (table: string) => {
        if (table === 'operational_readiness_checks') {
          return {
            select: () => ({
              eq: () => ({
                order: () =>
                  Promise.resolve({ data: null, error: { message: 'permission denied' } }),
              }),
            }),
          };
        }

        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: {
                    id: 'work-order-1',
                    client_id: 'client-1',
                    title: 'Cocina demo',
                    description: 'Proyecto de prueba',
                    furniture_type: 'kitchen',
                    room: 'Cocina',
                    location: 'Obra staging',
                    priority: 'normal',
                    status: 'new',
                    is_blocked: false,
                    tentative_delivery_date: null,
                    confirmed_delivery_date: null,
                    created_at: '2026-07-01T10:00:00.000Z',
                    updated_at: '2026-07-01T10:00:00.000Z',
                    client: {
                      id: 'client-1',
                      full_name: 'Cliente Demo',
                      display_name: 'Demo',
                      default_location: 'Taller',
                    },
                  },
                  error: null,
                }),
            }),
          }),
        };
      },
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders/work-order-1' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: 'work_order_query_failed',
    });
  });

  it('returns an empty planning alert list when the work order has no alerts', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: (table: string) => {
        if (table === 'operational_readiness_checks') {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
          };
        }

        if (table === 'planning_alerts') {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
          };
        }

        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: {
                    id: 'work-order-1',
                    client_id: 'client-1',
                    title: 'Cocina demo',
                    description: 'Proyecto de prueba',
                    furniture_type: 'kitchen',
                    room: 'Cocina',
                    location: 'Obra staging',
                    priority: 'normal',
                    status: 'new',
                    is_blocked: false,
                    tentative_delivery_date: null,
                    confirmed_delivery_date: null,
                    created_at: '2026-07-01T10:00:00.000Z',
                    updated_at: '2026-07-01T10:00:00.000Z',
                    client: {
                      id: 'client-1',
                      full_name: 'Cliente Demo',
                      display_name: 'Demo',
                      default_location: 'Taller',
                    },
                  },
                  error: null,
                }),
            }),
          }),
        };
      },
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders/work-order-1' });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.planning_alerts).toEqual([]);
  });

  it('returns 503 when the planning alert query fails', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: (table: string) => {
        if (table === 'operational_readiness_checks') {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
          };
        }

        if (table === 'planning_alerts') {
          return {
            select: () => ({
              eq: () => ({
                order: () =>
                  Promise.resolve({ data: null, error: { message: 'permission denied' } }),
              }),
            }),
          };
        }

        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: {
                    id: 'work-order-1',
                    client_id: 'client-1',
                    title: 'Cocina demo',
                    description: 'Proyecto de prueba',
                    furniture_type: 'kitchen',
                    room: 'Cocina',
                    location: 'Obra staging',
                    priority: 'normal',
                    status: 'new',
                    is_blocked: false,
                    tentative_delivery_date: null,
                    confirmed_delivery_date: null,
                    created_at: '2026-07-01T10:00:00.000Z',
                    updated_at: '2026-07-01T10:00:00.000Z',
                    client: {
                      id: 'client-1',
                      full_name: 'Cliente Demo',
                      display_name: 'Demo',
                      default_location: 'Taller',
                    },
                  },
                  error: null,
                }),
            }),
          }),
        };
      },
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders/work-order-1' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: 'work_order_query_failed',
    });
  });

  it('returns 400 when the work order id is invalid', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, { supabaseClient: null });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders/%20' });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'invalid_work_order_id',
    });
  });

  it('returns 404 when the work order does not exist', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders/missing-work-order' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: 'work_order_not_found',
    });
  });

  it('returns 503 when Supabase is not configured', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config);
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders/work-order-1' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: 'supabase_not_configured',
    });
  });

  it('returns 503 when Supabase fails', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const supabaseClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () =>
              Promise.resolve({ data: null, error: { message: 'permission denied' } }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;
    const app = await buildApp(config, { supabaseClient });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/work-orders/work-order-1' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: 'work_order_query_failed',
    });
  });
});

describe('PATCH /work-orders/:id/readiness-checks/:checkId', () => {
  type MockRecord = Record<string, unknown>;

  type ReadinessPatchMockOptions = {
    evidenceData?: MockRecord | null;
    evidenceError?: unknown;
    existingData?: MockRecord | null;
    existingError?: unknown;
    onEvidenceInsert?: (payload: MockRecord) => void;
    onUpdate?: (payload: MockRecord) => void;
    updatedData?: MockRecord | null;
    updateError?: unknown;
  };

  const existingReadinessCheck = {
    id: 'check-1',
    work_order_id: 'work-order-1',
    check_type: 'site_ready_for_installation',
    title: 'Confirmar obra lista para instalar',
    description: 'No enviar instaladores hasta recibir evidencia verificable de obra lista.',
    status: 'requested',
    required_evidence_type: 'mixed',
    responsible_party: 'client',
    requested_by_agent: 'operational_control_ai',
    confirmed_by: null,
    confirmed_at: null,
    expires_at: null,
    blocks_next_stage: true,
    blocks_worker_dispatch: true,
    created_at: '2026-07-01T11:00:00.000Z',
    updated_at: '2026-07-01T11:00:00.000Z',
  };

  const confirmedReadinessCheck = {
    ...existingReadinessCheck,
    status: 'confirmed',
    confirmed_by: 'Diego',
    confirmed_at: '2026-07-01T12:00:00.000Z',
    updated_at: '2026-07-01T12:00:00.000Z',
  };

  const readinessEvidence = {
    id: 'evidence-1',
    evidence_type: 'photo',
    evidence_label: 'Foto obra lista',
    external_reference: 'https://example.invalid/evidence',
    received_from: 'Cliente Prueba',
    received_at: '2026-07-01T12:05:00.000Z',
  };

  function createReadinessPatchSupabaseMock(
    options: ReadinessPatchMockOptions = {},
  ): SupabaseClient {
    const existingData =
      'existingData' in options ? options.existingData : existingReadinessCheck;
    const existingError = options.existingError ?? null;
    const updatedData = 'updatedData' in options ? options.updatedData : confirmedReadinessCheck;
    const updateError = options.updateError ?? null;
    const evidenceData = 'evidenceData' in options ? options.evidenceData : readinessEvidence;
    const evidenceError = options.evidenceError ?? null;

    return {
      from: (table: string) => {
        if (table === 'operational_readiness_checks') {
          return {
            select: () => {
              const selectChain = {
                eq: () => selectChain,
                maybeSingle: () => Promise.resolve({ data: existingData, error: existingError }),
              };

              return selectChain;
            },
            update: (payload: MockRecord) => {
              options.onUpdate?.(payload);

              const updateChain = {
                eq: () => updateChain,
                select: () => ({
                  single: () => Promise.resolve({ data: updatedData, error: updateError }),
                }),
              };

              return updateChain;
            },
          };
        }

        if (table === 'readiness_check_evidence') {
          return {
            insert: (payload: MockRecord) => {
              options.onEvidenceInsert?.(payload);

              return {
                select: () => ({
                  single: () => Promise.resolve({ data: evidenceData, error: evidenceError }),
                }),
              };
            },
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    } as unknown as SupabaseClient;
  }

  it('confirms a readiness check with valid evidence', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, {
      supabaseClient: createReadinessPatchSupabaseMock(),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: {
        confirmed_by: 'Diego',
        evidence: {
          evidence_label: 'Foto obra lista',
          evidence_type: 'photo',
          external_reference: 'https://example.invalid/evidence',
          received_from: 'Cliente Prueba',
        },
        status: 'confirmed',
      },
      url: '/work-orders/work-order-1/readiness-checks/check-1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: {
        ...confirmedReadinessCheck,
        evidence: readinessEvidence,
      },
    });
  });

  it('does not return notes even when notes are saved', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, {
      supabaseClient: createReadinessPatchSupabaseMock({
        evidenceData: {
          ...readinessEvidence,
          notes: 'internal evidence notes',
        },
        updatedData: {
          ...confirmedReadinessCheck,
          notes: 'internal check notes',
        },
      }),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: {
        confirmed_by: 'Diego',
        evidence: {
          evidence_type: 'photo',
          notes: 'internal evidence notes',
        },
        notes: 'internal check notes',
        status: 'confirmed',
      },
      url: '/work-orders/work-order-1/readiness-checks/check-1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).not.toContain('notes');
  });

  it('creates readiness_check_evidence when evidence is provided', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    let evidenceInsert: MockRecord | null = null;
    const app = await buildApp(config, {
      supabaseClient: createReadinessPatchSupabaseMock({
        onEvidenceInsert: (payload) => {
          evidenceInsert = payload;
        },
      }),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: {
        confirmed_by: 'Diego',
        evidence: {
          evidence_label: 'Foto obra lista',
          evidence_type: 'photo',
          external_reference: 'https://example.invalid/evidence',
          notes: 'internal evidence notes',
          received_from: 'Cliente Prueba',
        },
        status: 'confirmed',
      },
      url: '/work-orders/work-order-1/readiness-checks/check-1',
    });

    expect(response.statusCode).toBe(200);
    expect(evidenceInsert).toEqual({
      attachment_id: null,
      evidence_label: 'Foto obra lista',
      evidence_type: 'photo',
      external_reference: 'https://example.invalid/evidence',
      notes: 'internal evidence notes',
      readiness_check_id: 'check-1',
      received_from: 'Cliente Prueba',
    });
  });

  it('requires evidence to confirm a readiness check that blocks worker dispatch', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, {
      supabaseClient: createReadinessPatchSupabaseMock(),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: {
        confirmed_by: 'Diego',
        status: 'confirmed',
      },
      url: '/work-orders/work-order-1/readiness-checks/check-1',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'evidence_required_for_confirmation',
    });
  });

  it('returns 400 when work_order_id is invalid', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, { supabaseClient: null });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: { status: 'requested' },
      url: '/work-orders/%20/readiness-checks/check-1',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'invalid_work_order_id',
    });
  });

  it('returns 400 when checkId is invalid', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, { supabaseClient: null });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: { status: 'requested' },
      url: '/work-orders/work-order-1/readiness-checks/%20',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'invalid_readiness_check_id',
    });
  });

  it('returns 404 when the readiness check does not exist for the work order', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, {
      supabaseClient: createReadinessPatchSupabaseMock({ existingData: null }),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: { status: 'requested' },
      url: '/work-orders/work-order-1/readiness-checks/missing-check',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: 'readiness_check_not_found',
    });
  });

  it('returns 400 when status is invalid', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, {
      supabaseClient: createReadinessPatchSupabaseMock(),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: { status: 'done' },
      url: '/work-orders/work-order-1/readiness-checks/check-1',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'invalid_readiness_check_status',
    });
  });

  it('returns 503 when Supabase is not configured', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config);
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: { status: 'requested' },
      url: '/work-orders/work-order-1/readiness-checks/check-1',
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: 'supabase_not_configured',
    });
  });

  it('returns 503 when Supabase fails while updating the readiness check', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, {
      supabaseClient: createReadinessPatchSupabaseMock({
        updateError: { message: 'permission denied' },
        updatedData: null,
      }),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: {
        notes: 'Confirmed by photo',
        status: 'provided',
      },
      url: '/work-orders/work-order-1/readiness-checks/check-1',
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: 'readiness_check_update_failed',
    });
  });

  it('returns 503 when Supabase fails while creating evidence', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, {
      supabaseClient: createReadinessPatchSupabaseMock({
        evidenceData: null,
        evidenceError: { message: 'permission denied' },
      }),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: {
        confirmed_by: 'Diego',
        evidence: {
          evidence_type: 'photo',
        },
        status: 'confirmed',
      },
      url: '/work-orders/work-order-1/readiness-checks/check-1',
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: 'readiness_check_update_failed',
    });
  });
});

describe('PATCH /work-orders/:id/planning-alerts/:alertId', () => {
  type MockRecord = Record<string, unknown>;

  type PlanningAlertPatchMockOptions = {
    existingData?: MockRecord | null;
    existingError?: unknown;
    onUpdate?: (payload: MockRecord) => void;
    updatedData?: MockRecord | null;
    updateError?: unknown;
  };

  const existingPlanningAlert = {
    id: 'alert-1',
    work_order_id: 'work-order-1',
    alert_type: 'obra_no_lista',
    title: 'No enviar instaladores',
    message: 'Falta evidencia verificable de obra lista.',
    severity: 'high',
    status: 'open',
    generated_by: 'planning_ai',
    assigned_to: 'diego',
    acknowledged_by: null,
    acknowledged_at: null,
    resolved_at: null,
    created_at: '2026-07-01T12:00:00.000Z',
    updated_at: '2026-07-01T12:00:00.000Z',
  };

  function createPlanningAlertPatchSupabaseMock(
    options: PlanningAlertPatchMockOptions = {},
  ): SupabaseClient {
    const existingData = 'existingData' in options ? options.existingData : existingPlanningAlert;
    const existingError = options.existingError ?? null;
    const updatedData = 'updatedData' in options ? options.updatedData : existingPlanningAlert;
    const updateError = options.updateError ?? null;

    return {
      from: (table: string) => {
        if (table !== 'planning_alerts') {
          throw new Error(`Unexpected table: ${table}`);
        }

        return {
          select: () => {
            const selectChain = {
              eq: () => selectChain,
              maybeSingle: () => Promise.resolve({ data: existingData, error: existingError }),
            };

            return selectChain;
          },
          update: (payload: MockRecord) => {
            options.onUpdate?.(payload);

            const updateChain = {
              eq: () => updateChain,
              select: () => ({
                single: () => Promise.resolve({ data: updatedData, error: updateError }),
              }),
            };

            return updateChain;
          },
        };
      },
    } as unknown as SupabaseClient;
  }

  it('resolves a planning alert', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    let updatePayload: MockRecord | null = null;
    const resolvedAlert = {
      ...existingPlanningAlert,
      status: 'resolved',
      resolved_at: '2026-07-01T13:00:00.000Z',
      updated_at: '2026-07-01T13:00:00.000Z',
    };
    const app = await buildApp(config, {
      supabaseClient: createPlanningAlertPatchSupabaseMock({
        onUpdate: (payload) => {
          updatePayload = payload;
        },
        updatedData: resolvedAlert,
      }),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: {
        resolution_notes: 'Obra validada con evidencia.',
        status: 'resolved',
      },
      url: '/work-orders/work-order-1/planning-alerts/alert-1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: resolvedAlert,
    });
    expect(updatePayload).toMatchObject({
      status: 'resolved',
      resolution_notes: 'Obra validada con evidencia.',
    });
    expect(updatePayload).toHaveProperty('resolved_at');
  });

  it('sets acknowledged_at and acknowledged_by when acknowledging an alert', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    let updatePayload: MockRecord | null = null;
    const acknowledgedAlert = {
      ...existingPlanningAlert,
      status: 'acknowledged',
      acknowledged_by: 'Diego',
      acknowledged_at: '2026-07-01T13:00:00.000Z',
      updated_at: '2026-07-01T13:00:00.000Z',
    };
    const app = await buildApp(config, {
      supabaseClient: createPlanningAlertPatchSupabaseMock({
        onUpdate: (payload) => {
          updatePayload = payload;
        },
        updatedData: acknowledgedAlert,
      }),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: {
        acknowledged_by: 'Diego',
        status: 'acknowledged',
      },
      url: '/work-orders/work-order-1/planning-alerts/alert-1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: acknowledgedAlert,
    });
    expect(updatePayload).toMatchObject({
      acknowledged_by: 'Diego',
      status: 'acknowledged',
    });
    expect(updatePayload).toHaveProperty('acknowledged_at');
  });

  it('sets resolved_at when marking an alert as false positive', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    let updatePayload: MockRecord | null = null;
    const app = await buildApp(config, {
      supabaseClient: createPlanningAlertPatchSupabaseMock({
        onUpdate: (payload) => {
          updatePayload = payload;
        },
        updatedData: {
          ...existingPlanningAlert,
          status: 'false_positive',
          resolved_at: '2026-07-01T13:00:00.000Z',
        },
      }),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: { status: 'false_positive' },
      url: '/work-orders/work-order-1/planning-alerts/alert-1',
    });

    expect(response.statusCode).toBe(200);
    expect(updatePayload).toMatchObject({ status: 'false_positive' });
    expect(updatePayload).toHaveProperty('resolved_at');
  });

  it('sets resolved_at when cancelling an alert', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    let updatePayload: MockRecord | null = null;
    const app = await buildApp(config, {
      supabaseClient: createPlanningAlertPatchSupabaseMock({
        onUpdate: (payload) => {
          updatePayload = payload;
        },
        updatedData: {
          ...existingPlanningAlert,
          status: 'cancelled',
          resolved_at: '2026-07-01T13:00:00.000Z',
        },
      }),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: { status: 'cancelled' },
      url: '/work-orders/work-order-1/planning-alerts/alert-1',
    });

    expect(response.statusCode).toBe(200);
    expect(updatePayload).toMatchObject({ status: 'cancelled' });
    expect(updatePayload).toHaveProperty('resolved_at');
  });

  it('does not return resolution_notes even when they are saved', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, {
      supabaseClient: createPlanningAlertPatchSupabaseMock({
        updatedData: {
          ...existingPlanningAlert,
          resolution_notes: 'internal resolution notes',
          status: 'resolved',
        },
      }),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: {
        resolution_notes: 'internal resolution notes',
        status: 'resolved',
      },
      url: '/work-orders/work-order-1/planning-alerts/alert-1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).not.toContain('resolution_notes');
  });

  it('returns 400 when work_order_id is invalid', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, { supabaseClient: null });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: { status: 'resolved' },
      url: '/work-orders/%20/planning-alerts/alert-1',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'invalid_work_order_id',
    });
  });

  it('returns 400 when alertId is invalid', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, { supabaseClient: null });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: { status: 'resolved' },
      url: '/work-orders/work-order-1/planning-alerts/%20',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'invalid_planning_alert_id',
    });
  });

  it('returns 400 when status is invalid', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, {
      supabaseClient: createPlanningAlertPatchSupabaseMock(),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: { status: 'open' },
      url: '/work-orders/work-order-1/planning-alerts/alert-1',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'invalid_planning_alert_status',
    });
  });

  it('returns 404 when the planning alert does not exist for the work order', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, {
      supabaseClient: createPlanningAlertPatchSupabaseMock({ existingData: null }),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: { status: 'resolved' },
      url: '/work-orders/work-order-1/planning-alerts/missing-alert',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: 'planning_alert_not_found',
    });
  });

  it('returns 503 when Supabase is not configured', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config);
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: { status: 'resolved' },
      url: '/work-orders/work-order-1/planning-alerts/alert-1',
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: 'supabase_not_configured',
    });
  });

  it('returns 503 when Supabase fails while updating the planning alert', async () => {
    const config = loadConfig({ APP_ENV: 'test' });
    const app = await buildApp(config, {
      supabaseClient: createPlanningAlertPatchSupabaseMock({
        updatedData: null,
        updateError: { message: 'permission denied' },
      }),
    });
    apps.push(app);

    const response = await app.inject({
      method: 'PATCH',
      payload: { status: 'resolved' },
      url: '/work-orders/work-order-1/planning-alerts/alert-1',
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: 'planning_alert_update_failed',
    });
  });
});
