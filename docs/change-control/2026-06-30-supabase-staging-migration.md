# Supabase staging migration — Rubik OS

## Fecha

2026-06-30

## Entorno

- Supabase project: rubik-os-staging
- Project ref: uqdyknsvvqutuefixgmb
- Branch: main
- Uso: staging / prueba, no produccion

## Migraciones aplicadas

Inicialmente se aplicaron estas migraciones en staging:

- `001_foundation.sql`
- `002_personas.sql`
- `003_ordenes_trabajo.sql`
- `004_tareas.sql`
- `005_historial_eventos.sql`

El primer `db push` fallo por duplicado de version `005` entre:

- `005_historial_eventos.sql`
- `005_quotes_and_cutlists.sql`

Supabase CLI usa el prefijo antes del primer `_` como version. Por eso no pueden existir dos migraciones con el mismo prefijo en la carpeta operativa de migraciones.

## Correccion

Se creo una carpeta operativa:

- `supabase/migrations`

La carpeta se renumero para Supabase CLI asi:

- `001_foundation.sql`
- `002_personas.sql`
- `003_ordenes_trabajo.sql`
- `004_tareas.sql`
- `005_historial_eventos.sql`
- `006_quotes_and_cutlists.sql`
- `007_archivos.sql`
- `008_rls_base.sql`
- `009_core_operational_schema.sql`
- `010_core_schema_compatibility_and_rls.sql`
- `011_operational_readiness_checks.sql`
- `012_quote_status_legacy_compatibility.sql`
- `013_privacy_security_monitoring.sql`

`database/migrations` queda como historia/documentacion del proyecto. `supabase/migrations` queda como carpeta operativa para Supabase CLI.

## Resultado

El segundo `db push` en staging termino correctamente:

```text
Finished supabase db push.
```

Migraciones aplicadas despues de la correccion:

- `006_quotes_and_cutlists.sql`
- `007_archivos.sql`
- `008_rls_base.sql`
- `009_core_operational_schema.sql`
- `010_core_schema_compatibility_and_rls.sql`
- `011_operational_readiness_checks.sql`
- `012_quote_status_legacy_compatibility.sql`
- `013_privacy_security_monitoring.sql`

## Smoke tests realizados

Se valido:

- Tablas publicas creadas: 41 rows en `information_schema.tables`.
- `ai_agents`: 8 rows.
- RLS activo en tablas revisadas.
- `quotes_status_check` existe.
- `quotes_status_check` permite estados nuevos y legacy, incluyendo:
  - `enviada_cliente`
  - `vencida`
  - `rechazada`
  - `preliminar`
  - `pendiente_validacion_diego`
  - `validada`
  - `señada`
  - `seÃ±ada`
  - `convertida_en_proyecto`
- Tablas criticas: 19 rows.
- Insert en `clients`: OK.
- Insert en `work_orders`: OK.
- Insert en `operational_readiness_checks`: OK.
- Insert en `security_events`: OK.

## IDs de prueba

- `client_id`: `5b12ba40-493f-4faa-837a-b78149eb2d98`
- `work_order_id`: `f801a28e-7aea-4346-badf-2992513c32e5`
- `security_event_id`: `1f5944ad-e180-4101-9112-ea4268f8fbd0`

El `operational_readiness_check` fue creado correctamente, pero su ID no se registro en esta nota.

## Decisiones tecnicas

- No aplicar todavia a produccion.
- Mantener staging como ambiente de prueba.
- Conectar backend primero contra staging antes de produccion.
- RLS esta habilitado sin policies completas; el backend debe usar `service_role` en operaciones internas iniciales.
- No exponer `service_role` en frontend.
- Crear policies RLS antes de permitir acceso directo a usuarios finales.

## Pendientes antes de produccion

- Backup/snapshot de produccion.
- Revisar datos existentes de produccion.
- Revisar estados reales de `quotes` en produccion.
- Confirmar que `quote_number` nullable no rompe flujos.
- Confirmar backend con `service_role` seguro.
- Crear variables de entorno seguras.
- Crear policies RLS segun roles.
- Definir limpieza de datos de prueba si corresponde.
- Ejecutar smoke tests equivalentes en produccion si se aplica.

## Estado final

- Supabase staging aplicado correctamente.
- Smoke tests OK.
- GitHub actualizado hasta commit: `44315b7 db: fix Supabase migration versions`.
- Recomendacion: continuar con conexion backend -> staging, no produccion.
