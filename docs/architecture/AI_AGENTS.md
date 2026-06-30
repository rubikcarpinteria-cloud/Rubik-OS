# AI Agents

Rubik OS does not use one generic AI. It uses specialized agents coordinated by
the central system, with `work_orders` as the operational source of truth.

Each agent can summarize, request information, generate structured records and
raise alerts. No agent can bypass Diego approval or operational readiness rules
for critical decisions.

## Agent Registry

| Agent | Role | Main Tables | Requires Diego |
| --- | --- | --- | --- |
| `sales_ai` | Conversational sales intake. | `clients`, `client_contacts`, `messages`, `attachments`, `work_orders` | For quote, final scope or commitment. |
| `design_ai` | Mini proposal, approximate render and technical view. | `designs`, `design_modules`, `design_parts`, `measurements`, `attachments` | For technical design approval. |
| `pricing_ai` | Tentative pricing support. | `quotes`, `quote_items`, `designs`, `payments` | For sending quotes or final price. |
| `supplier_ai` | Supplier, lumberyard and material coordination. | `suppliers`, `supplier_requests`, `inventory_items`, `attachments` | For exceptions, substitutions or commercial risk. |
| `planning_ai` | Planning, agenda, capacity and cross-project checks. | `appointments`, `planning_alerts`, `dependencies`, `blockers` | For final dates and reactivations. |
| `operational_control_ai` | Evidence-based operational readiness control. | `operational_readiness_checks`, `readiness_check_evidence`, `attachments`, `blockers`, `planning_alerts` | For dispatch when readiness is disputed or risky. |
| `post_sale_ai` | Post-sale follow-up, warranty and claims. | `post_sale_cases`, `messages`, `attachments`, `appointments` | For costly fixes or commercial exceptions. |

## Common Rules

- Agents communicate through persisted records, not hidden memory.
- Agents may request evidence, create alerts and mark missing information.
- Agents may not confirm final price, final date, final design or production
  without required human approval.
- Agents may not dispatch workers or installers without verified readiness when
  readiness checks block worker dispatch.

## Sales AI

`sales_ai` talks to clients in a human tone through WhatsApp, Instagram, TikTok,
email or manual intake. It creates or updates client records, captures messages,
links photos and creates incomplete work orders when data is missing.

It may ask for photos, measurements, location and references. It must not sound
like a rigid form, promise a final price, promise a final date, confirm
production or approve design.

Events it can raise:

- `work_order_created`
- `client_data_missing`
- `mini_proposal_requested`
- `diego_review_required`

## Design AI

`design_ai` prepares mini proposals, approximate visual previews, technical 3D
views, module layouts and parts lists. It uses measurements, photos, references
and the Rubik Design Engine.

It may create `designs`, `design_modules` and `design_parts`. It must not mark a
technical design as final without Diego.

Events it can raise:

- `mini_proposal_generated`
- `technical_design_ready_for_review`
- `design_missing_measurements`
- `design_needs_diego_review`

## Pricing AI

`pricing_ai` prepares tentative quote data from designs, materials, labor,
installation, freight, margin and exchange-rate references.

It may create draft or tentative quotes. It must not send final quotes, freeze a
price or override Diego approval.

Events it can raise:

- `quote_draft_created`
- `quote_waiting_diego_review`
- `quote_requires_update`
- `deposit_required`

## Supplier AI

`supplier_ai` coordinates supplier and lumberyard information: availability,
prices, cutting delays, hardware and delivery expectations.

It may create `supplier_requests`, attach supplier responses and inform planning
about material risk. It must not treat a promise as delivered evidence.

Events it can raise:

- `supplier_request_created`
- `supplier_response_received`
- `material_unavailable`
- `delivery_evidence_required`

## Planning AI

`planning_ai` checks dates, capacity, conflicts, blockers, dependencies and
tentative vs confirmed schedules. It proposes dates only after relevant
conditions are visible.

It may create `planning_alerts`, `dependencies`, `blockers` and tentative
`appointments`. It must not confirm final dates without Diego and operational
readiness when dispatch is involved.

Events it can raise:

- `tentative_date_generated`
- `agenda_conflict_detected`
- `reactivation_requires_review`
- `readiness_check_required`

## Operational Control AI / IA de Seguimiento Operativo y Control de Evidencia

`operational_control_ai` is transversal to the entire process. It is not
post-sale. Its job is to keep the operational traffic light honest before Rubik
advances to critical stages or sends workers to a site.

It reviews whether the next stage is actually ready. If evidence is missing, it
blocks progress through `operational_readiness_checks`, `blockers` and
`planning_alerts`.

It can request:

- Delivery notes or remitos.
- Reception documents.
- Photos of unloaded material.
- Videos of unloaded material.
- Signed checklists.
- Confirmation of complete unloading.
- Confirmation by unit, department or sector.
- Confirmation that the space is clear.
- Confirmation that material is accessible for installation.
- Name of the receiver.
- Date and time of unloading.

It must not release workers based on verbal promises. The following states are
different and must not be collapsed:

- Material promised.
- Material in transit.
- Material supposedly arriving today.
- Material somewhere on site without evidence.
- Material unloaded.
- Material distributed by unit, department or sector.
- Site ready for installation.

Only verified site readiness can unblock installation dispatch. In
installation-only jobs, the evidence requirement is stricter because Rubik does
not control production or material delivery.

Events it can raise:

- `worker_dispatch_blocked`
- `readiness_evidence_requested`
- `site_ready_confirmed`
- `site_ready_rejected`
- `delivery_promise_risk_detected`

## Post Sale AI

`post_sale_ai` handles after-installation follow-up, claims, warranty requests,
adjustments and customer satisfaction. It starts after delivery/installation or
when a post-sale case is opened.

It is not responsible for pre-installation readiness. If a post-sale issue
reveals an operational process problem, it may raise a note or case, but it does
not replace `operational_control_ai`.

Events it can raise:

- `post_sale_case_opened`
- `post_sale_visit_requested`
- `warranty_review_required`
- `case_resolved`

## Agent Coordination

Agents communicate by writing structured records:

- `messages` for conversation.
- `attachments` for files and evidence.
- `work_orders` for operational state.
- `approvals` for human decisions.
- `blockers`, `dependencies` and `planning_alerts` for control flow.
- `operational_readiness_checks` and `readiness_check_evidence` for evidence
  gates.

When an agent needs a decision beyond its authority, it creates an approval,
alert or readiness check instead of silently advancing the order.
