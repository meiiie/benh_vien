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

Compose sẽ chạy service `migrate` trước API để áp dụng SQL migration trong `migrations/`.

API giới hạn mỗi PostgreSQL repository pool bằng `BVS_POSTGRES_REPOSITORY_POOL_MAX`, mặc định `2`, và đóng các pool khi Fastify shutdown. Nếu chạy nhiều replica API, cần tính lại giá trị này theo `max_connections` của PostgreSQL.

API giới hạn tần suất `POST /api/v1/auth/login` bằng `BVS_AUTH_LOGIN_RATE_LIMIT_MAX` trong cửa sổ `BVS_AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS`, mặc định `20` lần trong `60` giây theo IP + username đã băm SHA-256. `BVS_RATE_LIMIT_STORE=valkey` và `BVS_VALKEY_URL=redis://valkey:6379` dùng chung bộ đếm giữa nhiều replica; `memory` chỉ phù hợp dev đơn lẻ.

Ở `NODE_ENV=production`, API yêu cầu `BVS_CORS_ORIGINS` là danh sách Origin được phép, phân tách bằng dấu phẩy. Không dùng wildcard cho production vì API xử lý dữ liệu bệnh án nhạy cảm.

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
docker compose --env-file .env.prod.example -f docker-compose.yml -f docker-compose.prod.yml up -d --build --wait postgres valkey minio migrate api web
curl -fsS http://localhost:7310/health
curl -fsS http://localhost:7310/ready
curl -fsS http://localhost:8080/health
curl -fsS http://localhost:8080/api/v1/patients
docker compose --env-file .env.prod.example -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres psql -U bvs -d benh_vien_so -c "select version, left(checksum_sha256, 12) as checksum_prefix from schema_migrations order by version;"
docker compose --env-file .env.prod.example -f docker-compose.yml -f docker-compose.prod.yml down -v --remove-orphans
```

`/health` là liveness check tối thiểu. `/ready` đọc repository bệnh nhân, Provider Directory và kho rate limit đăng nhập nên phù hợp hơn để xác nhận API có thể nhận traffic nghiệp vụ sau khi container khởi động.

Migration lưu `checksum_sha256` trong `schema_migrations`. Nếu một migration đã áp dụng bị sửa nội dung, service `migrate` sẽ dừng thay vì âm thầm chạy tiếp với lịch sử schema không còn đáng tin cậy.

## Validate compose

```bash
pnpm compose:config
```

## Lưu ý bảo mật

- Không dùng `.env.prod.example` cho production thật.
- Network `backend` là internal, chỉ web và API được đưa ra ngoài qua network `frontend`.
- HAPI FHIR và Orthanc đang ở profile riêng để tránh vô tình bật dịch vụ nặng hoặc chưa có xác thực.
