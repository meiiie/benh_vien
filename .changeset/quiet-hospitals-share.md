---
"@benh-vien-so/api": minor
"@benh-vien-so/web": minor
"@benh-vien-so/domain": minor
"@benh-vien-so/contracts": minor
---

Add token-backed demo sessions, patient-record FHIR Bundle export, minimal consent store, structured allergies, clinical conditions, service requests, observations, diagnostic reports, and medication requests.

This release note covers the product-grade hardening slice that replaced actor headers with Bearer sessions, added auth/RBAC API tests, exposed patient record bundles, required an active patient consent matching the recipient before bundle export, and added AllergyIntolerance/Condition/ServiceRequest/Observation/DiagnosticReport/MedicationRequest domain/API/UI support for allergy safety alerts, diagnoses, service orders, problem lists, vital signs, laboratory results, diagnostic result reports, and medication orders.
