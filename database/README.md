# Database

Versioned PostgreSQL/Supabase schema for Rubik OS.

## Folders

- `migrations/`: ordered database changes. Sprint 2 starts the core data model.
- `functions/`: versioned database functions when they are split from migrations.
- `policies/`: Row Level Security policies when user access rules are defined.
- `views/`: versioned database views.
- `seeds/`: non-sensitive demo data for development and smoke checks.
- `tests/`: SQL smoke tests for schema, relations, functions and policies.

## Sprint 2 Core

The first data core creates:

- `personas`
- `ordenes_trabajo`
- `tareas`
- `historial_eventos`
- `archivos`

Migrations are designed to be safe for an environment where `public.personas`
may already exist. They do not drop tables and do not delete data.

RLS is enabled from the start, but user policies are intentionally deferred.
Initial access should go through the backend with Supabase `service_role`
credentials.
