-- Rubik OS - planning alerts resolution compatibility.
-- Adds backend-managed resolution metadata for planning alerts.
-- Keeps in_progress temporarily for legacy compatibility while new code uses investigating.

alter table public.planning_alerts
  add column if not exists acknowledged_by text;

alter table public.planning_alerts
  add column if not exists acknowledged_at timestamptz;

alter table public.planning_alerts
  add column if not exists resolution_notes text;

alter table public.planning_alerts
  drop constraint if exists planning_alerts_status_check;

alter table public.planning_alerts
  add constraint planning_alerts_status_check check (
    status in (
      'open',
      'acknowledged',
      'investigating',
      'resolved',
      'false_positive',
      'cancelled',
      'in_progress'
    )
  ) not valid;

comment on column public.planning_alerts.acknowledged_by is
  'Actor that acknowledged a planning alert. Added for backend alert-resolution workflows.';

comment on column public.planning_alerts.acknowledged_at is
  'Timestamp when a planning alert was acknowledged.';

comment on column public.planning_alerts.resolution_notes is
  'Internal resolution notes for planning alerts. Not exposed in public backend responses.';

comment on constraint planning_alerts_status_check on public.planning_alerts is
  'Allows current alert workflow states. in_progress is kept temporarily for legacy compatibility.';
