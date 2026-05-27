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

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/consents \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/observations \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/observations/observation-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"

curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/fhir-bundle \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "x-consent-reference: consent-demo-transfer-001" \
  -H "x-recipient-organization-id: hospital-hai-phong-referral"
```

## Docker smoke

Xem `docs/runbooks/DOCKER.md`.
