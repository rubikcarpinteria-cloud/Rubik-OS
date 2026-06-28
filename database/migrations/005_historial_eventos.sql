-- Rubik OS - Event history.
-- Records important operational events around a work order.

create table if not exists public.historial_eventos (
  id uuid default gen_random_uuid(),
  orden_trabajo_id uuid references public.ordenes_trabajo(id),
  persona_id uuid references public.personas(id),
  tipo_evento text not null,
  titulo text not null,
  descripcion text,
  metadata jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  eliminado_en timestamptz,
  constraint historial_eventos_pkey primary key (id)
);

alter table public.historial_eventos
  add column if not exists id uuid default gen_random_uuid();
alter table public.historial_eventos
  add column if not exists orden_trabajo_id uuid references public.ordenes_trabajo(id);
alter table public.historial_eventos
  add column if not exists persona_id uuid references public.personas(id);
alter table public.historial_eventos
  add column if not exists tipo_evento text;
alter table public.historial_eventos
  add column if not exists titulo text;
alter table public.historial_eventos
  add column if not exists descripcion text;
alter table public.historial_eventos
  add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.historial_eventos
  add column if not exists creado_en timestamptz default now();
alter table public.historial_eventos
  add column if not exists actualizado_en timestamptz default now();
alter table public.historial_eventos
  add column if not exists eliminado_en timestamptz;

alter table public.historial_eventos
  alter column id set default gen_random_uuid();
alter table public.historial_eventos
  alter column metadata set default '{}'::jsonb;
alter table public.historial_eventos
  alter column creado_en set default now();
alter table public.historial_eventos
  alter column actualizado_en set default now();

update public.historial_eventos
set
  id = gen_random_uuid()
where id is null;

update public.historial_eventos
set
  metadata = '{}'::jsonb
where metadata is null;

update public.historial_eventos
set
  creado_en = now()
where creado_en is null;

update public.historial_eventos
set
  actualizado_en = now()
where actualizado_en is null;

alter table public.historial_eventos
  alter column id set not null;
alter table public.historial_eventos
  alter column tipo_evento set not null;
alter table public.historial_eventos
  alter column titulo set not null;
alter table public.historial_eventos
  alter column metadata set not null;
alter table public.historial_eventos
  alter column creado_en set not null;
alter table public.historial_eventos
  alter column actualizado_en set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.historial_eventos'::regclass
      and contype = 'p'
  ) then
    alter table public.historial_eventos
      add constraint historial_eventos_pkey primary key (id);
  end if;
end;
$$;

create index if not exists historial_eventos_orden_trabajo_id_idx
  on public.historial_eventos(orden_trabajo_id);
create index if not exists historial_eventos_persona_id_idx
  on public.historial_eventos(persona_id);
create index if not exists historial_eventos_metadata_gin_idx
  on public.historial_eventos using gin (metadata);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.historial_eventos'::regclass
      and tgname = 'historial_eventos_set_actualizado_en'
  ) then
    create trigger historial_eventos_set_actualizado_en
      before update on public.historial_eventos
      for each row
      execute function public.set_actualizado_en();
  end if;
end;
$$;

comment on table public.historial_eventos is
  'Operational event history for work orders and related people.';
comment on column public.historial_eventos.id is 'Internal UUID primary key.';
comment on column public.historial_eventos.orden_trabajo_id is 'Related work order.';
comment on column public.historial_eventos.persona_id is 'Related person, if any.';
comment on column public.historial_eventos.tipo_evento is 'Machine readable event type.';
comment on column public.historial_eventos.titulo is 'Human readable event title.';
comment on column public.historial_eventos.descripcion is 'Event details.';
comment on column public.historial_eventos.metadata is 'Structured event metadata.';
comment on column public.historial_eventos.creado_en is 'Creation timestamp.';
comment on column public.historial_eventos.actualizado_en is 'Last update timestamp maintained by trigger.';
comment on column public.historial_eventos.eliminado_en is 'Soft delete timestamp; null means active.';
