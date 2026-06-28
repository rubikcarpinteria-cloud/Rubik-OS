-- Rubik OS - Core data model smoke test.
-- Run after applying migrations in a disposable database or Supabase SQL editor.

do $$
declare
  v_table text;
begin
  for v_table in
    select unnest(
      array[
        'personas',
        'ordenes_trabajo',
        'tareas',
        'historial_eventos',
        'archivos'
      ]
    )
  loop
    if to_regclass('public.' || v_table) is null then
      raise exception 'Missing expected table: public.%', v_table;
    end if;
  end loop;
end;
$$;

do $$
declare
  v_missing_relation text;
begin
  select expected.constraint_name
  into v_missing_relation
  from (
    values
      ('ordenes_trabajo_persona_id_fkey', 'ordenes_trabajo'),
      ('ordenes_trabajo_orden_padre_id_fkey', 'ordenes_trabajo'),
      ('tareas_orden_trabajo_id_fkey', 'tareas'),
      ('historial_eventos_orden_trabajo_id_fkey', 'historial_eventos'),
      ('archivos_orden_trabajo_id_fkey', 'archivos'),
      ('archivos_tarea_id_fkey', 'archivos')
  ) as expected(constraint_name, table_name)
  where not exists (
    select 1
    from pg_constraint
    where conname = expected.constraint_name
      and conrelid = ('public.' || expected.table_name)::regclass
      and contype = 'f'
  )
  order by expected.constraint_name
  limit 1;

  if v_missing_relation is not null then
    raise exception 'Missing expected relation: %', v_missing_relation;
  end if;
end;
$$;

with expected_tables(table_name) as (
  values
    ('personas'),
    ('ordenes_trabajo'),
    ('tareas'),
    ('historial_eventos'),
    ('archivos')
)
select
  table_name,
  to_regclass('public.' || table_name) is not null as exists_in_public_schema
from expected_tables
order by table_name;

with expected_relations(constraint_name, table_name) as (
  values
    ('ordenes_trabajo_persona_id_fkey', 'ordenes_trabajo'),
    ('ordenes_trabajo_orden_padre_id_fkey', 'ordenes_trabajo'),
    ('tareas_orden_trabajo_id_fkey', 'tareas'),
    ('historial_eventos_orden_trabajo_id_fkey', 'historial_eventos'),
    ('archivos_orden_trabajo_id_fkey', 'archivos'),
    ('archivos_tarea_id_fkey', 'archivos')
)
select
  expected_relations.constraint_name,
  expected_relations.table_name,
  exists (
    select 1
    from pg_constraint
    where conname = expected_relations.constraint_name
      and conrelid = ('public.' || expected_relations.table_name)::regclass
      and contype = 'f'
  ) as relation_exists
from expected_relations
order by expected_relations.table_name, expected_relations.constraint_name;
