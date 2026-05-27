---
"@benh-vien-so/api": minor
"@benh-vien-so/web": minor
"@benh-vien-so/domain": minor
"@benh-vien-so/contracts": minor
---

Add token-backed demo sessions, patient-record FHIR Bundle export, minimal consent store, structured clinical conditions, and observations.

This release note covers the product-grade hardening slice that replaced actor headers with Bearer sessions, added auth/RBAC API tests, exposed patient record bundles, required an active patient consent matching the recipient before bundle export, and added Condition/Observation domain/API/UI support for diagnoses, problem lists, vital signs, and laboratory results.
