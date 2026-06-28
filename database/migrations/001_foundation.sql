-- Rubik OS - Sprint 2 foundation.
-- Safe to run before the core data migrations. It does not modify data.

create extension if not exists pgcrypto;

create sequence if not exists public.personas_codigo_seq
  as bigint
  start with 1
  increment by 1
  no minvalue
  no maxvalue
  cache 1;

create sequence if not exists public.ordenes_trabajo_codigo_seq
  as bigint
  start with 1
  increment by 1
  no minvalue
  no maxvalue
  cache 1;

create sequence if not exists public.tareas_codigo_seq
  as bigint
  start with 1
  increment by 1
  no minvalue
  no maxvalue
  cache 1;

create or replace function public.generar_codigo_humano(
  p_prefijo text,
  p_secuencia regclass
)
returns text
language sql
volatile
as $$
  select p_prefijo || '-' || lpad(nextval(p_secuencia)::text, 6, '0');
$$;

create or replace function public.set_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

comment on sequence public.personas_codigo_seq is
  'Sequence used to generate human readable PER codes.';
comment on sequence public.ordenes_trabajo_codigo_seq is
  'Sequence used to generate human readable OT codes.';
comment on sequence public.tareas_codigo_seq is
  'Sequence used to generate human readable TAR codes.';

comment on function public.generar_codigo_humano(text, regclass) is
  'Generates human readable codes such as PER-000001, OT-000001 and TAR-000001.';
comment on function public.set_actualizado_en() is
  'Reusable trigger function that refreshes actualizado_en on row updates.';
