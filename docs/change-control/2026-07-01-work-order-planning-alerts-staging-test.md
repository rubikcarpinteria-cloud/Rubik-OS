# Work order planning alerts staging test - Rubik OS

## Fecha

2026-07-01

## Entorno

- Repo local: `D:\RubikOS`
- Supabase project: `rubik-os-staging`
- Project ref: `uqdyknsvvqutuefixgmb`
- Uso: staging / prueba, no produccion
- Backend local: `http://127.0.0.1:3001`

## Contexto

Despues de implementar y pushear `7ff5d5d backend: include planning alerts in work order detail`, se valido que `GET /work-orders/:id` puede devolver `planning_alerts` asociadas a una orden.

## Work order de prueba

- `work_order_id: f801a28e-7aea-4346-badf-2992513c32e5`
- `title: Prueba staging - bajo mesada`

## Alerta de prueba creada

- `action: created`
- `planning_alert_id: 03b479d9-7c60-4e45-bca1-dbbb0fc1a600`
- `alert_type: obra_no_lista`
- `title: No enviar instaladores`
- `message: Falta evidencia verificable de obra lista.`
- `severity: high`
- `status: open`
- `generated_by: planning_ai`
- `assigned_to: diego`

## Healthcheck previo

`GET /health/supabase` respondio:

- `service: rubik-os-backend`
- `status: ok`
- `supabase: connected`
- `table: ai_agents`
- `count: 8`

## Resultado de GET /work-orders/:id

- `has_data: true`
- `id: f801a28e-7aea-4346-badf-2992513c32e5`
- `title: Prueba staging - bajo mesada`
- `has_client: true`
- `operational_readiness_checks_count: 1`
- `has_planning_alerts: true`
- `planning_alerts_count: 1`
- `matching_planning_alerts_count: 1`

## Alerta devuelta

- `id: 03b479d9-7c60-4e45-bca1-dbbb0fc1a600`
- `alert_type: obra_no_lista`
- `title: No enviar instaladores`
- `severity: high`
- `status: open`
- `generated_by: planning_ai`
- `assigned_to: diego`

## Nota tecnica

El primer intento de crear la alerta desde la raiz del repositorio no funciono porque `node` no encontro `@supabase/supabase-js`; se repitio desde `backend` y funciono. No se imprimieron claves.

## Seguridad

- No se imprimio `SUPABASE_SERVICE_ROLE_KEY`.
- No se mostro el contenido completo de `.env`.
- No se expusieron claves en respuestas.
- Se uso backend/service_role solo del lado servidor.
- No se uso frontend directo a Supabase.
- Solo se uso staging.
- Se creo dato de prueba, no dato real.

## Valor operativo

Este resultado valida la base del semaforo operativo:

- Una orden puede traer checks que bloquean instalacion.
- Una orden puede traer alertas de planeamiento activas.
- La alerta `obra_no_lista` + `blocks_worker_dispatch=true` permite que Rubik OS advierta "no enviar instaladores".
- Esto conecta con `operational_control_ai` / `planning_ai`.

## Estado final

- Backend local detenido al finalizar.
- `git status --short` limpio.
- Proximo paso recomendado: crear endpoint para listar/gestionar `planning_alerts` o crear endpoint para confirmar readiness checks con evidencia.
