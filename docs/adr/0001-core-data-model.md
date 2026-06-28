# ADR 0001: Core Data Model

## Status

Accepted for Sprint 2 review.

## Context

Rubik OS needs a versioned database core before adding product screens,
automation or external integrations. Supabase already has a manually created
`public.personas` table, so migrations must be safe for an existing environment
and must not drop or erase data.

## Decision

Use `public` as the initial schema and define these core tables:

- `personas`
- `ordenes_trabajo`
- `tareas`
- `historial_eventos`
- `archivos`

The model centers on `ordenes_trabajo`. People, tasks, events and files connect
back to the work order so the system can answer the operational question: what
work exists and what has to happen next?

`personas` is a unified directory for clients, prospects, employees, third
parties, suppliers and companies. Roles are represented with `tipo` instead of
creating separate tables too early.

Parent and child work orders are represented with `orden_padre_id`. This allows
large works to be split by department, room, furniture or stage while preserving
one business hierarchy.

All main records use UUID primary keys and optional human codes for daily use.
Soft delete uses `eliminado_en`. RLS is enabled from the beginning, but user
policies are deferred until the permissions model is designed.

## Consequences

The first schema is flexible enough for workshop operations without committing
to future screens or automations. Backend/service_role access remains the only
intended access path until RLS policies are designed.

The existing `public.personas` table is aligned rather than replaced. If
existing data violates required constraints, migrations should fail safely and
ask for data cleanup instead of mutating or deleting records.
