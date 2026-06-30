-- Rubik OS - Privacy, audit and security monitoring.
-- Adds privacy request tracking, access audit logs and security alarms.
-- This migration only creates schema, seeds security_ai and enables RLS.

create table if not exists public.privacy_consents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  work_order_id uuid references public.work_orders(id) on delete set null,
  consent_type text not null,
  status text not null default 'informed',
  channel text,
  notice_text text,
  accepted_at timestamptz,
  revoked_at timestamptz,
  evidence_attachment_id uuid references public.attachments(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint privacy_consents_consent_type_check check (
    consent_type in ('privacy_notice', 'data_processing', 'media_files', 'ai_processing', 'marketing', 'other')
  ),
  constraint privacy_consents_status_check check (
    status in ('informed', 'accepted', 'revoked', 'not_required')
  )
);

create table if not exists public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  request_type text not null,
  status text not null default 'open',
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  requested_channel text,
  requested_by text,
  assigned_to text,
  resolution_notes text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint privacy_requests_request_type_check check (
    request_type in ('access', 'correction', 'deletion', 'export', 'objection', 'consent_revocation', 'other')
  ),
  constraint privacy_requests_status_check check (
    status in ('open', 'in_review', 'resolved', 'rejected', 'cancelled')
  )
);

create table if not exists public.data_access_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null,
  actor_id text,
  actor_name text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  work_order_id uuid references public.work_orders(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  metadata jsonb,
  ip_address text,
  user_agent text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint data_access_audit_log_actor_type_check check (
    actor_type in (
      'user',
      'system',
      'sales_ai',
      'design_ai',
      'pricing_ai',
      'supplier_ai',
      'planning_ai',
      'operational_control_ai',
      'post_sale_ai',
      'security_ai',
      'integration',
      'service_role'
    )
  ),
  constraint data_access_audit_log_action_check check (
    action in (
      'view',
      'create',
      'update',
      'delete',
      'export',
      'download',
      'login',
      'login_failed',
      'permission_change',
      'api_key_use',
      'other'
    )
  ),
  constraint data_access_audit_log_entity_type_check check (
    entity_type in (
      'client',
      'work_order',
      'message',
      'attachment',
      'quote',
      'payment',
      'design',
      'privacy_request',
      'security_event',
      'other'
    )
  )
);

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  severity text not null default 'medium',
  source text,
  actor_type text,
  actor_id text,
  actor_name text,
  client_id uuid references public.clients(id) on delete set null,
  work_order_id uuid references public.work_orders(id) on delete set null,
  ip_address text,
  user_agent text,
  description text,
  metadata jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint security_events_event_type_check check (
    event_type in (
      'login_failed',
      'login_success_new_device',
      'access_denied',
      'suspicious_access',
      'mass_download',
      'mass_query',
      'mass_update',
      'permission_changed',
      'api_key_used',
      'api_key_rotated',
      'secret_exposed',
      'file_access_denied',
      'external_integration_error',
      'rls_violation',
      'other'
    )
  ),
  constraint security_events_severity_check check (
    severity in ('low', 'medium', 'high', 'critical')
  )
);

create table if not exists public.security_alerts (
  id uuid primary key default gen_random_uuid(),
  security_event_id uuid references public.security_events(id) on delete set null,
  alert_type text not null,
  severity text not null default 'medium',
  status text not null default 'open',
  title text not null,
  message text not null,
  assigned_to text,
  acknowledged_by text,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint security_alerts_alert_type_check check (
    alert_type in (
      'suspicious_login',
      'access_denied_repeated',
      'mass_download',
      'mass_query',
      'permission_change',
      'api_key_anomaly',
      'possible_data_breach',
      'external_service_anomaly',
      'other'
    )
  ),
  constraint security_alerts_severity_check check (
    severity in ('low', 'medium', 'high', 'critical')
  ),
  constraint security_alerts_status_check check (
    status in ('open', 'acknowledged', 'investigating', 'resolved', 'false_positive', 'cancelled')
  )
);

create table if not exists public.security_incidents (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid references public.security_alerts(id) on delete set null,
  title text not null,
  description text,
  severity text not null default 'high',
  status text not null default 'open',
  detected_at timestamptz not null default now(),
  contained_at timestamptz,
  resolved_at timestamptz,
  data_compromised boolean,
  affected_clients_count integer,
  affected_records_count integer,
  actions_taken text,
  root_cause text,
  lessons_learned text,
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint security_incidents_severity_check check (
    severity in ('low', 'medium', 'high', 'critical')
  ),
  constraint security_incidents_status_check check (
    status in ('open', 'investigating', 'contained', 'resolved', 'closed', 'false_alarm')
  ),
  constraint security_incidents_affected_clients_count_check check (
    affected_clients_count is null or affected_clients_count >= 0
  ),
  constraint security_incidents_affected_records_count_check check (
    affected_records_count is null or affected_records_count >= 0
  )
);

insert into public.ai_agents (code, name, description, requires_human_approval)
values (
  'security_ai',
  'Security AI',
  'Security monitoring agent for suspicious access, audit events and incident alerts.',
  true
)
on conflict (code) do nothing;

create index if not exists privacy_consents_client_id_idx on public.privacy_consents(client_id);
create index if not exists privacy_consents_work_order_id_idx on public.privacy_consents(work_order_id);
create index if not exists privacy_consents_status_idx on public.privacy_consents(status);
create index if not exists privacy_consents_consent_type_idx on public.privacy_consents(consent_type);

create index if not exists privacy_requests_client_id_idx on public.privacy_requests(client_id);
create index if not exists privacy_requests_status_idx on public.privacy_requests(status);
create index if not exists privacy_requests_request_type_idx on public.privacy_requests(request_type);
create index if not exists privacy_requests_requested_at_idx on public.privacy_requests(requested_at);

create index if not exists data_access_audit_log_client_id_idx on public.data_access_audit_log(client_id);
create index if not exists data_access_audit_log_work_order_id_idx on public.data_access_audit_log(work_order_id);
create index if not exists data_access_audit_log_occurred_at_idx on public.data_access_audit_log(occurred_at);
create index if not exists data_access_audit_log_actor_type_idx on public.data_access_audit_log(actor_type);
create index if not exists data_access_audit_log_entity_type_action_idx on public.data_access_audit_log(entity_type, action);

create index if not exists security_events_client_id_idx on public.security_events(client_id);
create index if not exists security_events_work_order_id_idx on public.security_events(work_order_id);
create index if not exists security_events_occurred_at_idx on public.security_events(occurred_at);
create index if not exists security_events_severity_idx on public.security_events(severity);
create index if not exists security_events_event_type_idx on public.security_events(event_type);
create index if not exists security_events_actor_type_idx on public.security_events(actor_type);

create index if not exists security_alerts_security_event_id_idx on public.security_alerts(security_event_id);
create index if not exists security_alerts_severity_status_idx on public.security_alerts(severity, status);
create index if not exists security_alerts_alert_type_idx on public.security_alerts(alert_type);
create index if not exists security_alerts_created_at_idx on public.security_alerts(created_at);

create index if not exists security_incidents_alert_id_idx on public.security_incidents(alert_id);
create index if not exists security_incidents_severity_status_idx on public.security_incidents(severity, status);
create index if not exists security_incidents_detected_at_idx on public.security_incidents(detected_at);

alter table if exists public.privacy_consents enable row level security;
alter table if exists public.privacy_requests enable row level security;
alter table if exists public.data_access_audit_log enable row level security;
alter table if exists public.security_events enable row level security;
alter table if exists public.security_alerts enable row level security;
alter table if exists public.security_incidents enable row level security;

comment on table public.privacy_consents is
  'Privacy notices and consent records linked to clients and work orders.';
comment on table public.privacy_requests is
  'Client requests to access, correct, delete, export or object to personal data processing.';
comment on table public.data_access_audit_log is
  'Audit log for access and changes to personal, commercial or security-relevant data.';
comment on table public.security_events is
  'Raw or normalized security events detected by system, integrations or security_ai.';
comment on table public.security_alerts is
  'Security alerts generated from suspicious events.';
comment on table public.security_incidents is
  'Investigated or confirmed security incidents.';
