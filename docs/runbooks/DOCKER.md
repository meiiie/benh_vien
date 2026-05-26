# Runbook Docker

## Dev stack

```bash
docker compose --env-file .env.dev.example -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

Mặc định mở:

- Web Vite: `http://localhost:7311`
- API: `http://localhost:7310`
- PostgreSQL: `localhost:55432`
- Valkey: `localhost:56379`
- MinIO console: `http://localhost:59001`

## Bật FHIR và PACS khi cần

Chỉ bật khi demo liên thông hoặc ảnh y khoa:

```bash
docker compose --env-file .env.dev.example -f docker-compose.yml -f docker-compose.dev.yml --profile interop --profile imaging up -d --build
```

Khi đó có thêm:

- HAPI FHIR: `http://localhost:8090`
- Orthanc: `http://localhost:8042`

## Prod-like smoke

```bash
docker compose --env-file .env.prod.example -f docker-compose.yml -f docker-compose.prod.yml up -d --build --wait postgres valkey minio api web
curl -fsS http://localhost:7310/health
curl -fsS http://localhost:8080/health
curl -fsS http://localhost:8080/api/v1/patients
docker compose --env-file .env.prod.example -f docker-compose.yml -f docker-compose.prod.yml down -v --remove-orphans
```

## Validate compose

```bash
pnpm compose:config
```

## Lưu ý bảo mật

- Không dùng `.env.prod.example` cho production thật.
- Network `backend` là internal, chỉ web và API được đưa ra ngoài qua network `frontend`.
- HAPI FHIR và Orthanc đang ở profile riêng để tránh vô tình bật dịch vụ nặng hoặc chưa có xác thực.

