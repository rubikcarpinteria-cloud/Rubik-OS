import type { FastifyInstance } from 'fastify';
import type { SupabaseClient } from '@supabase/supabase-js';

import { listWorkOrders } from './workOrderRepository.js';
import type { WorkOrderFilters } from './types.js';

const DEFAULT_WORK_ORDERS_LIMIT = 25;
const MAX_WORK_ORDERS_LIMIT = 100;

type WorkOrdersQuerystring = {
  client_id?: string;
  limit?: string;
  status?: string;
};

function resolveWorkOrdersLimit(limit: string | undefined): number {
  if (limit === undefined) {
    return DEFAULT_WORK_ORDERS_LIMIT;
  }

  const parsedLimit = Number(limit);

  if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
    return DEFAULT_WORK_ORDERS_LIMIT;
  }

  return Math.min(parsedLimit, MAX_WORK_ORDERS_LIMIT);
}

function resolveOptionalFilter(value: string | undefined): string | null {
  if (value === undefined || value.trim().length === 0) {
    return null;
  }

  return value;
}

export async function registerWorkOrderRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient | null,
): Promise<void> {
  app.get<{ Querystring: WorkOrdersQuerystring }>('/work-orders', async (request, reply) => {
    if (supabase === null) {
      return reply.code(503).send({
        error: 'supabase_not_configured',
      });
    }

    const limit = resolveWorkOrdersLimit(request.query.limit);
    const filters: WorkOrderFilters = {
      client_id: resolveOptionalFilter(request.query.client_id),
      status: resolveOptionalFilter(request.query.status),
    };
    const { data, error } = await listWorkOrders(supabase, limit, filters);

    if (error !== null) {
      return reply.code(503).send({
        error: 'work_orders_query_failed',
      });
    }

    return {
      data,
      meta: {
        limit,
        status: filters.status,
        client_id: filters.client_id,
      },
    };
  });
}
