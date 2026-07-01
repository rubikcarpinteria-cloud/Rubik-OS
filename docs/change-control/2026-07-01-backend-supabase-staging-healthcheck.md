# Backend Supabase staging healthcheck - Rubik OS

## Fecha

2026-07-01

## Entorno

- Repo local: `D:\RubikOS`
- Supabase project: `rubik-os-staging`
- Project ref: `uqdyknsvvqutuefixgmb`
- Uso: staging / prueba, no produccion
- Backend local: `http://127.0.0.1:3001`

## Contexto

Despues de aplicar las migraciones en Supabase staging y completar los smoke tests, se probo la conexion real del backend local contra staging mediante el endpoint `GET /health/supabase`.

## Variables usadas

Se usaron las siguientes variables. Solo se registran nombres y valores no secretos:

- `APP_ENV=staging`
- `BACKEND_HOST=127.0.0.1`
- `BACKEND_PORT=3001`
- `FRONTEND_ORIGIN=http://localhost:3000`
- `SUPABASE_URL=https://uqdyknsvvqutuefixgmb.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` configurada localmente en `.env` / entorno

Notas de seguridad:

- No se registro ni versiono la `service_role` key.
- `.env` esta ignorado por Git.
- `service_role` se usa solo en backend.
- No se uso frontend para acceder a Supabase.

## Comandos usados

Estado inicial/final del repositorio:

```powershell
git status --short
```

Carga manual de variables de entorno desde `.env` en PowerShell.

Arranque del backend:

```powershell
pnpm.cmd --filter @rubik-os/backend dev
```

Prueba del endpoint:

```powershell
Invoke-RestMethod http://127.0.0.1:3001/health/supabase
```

## Resultado del endpoint

Respuesta no sensible registrada:

- `service: rubik-os-backend`
- `status: ok`
- `supabase: connected`
- `table: ai_agents`
- `count: 8`

## Problemas encontrados y solucion

- PowerShell bloqueo `pnpm.ps1`; se uso `pnpm.cmd`.
- Node no permite `--env-file` dentro de `NODE_OPTIONS`; se cargaron variables manualmente desde `.env`.
- Al principio faltaba `SUPABASE_SERVICE_ROLE_KEY` en el entorno; se corrigio cargandola desde `.env`.
- No se expusieron claves en Git ni en logs del endpoint.

## Decisiones

- Mantener acceso inicial a Supabase via backend.
- No usar `frontend/src/supabase.ts` todavia para tablas con RLS.
- No conectar produccion todavia.
- Seguir usando staging para pruebas.
- `service_role` solo en backend y variables locales/seguras.

## Estado final

- Backend local iniciado correctamente.
- `GET /health/supabase` respondio OK.
- Conexion backend -> Supabase staging validada.
- `git status --short` limpio.
- Proximo paso recomendado: crear endpoints backend minimos para clientes y ordenes de trabajo en staging.
