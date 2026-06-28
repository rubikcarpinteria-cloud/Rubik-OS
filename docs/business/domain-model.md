# Rubik OS Domain Model

Rubik OS starts from the work that must be delivered. The central business
object is `ordenes_trabajo`, not a chat, a file or a customer record. A work
order connects the customer request, the internal team, the production flow,
installation, files and history.

## Personas

`personas` includes clients, prospects, employees, third parties, suppliers and
companies. This is intentional. In the workshop workflow, the same directory
must answer questions such as:

- Who requested the job?
- Who is responsible today?
- Who installs it?
- Which supplier or company is related?

A unified directory keeps those relationships simple and avoids copying contact
data across multiple tables.

## Work Orders

An order can stand alone or be part of a larger order. Parent and child orders
support large works split by apartment, room, furniture type, production batch
or installation stage. The parent keeps the global business context; children
let the team track each deliverable independently.

## Tasks, History and Files

`tareas` are the actionable steps: measure, design, budget, cut, assemble,
install or follow up. They are attached to one work order.

`historial_eventos` explains what happened. It is where Rubik OS can later
record manual notes, state transitions and events from WhatsApp, OpenAI or other
integrations.

`archivos` links evidence and materials to the domain: photos, audio, PDFs,
plans, PolyBoard files, Excel files and documents. Files can point to storage
paths or URLs without deciding the final storage strategy in this sprint.

## Data Safety

The schema uses soft delete through `eliminado_en` because operational history
matters. Records should disappear from day-to-day views without losing the chain
of decisions.

Human codes exist because daily operations need references that can be spoken,
searched and pasted into messages. UUIDs remain the technical identity.
