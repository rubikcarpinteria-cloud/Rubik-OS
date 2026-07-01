# Clients endpoint staging test - Rubik OS

## Fecha

2026-07-01

## Entorno

- Repo local: `D:\RubikOS`
- Supabase project: `rubik-os-staging`
- Project ref: `uqdyknsvvqutuefixgmb`
- Uso: staging / prueba, no produccion
- Backend local: `http://127.0.0.1:3001`

## Contexto

Despues de implementar y pushear `3a3ab66 backend: add clients read endpoint`, se probo el endpoint real `GET /clients` contra Supabase staging.

## Endpoint probado

```http
GET /clients?limit=5
```

## Resultado

- `data_count: 1`
- `meta.limit: 5`
- `Cliente Prueba Staging` aparece: si
- `document_id` aparece: no
- No se expusieron claves.
- No se mostro `SUPABASE_SERVICE_ROLE_KEY`.
- Se uso backend con `service_role` solo del lado servidor.
- No se uso frontend directo a Supabase.

## Healthcheck previo

`GET /health/supabase` respondio:

- `service: rubik-os-backend`
- `status: ok`
- `supabase: connected`
- `table: ai_agents`
- `count: 8`

## Seguridad

- `.env` esta ignorado por Git.
- `service_role` se cargo localmente.
- No se imprimio la clave.
- No se cargaron datos reales de clientes.
- Solo se uso staging.

## Estado final

- Backend local detenido al finalizar.
- `git status --short` limpio.
- Proximo paso recomendado: implementar `GET /work-orders` usando el mismo patron backend -> Supabase staging.
