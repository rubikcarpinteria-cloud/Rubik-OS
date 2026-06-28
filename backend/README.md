# Backend

API HTTP de Rubik OS construida con Fastify y TypeScript.

## Comandos

- `pnpm dev`: servidor de desarrollo con recarga.
- `pnpm build`: compilación TypeScript.
- `pnpm test`: pruebas con Vitest.
- `pnpm typecheck`: validación estática de tipos.

Requiere las variables `BACKEND_HOST`, `BACKEND_PORT`, `FRONTEND_ORIGIN`, `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. La clave de servicio nunca debe exponerse al navegador.
