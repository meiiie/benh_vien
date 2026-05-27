---
"@benh-vien-so/api": minor
"@benh-vien-so/web": minor
"@benh-vien-so/domain": minor
"@benh-vien-so/contracts": minor
---

Add token-backed demo sessions, patient-record FHIR Bundle export, FHIR document Bundle export, minimal consent store, Provider Directory, structured allergies, clinical conditions, service requests, workflow tasks, observations, diagnostic reports, imaging studies, medication workflows, inter-facility record transfers, and tamper-evident audit integrity checks.

This release note covers the product-grade hardening slice that replaced actor headers with Bearer sessions, added auth/RBAC API tests, exposed patient record collection bundles and document bundles with Composition, required an active patient consent matching the recipient before bundle export, embedded Provider Directory resources so Organization/Practitioner/PractitionerRole/Endpoint references are resolvable, and added AllergyIntolerance/Condition/ServiceRequest/Task/Procedure/Observation/DiagnosticReport/ImagingStudy/MedicationRequest/MedicationDispense/MedicationAdministration/RecordTransfer domain/API/UI support for allergy safety alerts, diagnoses, service orders, execution tracking, procedures, problem lists, vital signs, laboratory results, diagnostic result reports, PACS/DICOM imaging metadata, medication orders, medication dispensing, medication administration, and record-transfer Task coordination. Audit events are now sealed with SHA-256 payload and chain hashes, exposed through an audit-integrity API and UI verification panel.
