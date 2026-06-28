-- Rubik OS - Demo seed data.
-- Idempotent, non-sensitive records for development and smoke checks.

insert into public.personas (
  id,
  codigo,
  telefono,
  nombre,
  tipo,
  estado,
  origen,
  email,
  ciudad,
  provincia,
  observaciones
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'PER-900001',
    '+540000000001',
    'Diego Demo',
    'empleado',
    'activo',
    'seed',
    'diego.demo@example.invalid',
    'Demo',
    'Demo',
    'Demo employee for local testing.'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'PER-900002',
    '+540000000002',
    'Joel Demo',
    'empleado',
    'activo',
    'seed',
    'joel.demo@example.invalid',
    'Demo',
    'Demo',
    'Demo employee for local testing.'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'PER-900003',
    '+540000000003',
    'Daniel Demo',
    'tercerizado',
    'activo',
    'seed',
    'daniel.demo@example.invalid',
    'Demo',
    'Demo',
    'Demo third-party installer for local testing.'
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'PER-900004',
    '+540000000004',
    'Johnson Demo',
    'empresa',
    'activo',
    'seed',
    'johnson.demo@example.invalid',
    'Demo',
    'Demo',
    'Demo company for local testing.'
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'PER-900005',
    '+540000000005',
    'Persona Prueba',
    'prueba',
    'prospecto',
    'seed',
    'persona.prueba@example.invalid',
    'Demo',
    'Demo',
    'Safe test person. Not real customer data.'
  )
on conflict (telefono) do update
set
  codigo = excluded.codigo,
  nombre = excluded.nombre,
  tipo = excluded.tipo,
  estado = excluded.estado,
  origen = excluded.origen,
  email = excluded.email,
  ciudad = excluded.ciudad,
  provincia = excluded.provincia,
  observaciones = excluded.observaciones;

insert into public.ordenes_trabajo (
  id,
  codigo,
  persona_id,
  titulo,
  descripcion,
  tipo_trabajo,
  estado,
  prioridad,
  origen,
  responsable_actual_persona_id,
  fecha_entrega_estimada
)
select
  '20000000-0000-4000-8000-000000000001'::uuid,
  'OT-900001',
  cliente.id,
  'Orden demo cocina',
  'Orden de trabajo de prueba para validar el nucleo de datos.',
  'fabricacion_instalacion',
  'nuevo',
  'media',
  'seed',
  responsable.id,
  current_date + 30
from public.personas as cliente
cross join public.personas as responsable
where cliente.telefono = '+540000000005'
  and responsable.telefono = '+540000000001'
on conflict (codigo) do update
set
  persona_id = excluded.persona_id,
  titulo = excluded.titulo,
  descripcion = excluded.descripcion,
  tipo_trabajo = excluded.tipo_trabajo,
  estado = excluded.estado,
  prioridad = excluded.prioridad,
  origen = excluded.origen,
  responsable_actual_persona_id = excluded.responsable_actual_persona_id,
  fecha_entrega_estimada = excluded.fecha_entrega_estimada;

with orden_demo as (
  select id
  from public.ordenes_trabajo
  where codigo = 'OT-900001'
),
tareas_demo as (
  select *
  from (
    values
      (
        '30000000-0000-4000-8000-000000000001'::uuid,
        'TAR-900001',
        'Relevar medidas demo',
        'Validar medidas iniciales para la orden demo.',
        'pendiente',
        'media',
        '+540000000001'
      ),
      (
        '30000000-0000-4000-8000-000000000002'::uuid,
        'TAR-900002',
        'Preparar presupuesto demo',
        'Armar presupuesto de prueba sin datos sensibles.',
        'pendiente',
        'media',
        '+540000000002'
      ),
      (
        '30000000-0000-4000-8000-000000000003'::uuid,
        'TAR-900003',
        'Coordinar instalacion demo',
        'Tarea de prueba para validar asignacion tercerizada.',
        'pendiente',
        'baja',
        '+540000000003'
      )
  ) as datos(
    id,
    codigo,
    titulo,
    descripcion,
    estado,
    prioridad,
    telefono_asignado
  )
)
insert into public.tareas (
  id,
  codigo,
  orden_trabajo_id,
  titulo,
  descripcion,
  estado,
  prioridad,
  asignado_a_persona_id
)
select
  tareas_demo.id,
  tareas_demo.codigo,
  orden_demo.id,
  tareas_demo.titulo,
  tareas_demo.descripcion,
  tareas_demo.estado,
  tareas_demo.prioridad,
  asignado.id
from tareas_demo
cross join orden_demo
left join public.personas as asignado
  on asignado.telefono = tareas_demo.telefono_asignado
on conflict (codigo) do update
set
  orden_trabajo_id = excluded.orden_trabajo_id,
  titulo = excluded.titulo,
  descripcion = excluded.descripcion,
  estado = excluded.estado,
  prioridad = excluded.prioridad,
  asignado_a_persona_id = excluded.asignado_a_persona_id;

with orden_demo as (
  select id
  from public.ordenes_trabajo
  where codigo = 'OT-900001'
),
persona_demo as (
  select id
  from public.personas
  where telefono = '+540000000005'
),
eventos_demo as (
  select *
  from (
    values
      (
        '40000000-0000-4000-8000-000000000001'::uuid,
        'orden_creada',
        'Orden demo creada',
        'Evento de prueba para validar historial.',
        '{"source":"seed"}'::jsonb
      ),
      (
        '40000000-0000-4000-8000-000000000002'::uuid,
        'tarea_creada',
        'Tareas demo creadas',
        'Evento de prueba para validar relacion de tareas.',
        '{"source":"seed","count":3}'::jsonb
      )
  ) as datos(id, tipo_evento, titulo, descripcion, metadata)
)
insert into public.historial_eventos (
  id,
  orden_trabajo_id,
  persona_id,
  tipo_evento,
  titulo,
  descripcion,
  metadata
)
select
  eventos_demo.id,
  orden_demo.id,
  persona_demo.id,
  eventos_demo.tipo_evento,
  eventos_demo.titulo,
  eventos_demo.descripcion,
  eventos_demo.metadata
from eventos_demo
cross join orden_demo
cross join persona_demo
on conflict (id) do update
set
  orden_trabajo_id = excluded.orden_trabajo_id,
  persona_id = excluded.persona_id,
  tipo_evento = excluded.tipo_evento,
  titulo = excluded.titulo,
  descripcion = excluded.descripcion,
  metadata = excluded.metadata;
