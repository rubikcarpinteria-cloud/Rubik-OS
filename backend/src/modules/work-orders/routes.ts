import type { FastifyInstance } from 'fastify';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import {
  getReadinessCheckForWorkOrder,
  hasEnoughConfirmationEvidence,
  updateReadinessCheck,
} from './readinessCheckRepository.js';
import { getWorkOrderById, listWorkOrders } from './workOrderRepository.js';
import type { WorkOrderFilters } from './types.js';

const DEFAULT_WORK_ORDERS_LIMIT = 25;
const MAX_WORK_ORDERS_LIMIT = 100;

type WorkOrdersQuerystring = {
  client_id?: string;
  limit?: string;
  status?: string;
};

type WorkOrderParams = {
  id: string;
};

type ReadinessCheckParams = WorkOrderParams & {
  checkId: string;
};

const readinessCheckStatuses = [
  'requested',
  'provided',
  'confirmed',
  'rejected',
  'expired',
  'not_applicable',
  'cancelled',
] as const;

const readinessCheckEvidenceTypes = [
  'remito',
  'delivery_document',
  'photo',
  'video',
  'signed_checklist',
  'message',
  'other',
] as const;

const readinessCheckUpdateSchema = z.strictObject({
  confirmed_by: z.string().optional(),
  evidence: z
    .strictObject({
      evidence_label: z.string().optional(),
      evidence_type: z.enum(readinessCheckEvidenceTypes),
      external_reference: z.string().optional(),
      notes: z.string().optional(),
      received_from: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional(),
  status: z.enum(readinessCheckStatuses),
});

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

function isValidWorkOrderId(id: string): boolean {
  return id.trim().length > 0;
}

function isValidReadinessCheckId(id: string): boolean {
  return id.trim().length > 0;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasValidReadinessCheckStatus(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    readinessCheckStatuses.includes(value as (typeof readinessCheckStatuses)[number])
  );
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

  app.get<{ Params: WorkOrderParams }>('/work-orders/:id', async (request, reply) => {
    if (!isValidWorkOrderId(request.params.id)) {
      return reply.code(400).send({
        error: 'invalid_work_order_id',
      });
    }

    if (supabase === null) {
      return reply.code(503).send({
        error: 'supabase_not_configured',
      });
    }

    const { data, error } = await getWorkOrderById(supabase, request.params.id);

    if (error !== null) {
      return reply.code(503).send({
        error: 'work_order_query_failed',
      });
    }

    if (data === null) {
      return reply.code(404).send({
        error: 'work_order_not_found',
      });
    }

    return {
      data,
    };
  });

  app.patch<{ Body: unknown; Params: ReadinessCheckParams }>(
    '/work-orders/:id/readiness-checks/:checkId',
    async (request, reply) => {
      if (!isValidWorkOrderId(request.params.id)) {
        return reply.code(400).send({
          error: 'invalid_work_order_id',
        });
      }

      if (!isValidReadinessCheckId(request.params.checkId)) {
        return reply.code(400).send({
          error: 'invalid_readiness_check_id',
        });
      }

      if (supabase === null) {
        return reply.code(503).send({
          error: 'supabase_not_configured',
        });
      }

      if (!isObject(request.body)) {
        return reply.code(400).send({
          error: 'invalid_readiness_check_payload',
        });
      }

      if (!hasValidReadinessCheckStatus(request.body.status)) {
        return reply.code(400).send({
          error: 'invalid_readiness_check_status',
        });
      }

      const parsedBody = readinessCheckUpdateSchema.safeParse(request.body);

      if (!parsedBody.success) {
        return reply.code(400).send({
          error: 'invalid_readiness_check_payload',
        });
      }

      const existingCheck = await getReadinessCheckForWorkOrder(
        supabase,
        request.params.id,
        request.params.checkId,
      );

      if (existingCheck.error !== null) {
        return reply.code(503).send({
          error: 'readiness_check_update_failed',
        });
      }

      if (existingCheck.data === null) {
        return reply.code(404).send({
          error: 'readiness_check_not_found',
        });
      }

      if (
        parsedBody.data.status === 'confirmed' &&
        existingCheck.data.blocks_worker_dispatch &&
        !hasEnoughConfirmationEvidence(parsedBody.data)
      ) {
        return reply.code(400).send({
          error: 'evidence_required_for_confirmation',
        });
      }

      const updateResult = await updateReadinessCheck(supabase, existingCheck.data, parsedBody.data);

      if (updateResult.error !== null || updateResult.data === null) {
        return reply.code(503).send({
          error: 'readiness_check_update_failed',
        });
      }

      return {
        data: updateResult.data,
      };
    },
  );
}
