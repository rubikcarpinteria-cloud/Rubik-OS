# Database Schema

This document summarizes the Phase 2 operational database model for Rubik OS.
The SQL is versioned in `database/migrations/008_core_operational_schema.sql`
and is not meant to be executed against Supabase until it is reviewed.

## Purpose

The model turns the Phase 1 architecture into a PostgreSQL/Supabase schema for
daily operations. It covers client intake, work orders, conversations, files,
measurements, design, quotes, approvals, blockers, planning, payments,
appointments, suppliers, inventory and post-sale.

Rubik OS is not only a chatbot, agenda, quote tool or design tool. The database
therefore keeps the full commercial, technical and operational trace around the
same central object.

## Central Table

`work_orders` is the center of the operational model. A work order represents a
real client request or project and connects:

- Client and source channel.
- Conversation history and attachments.
- Measurements and design versions.
- Quotes and quote line items.
- Diego approvals.
- Blockers, dependencies and planning alerts.
- Payments and appointments.
- Supplier requests and post-sale cases.

The status list follows the architecture documents, including intake states,
Diego review states, tentative/confirmed planning, production, installation,
post-sale and blocked/reactivation states.

## Table Groups

### Client Intake

- `clients`
- `contact_channels`
- `client_contacts`
- `messages`
- `attachments`

These tables capture where the client came from, how to contact them, what they
said, and which photos, videos, audios or documents explain the request.

### Work Order Core

- `work_orders`
- `work_order_status_history`
- `measurements`

These tables hold the live state of the job, status changes and measurements
that may start as approximate and later become confirmed.

### Design Engine

- `designs`
- `design_modules`
- `design_parts`

These tables support the Rubik Design Engine as the core design system. External
tools such as PolyBoard, SketchUp or FreeCAD can be referenced as optional
sources, but they are not the source of truth.

### Pricing

- `quotes`
- `quote_items`
- `payments`

Quotes distinguish tentative and final commercial states. The model includes
currency, exchange-rate reference, deposit, validity, price freeze and Diego
approval fields.

### Approvals And Planning

- `approvals`
- `blockers`
- `dependencies`
- `planning_alerts`
- `project_reactivations`
- `appointments`

These tables enforce the business rule that no critical step should advance
without required confirmations. A tentative date is not a confirmed date, and a
paused project must return to planning review before being reactivated.

### Suppliers And Inventory

- `suppliers`
- `supplier_requests`
- `inventory_items`

These tables store lumberyard and supplier data, price/availability/cut-time
requests and a basic inventory registry.

### Post-Sale

- `post_sale_cases`

Post-sale cases keep follow-up, fixes, adjustments and warranty issues linked to
the original work order and client.

## Main Relationships

- `work_orders.client_id` references `clients.id`.
- `work_orders.source_channel_id` references `contact_channels.id`.
- `messages`, `attachments`, `measurements`, `designs`, `quotes`, `approvals`,
  `blockers`, `dependencies`, `planning_alerts`, `payments`, `appointments`,
  `supplier_requests` and `post_sale_cases` reference `work_orders.id`.
- `design_modules` and `design_parts` hang from `designs`.
- `quote_items` hangs from `quotes`.
- `project_reactivations.diego_approval_id` can reference the approval that
  authorizes the reactivation.
- `supplier_requests` and `inventory_items` can reference `suppliers`.

## Critical Rules

- The order of work is the center of the system.
- Diego approval is required for critical quote, design, date, production and
  reactivation decisions.
- Sales AI may create incomplete orders, but missing critical data must be
  visible as pending information, blockers or planning alerts.
- Planning must distinguish tentative dates from confirmed dates.
- An externally paused project does not keep automatic operational priority.
- Reactivation requires planning review and Diego approval when it affects
  agenda or capacity.
- RLS is not added in this migration. Existing RLS conventions can be expanded
  later once application roles are explicit.

## Out Of Scope For This Phase

- Running migrations against Supabase.
- Real WhatsApp, Instagram, TikTok, Gmail, Calendar or Drive integrations.
- Backend API changes.
- Frontend changes.
- Full RLS policy design.
- Production-grade inventory costing and stock movement accounting.
- Automated scheduling or supplier synchronization.

## Applying Later In Supabase

After review, apply the migration in a controlled environment first. A typical
future command from the repository root would be:

```bash
supabase db push
```

If the project uses direct SQL execution instead of the Supabase CLI, apply:

```bash
psql "$DATABASE_URL" -f database/migrations/008_core_operational_schema.sql
```

Before production execution, take a database backup, confirm the previous
migrations applied cleanly, and review the compatibility changes to `quotes` and
`quote_items`.
