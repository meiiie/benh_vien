---
"@benh-vien-so/api": minor
"@benh-vien-so/domain": minor
---

Add HL7 FHIR R4 OperationOutcome support for FHIR facade failures. The domain now exposes an OperationOutcome builder, and API FHIR export errors return `application/fhir+json` with FHIR issue codes plus WiiiCare internal detail codes.
