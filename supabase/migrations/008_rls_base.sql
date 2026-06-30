-- Rubik OS - Base Row Level Security.
-- RLS is enabled from the beginning. User-facing policies are intentionally
-- deferred to a later sprint. Initial access should go through the backend
-- using Supabase service_role credentials.

alter table public.personas enable row level security;
alter table public.ordenes_trabajo enable row level security;
alter table public.tareas enable row level security;
alter table public.historial_eventos enable row level security;
alter table public.archivos enable row level security;

comment on table public.personas is
  'Unified directory for clients, prospects, employees, suppliers and companies. RLS is enabled; initial access is through backend/service_role.';
comment on table public.ordenes_trabajo is
  'Operational work orders. RLS is enabled; user policies will be defined in a later sprint.';
comment on table public.tareas is
  'Workflow tasks linked to work orders. RLS is enabled; user policies will be defined in a later sprint.';
comment on table public.historial_eventos is
  'Operational event history. RLS is enabled; user policies will be defined in a later sprint.';
comment on table public.archivos is
  'Operational file metadata. RLS is enabled; user policies will be defined in a later sprint.';
