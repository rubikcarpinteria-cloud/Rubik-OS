import type { FastifyInstance } from 'fastify';
import type { SupabaseClient } from '@supabase/supabase-js';

import { listClients } from './clientRepository.js';

const DEFAULT_CLIENTS_LIMIT = 25;
const MAX_CLIENTS_LIMIT = 100;

type ClientsQuerystring = {
  limit?: string;
};

function resolveClientsLimit(limit: string | undefined): number {
  if (limit === undefined) {
    return DEFAULT_CLIENTS_LIMIT;
  }

  const parsedLimit = Number(limit);

  if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
    return DEFAULT_CLIENTS_LIMIT;
  }

  return Math.min(parsedLimit, MAX_CLIENTS_LIMIT);
}

export async function registerClientRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient | null,
): Promise<void> {
  app.get<{ Querystring: ClientsQuerystring }>('/clients', async (request, reply) => {
    if (supabase === null) {
      return reply.code(503).send({
        error: 'supabase_not_configured',
      });
    }

    const limit = resolveClientsLimit(request.query.limit);
    const { data, error } = await listClients(supabase, limit);

    if (error !== null) {
      return reply.code(503).send({
        error: 'clients_query_failed',
      });
    }

    return {
      data,
      meta: {
        limit,
      },
    };
  });
}
