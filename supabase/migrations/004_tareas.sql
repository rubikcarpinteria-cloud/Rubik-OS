-- Rubik OS - Tasks.
-- Tasks make each work order executable by workflow steps.

create table if not exists public.tareas (
  id uuid default gen_random_uuid(),
  codigo text not null default public.generar_codigo_humano(
    'TAR',
    'public.tareas_codigo_seq'::regclass
  ),
  orden_trabajo_id uuid not null references public.ordenes_trabajo(id),
  titulo text not null,
  descripcion text,
  estado text not null default 'pendiente',
  prioridad text not null default 'media',
  asignado_a_persona_id uuid references public.personas(id),
  fecha_limite timestamptz,
  completado_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  eliminado_en timestamptz,
  constraint tareas_pkey primary key (id),
  constraint tareas_codigo_key unique (codigo),
  constraint tareas_estado_check check (
    estado in ('pendiente', 'en_progreso', 'bloqueada', 'completada', 'cancelada')
  ),
  constraint tareas_prioridad_check check (
    prioridad in ('baja', 'media', 'alta', 'critica')
  )
);

alter table public.tareas
  add column if not exists id uuid default gen_random_uuid();
alter table public.tareas
  add column if not exists codigo text;
alter table public.tareas
  add column if not exists orden_trabajo_id uuid references public.ordenes_trabajo(id);
alter table public.tareas
  add column if not exists titulo text;
alter table public.tareas
  add column if not exists descripcion text;
alter table public.tareas
  add column if not exists estado text default 'pendiente';
alter table public.tareas
  add column if not exists prioridad text default 'media';
alter table public.tareas
  add column if not exists asignado_a_persona_id uuid references public.personas(id);
alter table public.tareas
  add column if not exists fecha_limite timestamptz;
alter table public.tareas
  add column if not exists completado_en timestamptz;
alter table public.tareas
  add column if not exists creado_en timestamptz default now();
alter table public.tareas
  add column if not exists actualizado_en timestamptz default now();
alter table public.tareas
  add column if not exists eliminado_en timestamptz;

alter table public.tareas
  alter column id set default gen_random_uuid();
alter table public.tareas
  alter column codigo set default public.generar_codigo_humano(
    'TAR',
    'public.tareas_codigo_seq'::regclass
  );
alter table public.tareas
  alter column estado set default 'pendiente';
alter table public.tareas
  alter column prioridad set default 'media';
alter table public.tareas
  alter column creado_en set default now();
alter table public.tareas
  alter column actualizado_en set default now();

update public.tareas
set
  id = gen_random_uuid()
where id is null;

update public.tareas
set
  estado = 'pendiente'
where estado is null
  or btrim(estado) = '';

update public.tareas
set
  prioridad = 'media'
where prioridad is null
  or btrim(prioridad) = '';

update public.tareas
set
  creado_en = now()
where creado_en is null;

update public.tareas
set
  actualizado_en = now()
where actualizado_en is null;

do $$
declare
  v_max_codigo bigint;
begin
  select max(substring(codigo from '^TAR-([0-9]+)$')::bigint)
  into v_max_codigo
  from public.tareas
  where codigo ~ '^TAR-[0-9]+$';

  if v_max_codigo is null then
    perform setval('public.tareas_codigo_seq'::regclass, 1, false);
  else
    perform setval('public.tareas_codigo_seq'::regclass, v_max_codigo, true);
  end if;
end;
$$;

update public.tareas
set
  codigo = public.generar_codigo_humano(
    'TAR',
    'public.tareas_codigo_seq'::regclass
  )
where codigo is null
  or btrim(codigo) = '';

do $$
declare
  v_max_codigo bigint;
begin
  select max(substring(codigo from '^TAR-([0-9]+)$')::bigint)
  into v_max_codigo
  from public.tareas
  where codigo ~ '^TAR-[0-9]+$';

  if v_max_codigo is null then
    perform setval('public.tareas_codigo_seq'::regclass, 1, false);
  else
    perform setval('public.tareas_codigo_seq'::regclass, v_max_codigo, true);
  end if;
end;
$$;

alter table public.tareas
  alter column id set not null;
alter table public.tareas
  alter column codigo set not null;
alter table public.tareas
  alter column orden_trabajo_id set not null;
alter table public.tareas
  alter column titulo set not null;
alter table public.tareas
  alter column estado set not null;
alter table public.tareas
  alter column prioridad set not null;
alter table public.tareas
  alter column creado_en set not null;
alter table public.tareas
  alter column actualizado_en set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tareas'::regclass
      and contype = 'p'
  ) then
    alter table public.tareas
      add constraint tareas_pkey primary key (id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tareas'::regclass
      and conname = 'tareas_codigo_key'
  ) then
    alter table public.tareas
      add constraint tareas_codigo_key unique (codigo);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tareas'::regclass
      and conname = 'tareas_estado_check'
  ) then
    alter table public.tareas
      add constraint tareas_estado_check check (
        estado in ('pendiente', 'en_progreso', 'bloqueada', 'completada', 'cancelada')
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tareas'::regclass
      and conname = 'tareas_prioridad_check'
  ) then
    alter table public.tareas
      add constraint tareas_prioridad_check check (
        prioridad in ('baja', 'media', 'alta', 'critica')
      ) not valid;
  end if;
end;
$$;

alter table public.tareas validate constraint tareas_estado_check;
alter table public.tareas validate constraint tareas_prioridad_check;

create index if not exists tareas_orden_trabajo_id_idx
  on public.tareas(orden_trabajo_id);
create index if not exists tareas_asignado_a_persona_id_idx
  on public.tareas(asignado_a_persona_id);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.tareas'::regclass
      and tgname = 'tareas_set_actualizado_en'
  ) then
    create trigger tareas_set_actualizado_en
      before update on public.tareas
      for each row
      execute function public.set_actualizado_en();
  end if;
end;
$$;

comment on table public.tareas is
  'Workflow tasks linked to work orders.';
comment on column public.tareas.id is 'Internal UUID primary key.';
comment on column public.tareas.codigo is 'Human readable code such as TAR-000001.';
comment on column public.tareas.orden_trabajo_id is 'Work order that owns the task.';
comment on column public.tareas.titulo is 'Short task title.';
comment on column public.tareas.descripcion is 'Detailed task description.';
comment on column public.tareas.estado is 'Task workflow state.';
comment on column public.tareas.prioridad is 'Task priority.';
comment on column public.tareas.asignado_a_persona_id is 'Person assigned to the task.';
comment on column public.tareas.fecha_limite is 'Optional task deadline.';
comment on column public.tareas.completado_en is 'Completion timestamp.';
comment on column public.tareas.creado_en is 'Creation timestamp.';
comment on column public.tareas.actualizado_en is 'Last update timestamp maintained by trigger.';
comment on column public.tareas.eliminado_en is 'Soft delete timestamp; null means active.';
