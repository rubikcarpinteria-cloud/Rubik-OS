# Database Compatibility Notes

This note documents why migration `009_core_schema_compatibility_and_rls.sql`
exists and what must be checked before applying the operational schema in
Supabase.

## Why Migration 009 Exists

Migration `008_core_operational_schema.sql` introduced the Phase 2 operational
model around `work_orders`. During review, two compatibility risks were found:

- `quotes.status` was narrowed to the new Rubik OS status names and some legacy
  values from migration `005_quotes_and_cutlists.sql` were not kept.
- New tables created by 008 did not enable Row Level Security, while migration
  `007_rls_base.sql` already enabled RLS for the earlier core tables.

Because 008 has already been pushed, history should not be rewritten. Migration
009 is an additive compatibility migration that can be applied after 008.

## Quotes Status Compatibility

The temporary decision is Option A: compatibility first.

For now, `quotes.status` must allow both legacy values and the new Rubik OS
values:

- `borrador`
- `tentativo`
- `esperando_revision_diego`
- `aprobado_por_diego`
- `enviado_cliente`
- `aceptado_cliente`
- `rechazado_cliente`
- `vencido`
- `requiere_actualizacion`
- `confirmado`
- `enviada_cliente`
- `vencida`
- `rechazada`

The legacy values are kept so existing data and any code still using those names
do not break during the transition.

The migration also handles the constraint name used by a clean 008 application:
if `quotes_operational_status_check` exists, it is renamed to the canonical
`quotes_status_check` before replacing the expression. The only dropped check
constraint is still `quotes_status_check`.

## Why No Data Rewrite Happens Yet

Migration 009 does not rewrite quote rows. That is intentional:

- It avoids changing production data before the team decides final naming.
- It avoids guessing whether `enviada_cliente` should map to `enviado_cliente`
  in every business case.
- It keeps the compatibility step small and reviewable.

A later migration can normalize values once the application and business reports
agree on the final status vocabulary.

## Quote Number Nullable

Migration 008 relaxed `quotes.quote_number` so it can be nullable. This remains
temporarily accepted for draft or tentative quotes because Rubik OS may prepare
internal estimates before assigning a formal number.

Business rule: before a quote is formally confirmed or sent as a final customer
document, Rubik OS should assign a `quote_number`.

## RLS For New Tables

Migration 009 enables RLS on the new operational tables created by 008. It does
not create detailed policies yet.

This follows the earlier convention from `007_rls_base.sql`: RLS can be enabled
while user-facing policies are deferred. Initial access should continue through
trusted backend/service-role paths until roles and policies are designed.

`quotes` and `quote_items` are not included in the RLS list in 009 because they
were introduced by an earlier migration and need a separate policy review.

## Supabase Checklist Before Applying

- Confirm a fresh backup or Supabase snapshot exists.
- Confirm migrations `001` through `008` have applied in the target database.
- Inspect current quote statuses:

```sql
select status, count(*)
from public.quotes
group by status
order by status;
```

- Confirm whether any rows use `enviada_cliente`, `vencida`, or `rechazada`.
- Confirm whether any rows use transitional 008 statuses such as `preliminar`,
  `pendiente_validacion_diego`, `validada`, `señada`, or
  `convertida_en_proyecto`. If they do, review whether 009 should be broadened
  before applying.
- Inspect quote number usage:

```sql
select
  count(*) filter (where quote_number is null) as without_quote_number,
  count(*) as total
from public.quotes;
```

- Confirm application code can tolerate RLS being enabled on the new tables.
- Confirm backend/service-role access is available for operational reads and
  writes after RLS is enabled.
- Test 008 and 009 first in a staging copy of Supabase.
- Run smoke checks after applying in staging.
- Do not apply to production until quote statuses and access paths are reviewed.

## Possible Future Migration 010

A future normalization migration can:

- Map `enviada_cliente` to `enviado_cliente`.
- Map `vencida` to `vencido`.
- Map `rechazada` to `rechazado_cliente`.
- Decide what to do with any transitional 008 statuses still present.
- Recreate `quotes_status_check` with only the final canonical state names.
- Add a guard that formal or confirmed quotes require `quote_number`.
- Define RLS policies for user-facing roles.
