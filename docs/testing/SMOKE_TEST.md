# Smoke test

## Local gate

```bash
pnpm run ci
```

## API smoke khi server đang chạy

```bash
curl -fsS http://localhost:7310/health

TOKEN=$(curl -s -X POST http://localhost:7310/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"practitioner-demo-001","password":"demo","role":"clinician"}' | jq -r .accessToken)

curl -fsS http://localhost:7310/api/v1/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/provider-directory \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/provider-directory/Endpoint/endpoint-pacs-hai-phong-demo/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/consents \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/record-transfers \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/record-transfers/record-transfer-demo-001/fhir-task \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/allergy-intolerances \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/allergy-intolerances/allergy-intolerance-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/conditions \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/conditions/condition-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/service-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/service-requests/service-request-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/workflow-tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/workflow-tasks/workflow-task-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/procedures \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/procedures/procedure-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/observations \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/observations/observation-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/diagnostic-reports \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/diagnostic-reports/diagnostic-report-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/imaging-studies \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/imaging-studies/imaging-study-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/medication-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/medication-requests/medication-request-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/medication-dispenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/medication-dispenses/medication-dispense-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/medication-administrations \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/medication-administrations/medication-administration-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/fhir-bundle \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "x-consent-reference: consent-demo-transfer-001" \
  -H "x-recipient-organization-id: hospital-hai-phong-referral"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/fhir-document-bundle \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "x-consent-reference: consent-demo-transfer-001" \
  -H "x-recipient-organization-id: hospital-hai-phong-referral"
```

## Docker smoke

Xem `docs/runbooks/DOCKER.md`.
