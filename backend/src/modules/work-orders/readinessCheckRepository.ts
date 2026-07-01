import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  OperationalReadinessCheckUpdate,
  ReadinessCheckEvidenceInput,
  ReadinessCheckEvidenceSummary,
  ReadinessCheckUpdateInput,
} from './types.js';

const READINESS_CHECK_UPDATE_COLUMNS =
  'id, work_order_id, check_type, title, description, status, required_evidence_type, responsible_party, requested_by_agent, confirmed_by, confirmed_at, expires_at, blocks_next_stage, blocks_worker_dispatch, created_at, updated_at';
const READINESS_CHECK_EVIDENCE_COLUMNS =
  'id, evidence_type, evidence_label, external_reference, received_from, received_at';

type ReadinessCheckRecord = Omit<OperationalReadinessCheckUpdate, 'evidence'>;

function toSafeReadinessCheck(
  check: ReadinessCheckRecord,
  evidence: ReadinessCheckEvidenceSummary | null,
): OperationalReadinessCheckUpdate {
  return {
    id: check.id,
    work_order_id: check.work_order_id,
    check_type: check.check_type,
    title: check.title,
    description: check.description,
    status: check.status,
    required_evidence_type: check.required_evidence_type,
    responsible_party: check.responsible_party,
    requested_by_agent: check.requested_by_agent,
    confirmed_by: check.confirmed_by,
    confirmed_at: check.confirmed_at,
    expires_at: check.expires_at,
    blocks_next_stage: check.blocks_next_stage,
    blocks_worker_dispatch: check.blocks_worker_dispatch,
    created_at: check.created_at,
    updated_at: check.updated_at,
    evidence,
  };
}

function toSafeEvidence(evidence: ReadinessCheckEvidenceSummary): ReadinessCheckEvidenceSummary {
  return {
    id: evidence.id,
    evidence_type: evidence.evidence_type,
    evidence_label: evidence.evidence_label,
    external_reference: evidence.external_reference,
    received_from: evidence.received_from,
    received_at: evidence.received_at,
  };
}

function hasText(value: string | undefined): boolean {
  return value !== undefined && value.trim().length > 0;
}

export function hasEnoughConfirmationEvidence(input: ReadinessCheckUpdateInput): boolean {
  return input.evidence !== undefined || (hasText(input.confirmed_by) && hasText(input.notes));
}

export async function getReadinessCheckForWorkOrder(
  supabase: SupabaseClient,
  workOrderId: string,
  checkId: string,
): Promise<{ data: ReadinessCheckRecord | null; error: unknown }> {
  const { data, error } = await supabase
    .from('operational_readiness_checks')
    .select(READINESS_CHECK_UPDATE_COLUMNS)
    .eq('id', checkId)
    .eq('work_order_id', workOrderId)
    .maybeSingle();

  return {
    data: data ?? null,
    error,
  };
}

export async function updateReadinessCheck(
  supabase: SupabaseClient,
  check: ReadinessCheckRecord,
  input: ReadinessCheckUpdateInput,
): Promise<{ data: OperationalReadinessCheckUpdate | null; error: unknown }> {
  const patch: Record<string, string> = {
    status: input.status,
  };

  if (input.notes !== undefined) {
    patch.notes = input.notes;
  }

  if (input.status === 'confirmed') {
    patch.confirmed_at = new Date().toISOString();

    if (input.confirmed_by !== undefined) {
      patch.confirmed_by = input.confirmed_by;
    }
  }

  const { data: updatedCheck, error: updateError } = await supabase
    .from('operational_readiness_checks')
    .update(patch)
    .eq('id', check.id)
    .eq('work_order_id', check.work_order_id)
    .select(READINESS_CHECK_UPDATE_COLUMNS)
    .single();

  if (updateError !== null || updatedCheck === null) {
    return {
      data: null,
      error: updateError,
    };
  }

  if (input.evidence === undefined) {
    return {
      data: toSafeReadinessCheck(updatedCheck, null),
      error: null,
    };
  }

  const evidenceInput = toEvidenceInsert(check.id, input.evidence);
  const { data: evidence, error: evidenceError } = await supabase
    .from('readiness_check_evidence')
    .insert(evidenceInput)
    .select(READINESS_CHECK_EVIDENCE_COLUMNS)
    .single();

  return {
    data:
      evidenceError === null && evidence !== null
        ? toSafeReadinessCheck(updatedCheck, toSafeEvidence(evidence))
        : null,
    error: evidenceError,
  };
}

function toEvidenceInsert(
  readinessCheckId: string,
  evidence: ReadinessCheckEvidenceInput,
): Record<string, string | null> {
  return {
    attachment_id: null,
    evidence_label: evidence.evidence_label ?? null,
    evidence_type: evidence.evidence_type,
    external_reference: evidence.external_reference ?? null,
    notes: evidence.notes ?? null,
    readiness_check_id: readinessCheckId,
    received_from: evidence.received_from ?? null,
  };
}
