# Privacy And Security

This document is a technical and operational baseline for Rubik OS privacy and
security. It is not legal advice. Before operating with real clients, Rubik
should validate privacy notices, terms and legal obligations with a qualified
professional.

## Personal Data In Rubik OS

Rubik OS may store personal and project data such as:

- Client name and display name.
- Phone, WhatsApp, email, Instagram or TikTok user.
- Work address, location or neighborhood.
- Messages, audios and conversation history.
- Photos and videos of spaces, furniture, rooms and worksites.
- Quotes, payments, deposits and commercial notes.
- Delivery notes, reception documents, checklists and supplier documents.
- Files linked to design, installation and post-sale.

Photos, videos, audios and documents must be treated as personal data because
they may reveal people, addresses, interiors, schedules, possessions or other
private information.

## Common Data And Sensitive Data

Rubik OS should mainly process common personal data needed to manage sales,
quotes, design, coordination, installation and post-sale.

Rubik OS should not seek sensitive data. However, sensitive or unnecessary data
may arrive accidentally in chats, photos, audios or documents. When that happens,
the system should limit access, avoid unnecessary copying and evaluate whether
the file or message should be removed or redacted.

Rubik OS should not store:

- DNI unless there is a concrete operational or legal need.
- Client card data.
- Client passwords.
- Unrelated personal or family information.

## Principles

- Minimization: store only what is needed for the job.
- Purpose limitation: use data only for inquiry, quote, design, coordination,
  installation, payment follow-up and post-sale.
- Confidentiality: limit access to authorized people and systems.
- Security: use RLS, private storage, environment variables, backups and key
  rotation.
- Access control: use roles and least privilege.
- Auditability: log important access and changes.
- Retention: keep data only while it is operationally, commercially or legally
  needed.
- Deletion: support client requests when deletion is appropriate and does not
  conflict with legal or accounting obligations.

## Suggested Client Notice

Suggested baseline wording, subject to legal review:

> Rubik Carpinteria e Instalacion uses the information you send us, including
> messages, contact details, photos, videos, measurements and documents, to
> understand your request, prepare quotes, coordinate design, production,
> installation and post-sale. We only use this information for Rubik-related
> work and internal coordination. You can ask us to review, correct or delete
> your information when applicable.

## Client Rights

Rubik OS should support requests to:

- Access stored personal data.
- Correct inaccurate data.
- Delete data when applicable.
- Revoke non-essential consent.
- Ask how data is being used.

These requests are tracked in `privacy_requests`.

## Legal Validation

Rubik should validate legal text, privacy policy, consent language and any
regulatory registration requirements with professional advice. Rubik should also
evaluate whether a personal database registration before the AAIP applies.

## Technical Rules

- Enable Row Level Security on tables containing personal data.
- Keep Supabase Storage private for real client files.
- Avoid permanent public URLs for client files.
- Never use `service_role` in frontend code.
- Keep secrets in environment variables, not in source control.
- Use least privilege for users, integrations and agents.
- Require 2FA for administrative accounts when available.
- Rotate keys after incidents or staff/access changes.
- Keep backups and test restore procedures.
- Audit important reads, downloads, exports, updates and permission changes.
- Track security events, alerts and incidents through the security monitoring
  schema.
