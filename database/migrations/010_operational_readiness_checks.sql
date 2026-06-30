-- Rubik OS - AI agents and operational readiness checks.
-- Adds evidence-based readiness gates before critical operational progress.
-- This migration only creates schema, seeds agent codes and enables RLS.

create table if not exists public.ai_agents (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  requires_human_approval boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.ai_agents (code, name, description, requires_human_approval)
values
  ('sales_ai', 'Sales AI', 'Conversational intake agent for sales channels.', false),
  ('design_ai', 'Design AI', 'Mini proposal, approximate render and technical view agent.', true),
  ('pricing_ai', 'Pricing AI', 'Tentative pricing and quote preparation agent.', true),
  ('supplier_ai', 'Supplier AI', 'Supplier, lumberyard and material coordination agent.', false),
  ('planning_ai', 'Planning AI', 'Planning, agenda, capacity and cross-project coordination agent.', true),
  ('operational_control_ai', 'Operational Control AI', 'Transversal readiness and evidence control agent.', true),
  ('post_sale_ai', 'Post Sale AI', 'Post-sale, warranty and claim follow-up agent.', false)
on conflict (code) do nothing;

create table if not exists public.operational_readiness_checks (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  check_type text not null,
  title text not null,
  description text,
  status text not null default 'pending',
  required_evidence_type text,
  responsible_party text,
  requested_by_agent text references public.ai_agents(code),
  confirmed_by text,
  confirmed_at timestamptz,
  expires_at timestamptz,
  blocks_next_stage boolean not null default true,
  blocks_worker_dispatch boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint operational_readiness_checks_check_type_check check (
    check_type in (
      'material_delivery_promised',
      'material_delivery_confirmed',
      'delivery_document_received',
      'unloading_completed',
      'material_distributed_by_unit',
      'site_ready_for_installation',
      'site_access_confirmed',
      'client_confirmation_received',
      'supplier_confirmation_received',
      'diego_approval_received',
      'installer_availability_confirmed',
      'payment_or_deposit_confirmed',
      'other'
    )
  ),
  constraint operational_readiness_checks_status_check check (
    status in (
      'pending',
      'requested',
      'provided',
      'confirmed',
      'rejected',
      'expired',
      'not_applicable',
      'cancelled'
    )
  ),
  constraint operational_readiness_checks_responsible_party_check check (
    responsible_party is null
    or responsible_party in (
      'client',
      'constructora',
      'supplier',
      'diego',
      'installer',
      'rubik_team',
      'third_party',
      'system'
    )
  ),
  constraint operational_readiness_checks_required_evidence_type_check check (
    required_evidence_type is null
    or required_evidence_type in (
      'remito',
      'delivery_document',
      'photo',
      'video',
      'signed_checklist',
      'message_confirmation',
      'mixed',
      'none'
    )
  )
);

create table if not exists public.readiness_check_evidence (
  id uuid primary key default gen_random_uuid(),
  readiness_check_id uuid not null references public.operational_readiness_checks(id) on delete cascade,
  attachment_id uuid references public.attachments(id) on delete set null,
  evidence_type text not null,
  evidence_label text,
  external_reference text,
  received_from text,
  received_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  constraint readiness_check_evidence_evidence_type_check check (
    evidence_type in (
      'remito',
      'delivery_document',
      'photo',
      'video',
      'signed_checklist',
      'message',
      'other'
    )
  )
);

create index if not exists ai_agents_code_idx
  on public.ai_agents(code);
create index if not exists ai_agents_is_active_idx
  on public.ai_agents(is_active);

create index if not exists operational_readiness_checks_work_order_id_idx
  on public.operational_readiness_checks(work_order_id);
create index if not exists operational_readiness_checks_status_idx
  on public.operational_readiness_checks(status);
create index if not exists operational_readiness_checks_check_type_idx
  on public.operational_readiness_checks(check_type);
create index if not exists operational_readiness_checks_blocks_worker_dispatch_idx
  on public.operational_readiness_checks(blocks_worker_dispatch);
create index if not exists operational_readiness_checks_responsible_party_idx
  on public.operational_readiness_checks(responsible_party);
create index if not exists operational_readiness_checks_expires_at_idx
  on public.operational_readiness_checks(expires_at);

create index if not exists readiness_check_evidence_readiness_check_id_idx
  on public.readiness_check_evidence(readiness_check_id);
create index if not exists readiness_check_evidence_attachment_id_idx
  on public.readiness_check_evidence(attachment_id);
create index if not exists readiness_check_evidence_evidence_type_idx
  on public.readiness_check_evidence(evidence_type);
create index if not exists readiness_check_evidence_received_at_idx
  on public.readiness_check_evidence(received_at);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.ai_agents'::regclass
      and tgname = 'ai_agents_set_updated_at'
  ) then
    create trigger ai_agents_set_updated_at
      before update on public.ai_agents
      for each row
      execute function public.set_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.operational_readiness_checks'::regclass
      and tgname = 'operational_readiness_checks_set_updated_at'
  ) then
    create trigger operational_readiness_checks_set_updated_at
      before update on public.operational_readiness_checks
      for each row
      execute function public.set_updated_at();
  end if;
end;
$$;

alter table if exists public.ai_agents enable row level security;
alter table if exists public.operational_readiness_checks enable row level security;
alter table if exists public.readiness_check_evidence enable row level security;

comment on table public.ai_agents is
  'Registry of specialized Rubik OS AI agents.';
comment on table public.operational_readiness_checks is
  'Evidence-based readiness checks that can block the next stage or worker dispatch.';
comment on table public.readiness_check_evidence is
  'Evidence records linked to operational readiness checks.';
comment on column public.operational_readiness_checks.blocks_worker_dispatch is
  'When true, worker dispatch should remain blocked unless status is confirmed or not_applicable.';
comment on column public.operational_readiness_checks.requested_by_agent is
  'AI agent code that requested the readiness check.';
