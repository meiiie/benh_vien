# Smoke test

## Local gate

```bash
pnpm run ci
```

## API smoke khi server đang chạy

```bash
curl -fsS http://localhost:7310/health
curl -fsS http://localhost:7310/ready

curl -fsS http://localhost:7310/api/v1/fhir/metadata

TOKEN=$(curl -s -X POST http://localhost:7310/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"practitioner-demo-001","password":"demo","role":"clinician"}' | jq -r .accessToken)

OPERATIONS_TOKEN=$(curl -s -X POST http://localhost:7310/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"gateway-hai-phong-referral","password":"demo","role":"integration"}' | jq -r .accessToken)

curl -fsS http://localhost:7310/api/v1/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/clinical-documents/clinical-document-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/clinical-documents/clinical-document-demo-001/fhir-provenance \
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

curl -fsS http://localhost:7310/api/v1/consents/consent-demo-transfer-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

REVOKE_CONSENT_ID=$(curl -fsS -X POST http://localhost:7310/api/v1/patients/patient-demo-001/consents \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{"category":"record-sharing","granteeOrganizationId":"hospital-smoke-revoked-recipient","validFrom":"2026-05-27T00:00:00.000Z","validUntil":"2026-12-31T23:59:59.000Z"}' | jq -r .id)

curl -fsS -X POST "http://localhost:7310/api/v1/patients/patient-demo-001/consents/$REVOKE_CONSENT_ID/revoke" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Smoke test thu hồi consent."}'

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/record-transfers \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/record-transfers/record-transfer-demo-001/fhir-task \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS -X POST http://localhost:7310/api/v1/record-transfers/record-transfer-demo-001/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{"note":"Xếp gói hồ sơ vào hàng chờ gửi qua gateway liên thông."}'

curl -fsS http://localhost:7310/api/v1/record-transfers/record-transfer-demo-001/delivery-attempts \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

# Nếu secret callback được bật, thêm key id, timestamp và chữ ký HMAC.
curl -fsS -X POST http://localhost:7310/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback \
  -H "Authorization: Bearer $OPERATIONS_TOKEN" \
  -H "x-purpose-of-use: OPERATIONS" \
  -H "x-wiiicare-callback-key-id: gateway-hai-phong-referral" \
  -H "Content-Type: application/json" \
  -d '{"recipientOrganizationId":"hospital-hai-phong-referral","acknowledgementReference":"ack-smoke-demo-001","receivedByActorId":"system-hai-phong-referral-gateway"}'

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

AUDIT_TOKEN=$(curl -s -X POST http://localhost:7310/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"security-officer-demo","password":"demo","role":"auditor"}' | jq -r .accessToken)

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/audit-events/fhir-bundle \
  -H "Authorization: Bearer $AUDIT_TOKEN" \
  -H "x-purpose-of-use: AUDIT"
```

## Docker smoke

Xem `docs/runbooks/DOCKER.md`.
