---
"@benh-vien-so/api": patch
---

Apply patient organization-scoped access checks across treatment clinical resources, including encounters, allergies, conditions, medication orders/dispensing/administration, observations, service requests, workflow tasks, procedures, diagnostic reports, imaging studies, consents, documents, audit trails and record transfers. Denied access responses and login attempts are now captured as sealed audit events, exposed through the global audit log for security review and exported as failed FHIR `AuditEvent` entries for patient-scoped auditor review where applicable.
