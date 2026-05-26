# Smoke test

## Local gate

```bash
pnpm run ci
```

## API smoke khi server đang chạy

```bash
curl -fsS http://localhost:7310/health
curl -fsS http://localhost:7310/api/v1/patients
curl -fsS http://localhost:7310/api/v1/patients/patient-demo-001/fhir
```

## Docker smoke

Xem `docs/runbooks/DOCKER.md`.
