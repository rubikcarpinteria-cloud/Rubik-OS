import { afterEach, describe, expect, it } from 'vitest';

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
