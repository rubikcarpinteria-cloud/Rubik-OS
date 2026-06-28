-- Rubik OS - Work orders.
-- Work orders are the center of the operational data model.

create table if not exists public.ordenes_trabajo (
  id uuid default gen_random_uuid(),
  codigo text not null default public.generar_codigo_humano(
    'OT',
    'public.ordenes_trabajo_codigo_seq'::regclass
  ),
  persona_id uuid references public.personas(id),
  orden_padre_id uuid references public.ordenes_trabajo(id),
  titulo text not null,
  descripcion text,
  tipo_trabajo text not null default 'otro',
  estado text not null default 'nuevo',
  prioridad text not null default 'media',
  origen text,
  responsable_actual_persona_id uuid references public.personas(id),
  fecha_entrega_estimada date,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  eliminado_en timestamptz,
  constraint ordenes_trabajo_pkey primary key (id),
  constraint ordenes_trabajo_codigo_key unique (codigo),
  constraint ordenes_trabajo_no_self_parent_check check (
    orden_padre_id is null
    or orden_padre_id <> id
  ),
  constraint ordenes_trabajo_tipo_trabajo_check check (
    tipo_trabajo in (
      'fabricacion_instalacion',
      'solo_fabricacion',
      'solo_instalacion',
      'obra',
      'service',
      'visita_tecnica',
      'presupuesto',
      'otro'
    )
  ),
  constraint ordenes_trabajo_estado_check check (
    estado in (
      'nuevo',
      'esperando_informacion',
      'pendiente_validacion',
      'diseno',
      'presupuesto',
      'aprobado',
      'esperando_corte',
      'en_produccion',
      'armado',
      'esperando_instalacion',
      'instalado',
      'finalizado',
      'cancelado',
      'bloqueado'
    )
  ),
  constraint ordenes_trabajo_prioridad_check check (
    prioridad in ('baja', 'media', 'alta', 'critica')
  )
);

alter table public.ordenes_trabajo
  add column if not exists id uuid default gen_random_uuid();
alter table public.ordenes_trabajo
  add column if not exists codigo text;
alter table public.ordenes_trabajo
  add column if not exists persona_id uuid references public.personas(id);
alter table public.ordenes_trabajo
  add column if not exists orden_padre_id uuid references public.ordenes_trabajo(id);
alter table public.ordenes_trabajo
  add column if not exists titulo text;
alter table public.ordenes_trabajo
  add column if not exists descripcion text;
alter table public.ordenes_trabajo
  add column if not exists tipo_trabajo text default 'otro';
alter table public.ordenes_trabajo
  add column if not exists estado text default 'nuevo';
alter table public.ordenes_trabajo
  add column if not exists prioridad text default 'media';
alter table public.ordenes_trabajo
  add column if not exists origen text;
alter table public.ordenes_trabajo
  add column if not exists responsable_actual_persona_id uuid references public.personas(id);
alter table public.ordenes_trabajo
  add column if not exists fecha_entrega_estimada date;
alter table public.ordenes_trabajo
  add column if not exists creado_en timestamptz default now();
alter table public.ordenes_trabajo
  add column if not exists actualizado_en timestamptz default now();
alter table public.ordenes_trabajo
  add column if not exists eliminado_en timestamptz;

alter table public.ordenes_trabajo
  alter column id set default gen_random_uuid();
alter table public.ordenes_trabajo
  alter column codigo set default public.generar_codigo_humano(
    'OT',
    'public.ordenes_trabajo_codigo_seq'::regclass
  );
alter table public.ordenes_trabajo
  alter column tipo_trabajo set default 'otro';
alter table public.ordenes_trabajo
  alter column estado set default 'nuevo';
alter table public.ordenes_trabajo
  alter column prioridad set default 'media';
alter table public.ordenes_trabajo
  alter column creado_en set default now();
alter table public.ordenes_trabajo
  alter column actualizado_en set default now();

update public.ordenes_trabajo
set
  id = gen_random_uuid()
where id is null;

update public.ordenes_trabajo
set
  tipo_trabajo = 'otro'
where tipo_trabajo is null
  or btrim(tipo_trabajo) = '';

update public.ordenes_trabajo
set
  estado = 'nuevo'
where estado is null
  or btrim(estado) = '';

update public.ordenes_trabajo
set
  prioridad = 'media'
where prioridad is null
  or btrim(prioridad) = '';

update public.ordenes_trabajo
set
  creado_en = now()
where creado_en is null;

update public.ordenes_trabajo
set
  actualizado_en = now()
where actualizado_en is null;

do $$
declare
  v_max_codigo bigint;
begin
  select max(substring(codigo from '^OT-([0-9]+)$')::bigint)
  into v_max_codigo
  from public.ordenes_trabajo
  where codigo ~ '^OT-[0-9]+$';

  if v_max_codigo is null then
    perform setval('public.ordenes_trabajo_codigo_seq'::regclass, 1, false);
  else
    perform setval('public.ordenes_trabajo_codigo_seq'::regclass, v_max_codigo, true);
  end if;
end;
$$;

update public.ordenes_trabajo
set
  codigo = public.generar_codigo_humano(
    'OT',
    'public.ordenes_trabajo_codigo_seq'::regclass
  )
where codigo is null
  or btrim(codigo) = '';

do $$
declare
  v_max_codigo bigint;
begin
  select max(substring(codigo from '^OT-([0-9]+)$')::bigint)
  into v_max_codigo
  from public.ordenes_trabajo
  where codigo ~ '^OT-[0-9]+$';

  if v_max_codigo is null then
    perform setval('public.ordenes_trabajo_codigo_seq'::regclass, 1, false);
  else
    perform setval('public.ordenes_trabajo_codigo_seq'::regclass, v_max_codigo, true);
  end if;
end;
$$;

alter table public.ordenes_trabajo
  alter column id set not null;
alter table public.ordenes_trabajo
  alter column codigo set not null;
alter table public.ordenes_trabajo
  alter column titulo set not null;
alter table public.ordenes_trabajo
  alter column tipo_trabajo set not null;
alter table public.ordenes_trabajo
  alter column estado set not null;
alter table public.ordenes_trabajo
  alter column prioridad set not null;
alter table public.ordenes_trabajo
  alter column creado_en set not null;
alter table public.ordenes_trabajo
  alter column actualizado_en set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ordenes_trabajo'::regclass
      and contype = 'p'
  ) then
    alter table public.ordenes_trabajo
      add constraint ordenes_trabajo_pkey primary key (id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ordenes_trabajo'::regclass
      and conname = 'ordenes_trabajo_codigo_key'
  ) then
    alter table public.ordenes_trabajo
      add constraint ordenes_trabajo_codigo_key unique (codigo);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ordenes_trabajo'::regclass
      and conname = 'ordenes_trabajo_no_self_parent_check'
  ) then
    alter table public.ordenes_trabajo
      add constraint ordenes_trabajo_no_self_parent_check check (
        orden_padre_id is null
        or orden_padre_id <> id
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ordenes_trabajo'::regclass
      and conname = 'ordenes_trabajo_tipo_trabajo_check'
  ) then
    alter table public.ordenes_trabajo
      add constraint ordenes_trabajo_tipo_trabajo_check check (
        tipo_trabajo in (
          'fabricacion_instalacion',
          'solo_fabricacion',
          'solo_instalacion',
          'obra',
          'service',
          'visita_tecnica',
          'presupuesto',
          'otro'
        )
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ordenes_trabajo'::regclass
      and conname = 'ordenes_trabajo_estado_check'
  ) then
    alter table public.ordenes_trabajo
      add constraint ordenes_trabajo_estado_check check (
        estado in (
          'nuevo',
          'esperando_informacion',
          'pendiente_validacion',
          'diseno',
          'presupuesto',
          'aprobado',
          'esperando_corte',
          'en_produccion',
          'armado',
          'esperando_instalacion',
          'instalado',
          'finalizado',
          'cancelado',
          'bloqueado'
        )
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ordenes_trabajo'::regclass
      and conname = 'ordenes_trabajo_prioridad_check'
  ) then
    alter table public.ordenes_trabajo
      add constraint ordenes_trabajo_prioridad_check check (
        prioridad in ('baja', 'media', 'alta', 'critica')
      ) not valid;
  end if;
end;
$$;

alter table public.ordenes_trabajo validate constraint ordenes_trabajo_no_self_parent_check;
alter table public.ordenes_trabajo validate constraint ordenes_trabajo_tipo_trabajo_check;
alter table public.ordenes_trabajo validate constraint ordenes_trabajo_estado_check;
alter table public.ordenes_trabajo validate constraint ordenes_trabajo_prioridad_check;

create index if not exists ordenes_trabajo_persona_id_idx
  on public.ordenes_trabajo(persona_id);
create index if not exists ordenes_trabajo_orden_padre_id_idx
  on public.ordenes_trabajo(orden_padre_id);
create index if not exists ordenes_trabajo_responsable_actual_persona_id_idx
  on public.ordenes_trabajo(responsable_actual_persona_id);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.ordenes_trabajo'::regclass
      and tgname = 'ordenes_trabajo_set_actualizado_en'
  ) then
    create trigger ordenes_trabajo_set_actualizado_en
      before update on public.ordenes_trabajo
      for each row
      execute function public.set_actualizado_en();
  end if;
end;
$$;

comment on table public.ordenes_trabajo is
  'Operational work orders. Supports parent and child orders for large jobs.';
comment on column public.ordenes_trabajo.id is 'Internal UUID primary key.';
comment on column public.ordenes_trabajo.codigo is 'Human readable code such as OT-000001.';
comment on column public.ordenes_trabajo.persona_id is 'Primary client, prospect or company linked to the order.';
comment on column public.ordenes_trabajo.orden_padre_id is 'Parent order for grouped work, departments, rooms or furniture.';
comment on column public.ordenes_trabajo.titulo is 'Short operational title.';
comment on column public.ordenes_trabajo.descripcion is 'Detailed operational description.';
comment on column public.ordenes_trabajo.tipo_trabajo is 'Initial classification of the work type.';
comment on column public.ordenes_trabajo.estado is 'Current workflow state.';
comment on column public.ordenes_trabajo.prioridad is 'Operational priority.';
comment on column public.ordenes_trabajo.origen is 'Source channel or business origin.';
comment on column public.ordenes_trabajo.responsable_actual_persona_id is 'Current responsible person.';
comment on column public.ordenes_trabajo.fecha_entrega_estimada is 'Estimated delivery date.';
comment on column public.ordenes_trabajo.creado_en is 'Creation timestamp.';
comment on column public.ordenes_trabajo.actualizado_en is 'Last update timestamp maintained by trigger.';
comment on column public.ordenes_trabajo.eliminado_en is 'Soft delete timestamp; null means active.';
