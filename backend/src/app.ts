import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';

import type { AppConfig } from './config.js';
import { createSupabaseAdminClient } from './supabase.js';

export async function buildApp(config: AppConfig): Promise<FastifyInstance> {
  const app = Fastify({
    logger: config.APP_ENV !== 'test',
  });
  const supabase = createSupabaseAdminClient(config);

  await app.register(cors, {
    origin: config.FRONTEND_ORIGIN,
  });

  app.get('/health', () => ({
    service: 'rubik-os-backend',
    status: 'ok',
    supabase: supabase === null ? 'not_configured' : 'configured',
  }));

  return app;
}
