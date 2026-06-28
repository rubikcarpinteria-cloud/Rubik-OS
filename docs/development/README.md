# Development

Configuración local, convenciones, pruebas y procesos de entrega.

## Requisitos

- Node.js 24 LTS o superior compatible.
- pnpm 11.
- Un proyecto Supabase para habilitar la conexión remota.

## Inicio local

1. Ejecutar `pnpm install` en la raíz.
2. Copiar `.env.example` como `.env` y completar solo las credenciales necesarias.
3. Ejecutar `pnpm dev` para iniciar frontend y backend.
4. Abrir `http://localhost:3000`; la API escucha en `http://localhost:3001`.

## Calidad

`pnpm validate` ejecuta formato, lint, typecheck, pruebas y build de todos los paquetes.

## Seguridad de Supabase

- El frontend usa exclusivamente URL y clave pública/anon con prefijo `VITE_`.
- La clave `SUPABASE_SERVICE_ROLE_KEY` pertenece exclusivamente al backend.
- La ausencia de credenciales está permitida en desarrollo y pruebas.
- No se han creado tablas, políticas ni migraciones en este sprint.
