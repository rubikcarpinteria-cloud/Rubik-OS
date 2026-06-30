# Security Monitoring

Rubik OS needs a security alarm system that detects suspicious activity, records
evidence and alerts Karem or Diego before a technical issue becomes a business
incident.

## Security AI

`security_ai` is the monitoring agent for suspicious access, abnormal behavior,
permission changes, private-file access attempts and possible data exposure.

It does not replace technical security controls. It reviews events and helps
create structured records in:

- `data_access_audit_log`
- `security_events`
- `security_alerts`
- `security_incidents`

## Events To Detect

- Many failed login attempts.
- Access outside expected hours.
- Access from unusual device or location.
- Massive file downloads.
- Massive client queries.
- Massive data changes.
- Permission changes.
- Abnormal API key use.
- Repeated Supabase errors.
- Repeated denied access.
- Attempts to view private files.
- Modification of sensitive data.
- Deletion or attempted massive deletion.
- Unexpected changes in external integrations.

## Severities

| Severity | Meaning | Initial action |
| --- | --- | --- |
| `low` | Unusual but low-risk event. | Log and observe. |
| `medium` | Suspicious activity that may need review. | Generate alert and assign review. |
| `high` | Likely security risk or sensitive data access. | Notify Karem/Diego and investigate. |
| `critical` | Possible breach, mass access or destructive action. | Pause/block action, notify immediately and contain. |

## Incident Protocol

1. Register the event.
2. Generate an alert.
3. Notify Karem and/or Diego.
4. Block or pause the action if it is critical.
5. Revoke session or token if applicable.
6. Change keys if needed.
7. Review logs.
8. Determine whether data was compromised.
9. Document the incident.

## Example Alerts

- `suspicious_login`: login from an unknown device outside normal hours.
- `access_denied_repeated`: repeated attempts to access private files.
- `mass_download`: unusual download volume from attachments or storage.
- `mass_query`: unusually large client or order reads.
- `permission_change`: role or access change outside normal process.
- `api_key_anomaly`: unexpected API key use or error burst.
- `possible_data_breach`: signs of exposed or extracted client data.
- `external_service_anomaly`: abnormal behavior in Supabase, Google, GitHub or
  OpenAI integration paths.

## Future Integrations

Future monitoring can connect to:

- Supabase Auth logs.
- Supabase database and Storage logs.
- GitHub security/audit events.
- Google account, Drive and Calendar audit events.
- OpenAI API usage and anomaly reports.
- Email or messaging alerts to Karem and Diego.

Until integrations exist, suspicious events can be created manually or by backend
logic once implemented.
