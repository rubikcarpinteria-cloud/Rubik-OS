-- Rubik OS - Files.
-- Registers metadata for photos, audio, PDFs, plans, PolyBoard files and more.

create table if not exists public.archivos (
  id uuid default gen_random_uuid(),
  orden_trabajo_id uuid references public.ordenes_trabajo(id),
  persona_id uuid references public.personas(id),
  tarea_id uuid references public.tareas(id),
  tipo_archivo text not null,
  nombre_archivo text not null,
  url_archivo text,
  storage_path text,
  mime_type text,
  tamano_bytes bigint,
  metadata jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  eliminado_en timestamptz,
  constraint archivos_pkey primary key (id),
  constraint archivos_tipo_archivo_check check (
    tipo_archivo in (
      'foto',
      'audio',
      'video',
      'pdf',
      'plano',
      'polyboard',
      'excel',
      'documento',
      'otro'
    )
  ),
  constraint archivos_tamano_bytes_check check (
    tamano_bytes is null
    or tamano_bytes >= 0
  )
);

alter table public.archivos
  add column if not exists id uuid default gen_random_uuid();
alter table public.archivos
  add column if not exists orden_trabajo_id uuid references public.ordenes_trabajo(id);
alter table public.archivos
  add column if not exists persona_id uuid references public.personas(id);
alter table public.archivos
  add column if not exists tarea_id uuid references public.tareas(id);
alter table public.archivos
  add column if not exists tipo_archivo text;
alter table public.archivos
  add column if not exists nombre_archivo text;
alter table public.archivos
  add column if not exists url_archivo text;
alter table public.archivos
  add column if not exists storage_path text;
alter table public.archivos
  add column if not exists mime_type text;
alter table public.archivos
  add column if not exists tamano_bytes bigint;
alter table public.archivos
  add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.archivos
  add column if not exists creado_en timestamptz default now();
alter table public.archivos
  add column if not exists actualizado_en timestamptz default now();
alter table public.archivos
  add column if not exists eliminado_en timestamptz;

alter table public.archivos
  alter column id set default gen_random_uuid();
alter table public.archivos
  alter column metadata set default '{}'::jsonb;
alter table public.archivos
  alter column creado_en set default now();
alter table public.archivos
  alter column actualizado_en set default now();

update public.archivos
set
  id = gen_random_uuid()
where id is null;

update public.archivos
set
  metadata = '{}'::jsonb
where metadata is null;

update public.archivos
set
  creado_en = now()
where creado_en is null;

update public.archivos
set
  actualizado_en = now()
where actualizado_en is null;

alter table public.archivos
  alter column id set not null;
alter table public.archivos
  alter column tipo_archivo set not null;
alter table public.archivos
  alter column nombre_archivo set not null;
alter table public.archivos
  alter column metadata set not null;
alter table public.archivos
  alter column creado_en set not null;
alter table public.archivos
  alter column actualizado_en set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.archivos'::regclass
      and contype = 'p'
  ) then
    alter table public.archivos
      add constraint archivos_pkey primary key (id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.archivos'::regclass
      and conname = 'archivos_tipo_archivo_check'
  ) then
    alter table public.archivos
      add constraint archivos_tipo_archivo_check check (
        tipo_archivo in (
          'foto',
          'audio',
          'video',
          'pdf',
          'plano',
          'polyboard',
          'excel',
          'documento',
          'otro'
        )
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.archivos'::regclass
      and conname = 'archivos_tamano_bytes_check'
  ) then
    alter table public.archivos
      add constraint archivos_tamano_bytes_check check (
        tamano_bytes is null
        or tamano_bytes >= 0
      ) not valid;
  end if;
end;
$$;

alter table public.archivos validate constraint archivos_tipo_archivo_check;
alter table public.archivos validate constraint archivos_tamano_bytes_check;

create index if not exists archivos_orden_trabajo_id_idx
  on public.archivos(orden_trabajo_id);
create index if not exists archivos_persona_id_idx
  on public.archivos(persona_id);
create index if not exists archivos_tarea_id_idx
  on public.archivos(tarea_id);
create index if not exists archivos_metadata_gin_idx
  on public.archivos using gin (metadata);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.archivos'::regclass
      and tgname = 'archivos_set_actualizado_en'
  ) then
    create trigger archivos_set_actualizado_en
      before update on public.archivos
      for each row
      execute function public.set_actualizado_en();
  end if;
end;
$$;

comment on table public.archivos is
  'Metadata registry for operational files linked to people, orders and tasks.';
comment on column public.archivos.id is 'Internal UUID primary key.';
comment on column public.archivos.orden_trabajo_id is 'Related work order.';
comment on column public.archivos.persona_id is 'Related person, if any.';
comment on column public.archivos.tarea_id is 'Related task, if any.';
comment on column public.archivos.tipo_archivo is 'Business file type.';
comment on column public.archivos.nombre_archivo is 'Original or display file name.';
comment on column public.archivos.url_archivo is 'External URL when a file is not stored in Supabase Storage.';
comment on column public.archivos.storage_path is 'Storage path for Supabase Storage or future storage providers.';
comment on column public.archivos.mime_type is 'Detected MIME type.';
comment on column public.archivos.tamano_bytes is 'File size in bytes.';
comment on column public.archivos.metadata is 'Structured file metadata.';
comment on column public.archivos.creado_en is 'Creation timestamp.';
comment on column public.archivos.actualizado_en is 'Last update timestamp maintained by trigger.';
comment on column public.archivos.eliminado_en is 'Soft delete timestamp; null means active.';
