---
"@benh-vien-so/api": minor
"@benh-vien-so/web": minor
"@benh-vien-so/domain": minor
"@benh-vien-so/contracts": minor
---

Validate clinical document attachment metadata at the API contract and domain boundary. MIME type values must be syntactically valid, attachment sizes must stay within the FHIR unsignedInt range, and SHA-1 hashes must use the standard 20-byte Base64 representation before the data is exported as FHIR DocumentReference attachment metadata.
