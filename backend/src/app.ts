import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { AppConfig } from './config.js';
import { registerClientRoutes } from './modules/clients/routes.js';
import { createSupabaseAdminClient } from './supabase.js';

type AppDependencies = {
  supabaseClient?: SupabaseClient | null;
};

export async function buildApp(
  config: AppConfig,
  dependencies: AppDependencies = {},
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: config.APP_ENV !== 'test',
  });
  const supabase =
    'supabaseClient' in dependencies
      ? dependencies.supabaseClient
      : createSupabaseAdminClient(config);

  await app.register(cors, {
    origin: config.FRONTEND_ORIGIN,
  });

  app.get('/health', () => ({
    service: 'rubik-os-backend',
    status: 'ok',
    supabase: supabase === null ? 'not_configured' : 'configured',
  }));

  app.get('/health/supabase', async (_request, reply) => {
    if (supabase === null) {
      return reply.code(503).send({
        service: 'rubik-os-backend',
        status: 'not_configured',
        supabase: 'not_configured',
      });
    }

    const { count, error } = await supabase
      .from('ai_agents')
      .select('code', { count: 'exact', head: true });

    if (error !== null) {
      return reply.code(503).send({
        service: 'rubik-os-backend',
        status: 'error',
        supabase: 'query_failed',
        table: 'ai_agents',
      });
    }

    return {
      service: 'rubik-os-backend',
      status: 'ok',
      supabase: 'connected',
      table: 'ai_agents',
      count,
    };
  });

  await registerClientRoutes(app, supabase);

  return app;
}
