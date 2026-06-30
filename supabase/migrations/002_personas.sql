-- Rubik OS - Personas.
-- This migration protects an existing public.personas table. It only creates
-- missing structure, backfills missing codes and refuses unsafe states.

create table if not exists public.personas (
  id uuid default gen_random_uuid(),
  codigo text not null default public.generar_codigo_humano(
    'PER',
    'public.personas_codigo_seq'::regclass
  ),
  telefono text not null,
  nombre text,
  tipo text not null default 'cliente',
  estado text not null default 'prospecto',
  origen text not null default 'WhatsApp',
  email text,
  direccion text,
  ciudad text,
  provincia text,
  observaciones text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  eliminado_en timestamptz,
  constraint personas_pkey primary key (id),
  constraint personas_codigo_key unique (codigo),
  constraint personas_telefono_key unique (telefono),
  constraint personas_tipo_check check (
    tipo in (
      'prueba',
      'prospecto',
      'cliente',
      'empleado',
      'tercerizado',
      'proveedor',
      'empresa',
      'constructora',
      'arquitecto',
      'instalador',
      'maderera',
      'johnson',
      'otro'
    )
  ),
  constraint personas_estado_check check (
    estado in ('prospecto', 'activo', 'inactivo', 'archivado')
  )
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'personas'
      and column_name = 'id'
      and udt_name <> 'uuid'
  ) then
    raise exception 'public.personas.id must be uuid before applying Rubik OS migrations';
  end if;
end;
$$;

alter table public.personas
  add column if not exists id uuid default gen_random_uuid();
alter table public.personas
  add column if not exists codigo text;
alter table public.personas
  add column if not exists telefono text;
alter table public.personas
  add column if not exists nombre text;
alter table public.personas
  add column if not exists tipo text;
alter table public.personas
  add column if not exists estado text;
alter table public.personas
  add column if not exists origen text;
alter table public.personas
  add column if not exists email text;
alter table public.personas
  add column if not exists direccion text;
alter table public.personas
  add column if not exists ciudad text;
alter table public.personas
  add column if not exists provincia text;
alter table public.personas
  add column if not exists observaciones text;
alter table public.personas
  add column if not exists creado_en timestamptz default now();
alter table public.personas
  add column if not exists actualizado_en timestamptz default now();
alter table public.personas
  add column if not exists eliminado_en timestamptz;

alter table public.personas
  alter column id set default gen_random_uuid();
alter table public.personas
  alter column codigo set default public.generar_codigo_humano(
    'PER',
    'public.personas_codigo_seq'::regclass
  );
alter table public.personas
  alter column tipo set default 'cliente';
alter table public.personas
  alter column estado set default 'prospecto';
alter table public.personas
  alter column origen set default 'WhatsApp';
alter table public.personas
  alter column creado_en set default now();
alter table public.personas
  alter column actualizado_en set default now();

update public.personas
set
  id = gen_random_uuid()
where id is null;

update public.personas
set
  tipo = 'cliente'
where tipo is null
  or btrim(tipo) = '';

update public.personas
set
  estado = 'prospecto'
where estado is null
  or btrim(estado) = '';

update public.personas
set
  origen = 'WhatsApp'
where origen is null
  or btrim(origen) = '';

update public.personas
set
  creado_en = now()
where creado_en is null;

update public.personas
set
  actualizado_en = now()
where actualizado_en is null;

do $$
declare
  v_max_codigo bigint;
begin
  select max(substring(codigo from '^PER-([0-9]+)$')::bigint)
  into v_max_codigo
  from public.personas
  where codigo ~ '^PER-[0-9]+$';

  if v_max_codigo is null then
    perform setval('public.personas_codigo_seq'::regclass, 1, false);
  else
    perform setval('public.personas_codigo_seq'::regclass, v_max_codigo, true);
  end if;
end;
$$;

update public.personas
set
  codigo = public.generar_codigo_humano(
    'PER',
    'public.personas_codigo_seq'::regclass
  )
where codigo is null
  or btrim(codigo) = '';

do $$
declare
  v_max_codigo bigint;
begin
  select max(substring(codigo from '^PER-([0-9]+)$')::bigint)
  into v_max_codigo
  from public.personas
  where codigo ~ '^PER-[0-9]+$';

  if v_max_codigo is null then
    perform setval('public.personas_codigo_seq'::regclass, 1, false);
  else
    perform setval('public.personas_codigo_seq'::regclass, v_max_codigo, true);
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1
    from public.personas
    where telefono is null
      or btrim(telefono) = ''
  ) then
    raise exception 'public.personas.telefono has null or empty values; fill them before enforcing not null';
  end if;
end;
$$;

alter table public.personas
  alter column id set not null;
alter table public.personas
  alter column codigo set not null;
alter table public.personas
  alter column telefono set not null;
alter table public.personas
  alter column tipo set not null;
alter table public.personas
  alter column estado set not null;
alter table public.personas
  alter column origen set not null;
alter table public.personas
  alter column creado_en set not null;
alter table public.personas
  alter column actualizado_en set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.personas'::regclass
      and contype = 'p'
  ) then
    alter table public.personas
      add constraint personas_pkey primary key (id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.personas'::regclass
      and conname = 'personas_codigo_key'
  ) then
    alter table public.personas
      add constraint personas_codigo_key unique (codigo);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.personas'::regclass
      and conname = 'personas_telefono_key'
  ) then
    alter table public.personas
      add constraint personas_telefono_key unique (telefono);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.personas'::regclass
      and conname = 'personas_tipo_check'
  ) then
    alter table public.personas
      add constraint personas_tipo_check check (
        tipo in (
          'prueba',
          'prospecto',
          'cliente',
          'empleado',
          'tercerizado',
          'proveedor',
          'empresa',
          'constructora',
          'arquitecto',
          'instalador',
          'maderera',
          'johnson',
          'otro'
        )
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.personas'::regclass
      and conname = 'personas_estado_check'
  ) then
    alter table public.personas
      add constraint personas_estado_check check (
        estado in ('prospecto', 'activo', 'inactivo', 'archivado')
      ) not valid;
  end if;
end;
$$;

alter table public.personas validate constraint personas_tipo_check;
alter table public.personas validate constraint personas_estado_check;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.personas'::regclass
      and tgname = 'personas_set_actualizado_en'
  ) then
    create trigger personas_set_actualizado_en
      before update on public.personas
      for each row
      execute function public.set_actualizado_en();
  end if;
end;
$$;

comment on table public.personas is
  'Unified directory for clients, prospects, employees, suppliers and companies.';
comment on column public.personas.id is 'Internal UUID primary key.';
comment on column public.personas.codigo is 'Human readable code such as PER-000001.';
comment on column public.personas.telefono is 'Unique phone number used as the initial operational identifier.';
comment on column public.personas.nombre is 'Display name of the person or company.';
comment on column public.personas.tipo is 'Business category of the record.';
comment on column public.personas.estado is 'Lifecycle status of the record.';
comment on column public.personas.origen is 'Source channel where the record was created.';
comment on column public.personas.email is 'Optional email address.';
comment on column public.personas.direccion is 'Optional street address.';
comment on column public.personas.ciudad is 'Optional city.';
comment on column public.personas.provincia is 'Optional province.';
comment on column public.personas.observaciones is 'Operational notes.';
comment on column public.personas.creado_en is 'Creation timestamp.';
comment on column public.personas.actualizado_en is 'Last update timestamp maintained by trigger.';
comment on column public.personas.eliminado_en is 'Soft delete timestamp; null means active.';
