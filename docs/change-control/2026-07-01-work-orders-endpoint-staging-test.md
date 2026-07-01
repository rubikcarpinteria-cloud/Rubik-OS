# Work orders endpoint staging test - Rubik OS

## Fecha

2026-07-01

## Entorno

- Repo local: `D:\RubikOS`
- Supabase project: `rubik-os-staging`
- Project ref: `uqdyknsvvqutuefixgmb`
- Uso: staging / prueba, no produccion
- Backend local: `http://127.0.0.1:3001`

## Contexto

Despues de implementar y pushear `1201d24 backend: add work orders read endpoint`, se probo el endpoint real `GET /work-orders` contra Supabase staging.

## Endpoints probados

- `GET /work-orders?limit=5`
- `GET /work-orders?limit=5&status=nuevo_contacto`

## Healthcheck previo

`GET /health/supabase` respondio:

- `service: rubik-os-backend`
- `status: ok`
- `supabase: connected`
- `table: ai_agents`
- `count: 8`

## Resultado de GET /work-orders?limit=5

- `data_count: 1`
- `meta.limit: 5`
- `meta.status: null`
- `meta.client_id: null`
- `Prueba staging - bajo mesada` aparece: si

## Resultado de GET /work-orders?limit=5&status=nuevo_contacto

- `data_count: 1`
- `meta.limit: 5`
- `meta.status: nuevo_contacto`
- `meta.client_id: null`
- `Prueba staging - bajo mesada` aparece: si

## Campos excluidos correctamente

- `notes`: no aparece
- `created_by`: no aparece
- `assigned_to`: no aparece
- `requires_diego_approval`: no aparece
- `source_channel_id`: no aparece

## Seguridad

- No se imprimio `SUPABASE_SERVICE_ROLE_KEY`.
- No se mostro el contenido completo de `.env`.
- No se expusieron claves en respuestas.
- Se uso backend con `service_role` solo del lado servidor.
- No se uso frontend directo a Supabase.
- Solo se uso staging.
- No se cargaron datos reales de clientes.

## Estado final

- Backend local detenido al finalizar.
- `git status --short` limpio.
- Proximo paso recomendado: implementar `GET /work-orders/:id` o endpoint combinado de detalle de orden con cliente, manteniendo staging y backend-only.
