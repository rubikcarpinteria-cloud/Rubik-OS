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
