-- Rubik OS - Quote status legacy compatibility.
-- Keeps all known quote status values valid before any future normalization.
-- This migration does not rewrite existing quote rows.

alter table if exists public.quotes
  drop constraint if exists quotes_status_check;

do $$
begin
  if to_regclass('public.quotes') is not null
    and not exists (
      select 1
      from pg_constraint
      where conrelid = 'public.quotes'::regclass
        and conname = 'quotes_status_check'
    )
  then
    alter table public.quotes
      add constraint quotes_status_check check (
        status in (
          'borrador',
          'tentativo',
          'esperando_revision_diego',
          'aprobado_por_diego',
          'enviado_cliente',
          'aceptado_cliente',
          'rechazado_cliente',
          'vencido',
          'requiere_actualizacion',
          'confirmado',
          'enviada_cliente',
          'vencida',
          'rechazada',
          'preliminar',
          'pendiente_validacion_diego',
          'validada',
          'señada',
          'seÃ±ada',
          'convertida_en_proyecto'
        )
      ) not valid;
  end if;
end;
$$;

comment on constraint quotes_status_check on public.quotes is
  'Temporary compatibility check that permits new Rubik OS statuses plus all known legacy quote statuses. A future normalization migration should narrow this list.';
