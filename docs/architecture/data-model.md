# Rubik OS Data Model

Sprint 2 defines the first versioned data core for Rubik OS. The database model
is centered on `ordenes_trabajo` because the business needs to know what work
exists, who asked for it, who is responsible, what step is next and which files
or events explain the current state.

## Core Tables

`personas` is a unified directory. It includes clients, prospects, employees,
third parties, suppliers and companies because the same real-world actor can
appear in different operational roles. A single table avoids duplicated contact
data and keeps assignments, customers and providers addressable through one UUID
model.

`ordenes_trabajo` represents the operational unit. A small job can be one order.
A large job can use one parent order with child orders for departments, rooms,
furniture groups or installation stages. The `orden_padre_id` self-reference
keeps that hierarchy explicit without creating a separate project table too
early.

`tareas` breaks each work order into executable workflow steps. They make the
system useful for follow-up, assignment, priorities and deadlines without adding
business automation yet.

`historial_eventos` records important events around a work order: state changes,
manual notes, future automation outputs and integration events. It is the audit
trail of what happened and why.

`archivos` stores metadata for photos, audio, video, PDFs, plans, PolyBoard
files, Excel files and documents. The actual binary may live in Supabase Storage
or another provider; this table keeps the business link to orders, people and
tasks.

## Identifiers

Every core table uses UUIDs as internal primary keys. UUIDs are stable for APIs,
sync, imports and external references. Human codes such as `PER-000001`,
`OT-000001` and `TAR-000001` exist in addition to UUIDs because people need
short references for messages, tickets, labels and conversations.

## Soft Delete

Operational records use `eliminado_en` instead of destructive deletion. Rubik OS
must preserve context for old orders, files and decisions. Soft delete lets the
application hide inactive records while keeping historical traceability.

## RLS

Row Level Security is enabled from the first schema version. No permissive user
policies are created in Sprint 2. Initial access is expected to go through the
backend with Supabase `service_role` credentials. User policies will be designed
later when roles and permissions are explicit.
