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

Ở `NODE_ENV=production`, API yêu cầu `BVS_CORS_ORIGINS` là danh sách Origin HTTPS canonical được phép, phân tách bằng dấu phẩy, ví dụ `https://wiiicare.example.vn`. Không dùng wildcard, URL có path hoặc Origin HTTP cho production vì API xử lý dữ liệu bệnh án nhạy cảm.

Ở `NODE_ENV=production`, API bắt buộc `BVS_REPOSITORY=postgres`. `in-memory` chỉ dành cho dev/test để tránh mất dữ liệu và tránh nhầm store demo thành môi trường vận hành thật.

Ở `NODE_ENV=production`, API cũng yêu cầu `BVS_AUTH_SECRET` tối thiểu 32 ký tự ngay khi khởi động và không chấp nhận giá trị mẫu như `change-me...` hoặc secret dev-only. Nếu thiếu secret hoặc dùng placeholder, container API sẽ dừng thay vì chờ tới request đăng nhập đầu tiên mới lỗi.

Ở `NODE_ENV=production`, đăng nhập demo mặc định bị tắt bằng `BVS_DEMO_AUTH_ENABLED=false`. Chỉ bật `BVS_DEMO_AUTH_ENABLED=true` cho phiên smoke/demo có kiểm soát; triển khai thật cần thay bằng IAM/SSO thay vì tài khoản demo hard-coded.

Ở `NODE_ENV=production`, `DATABASE_URL` cũng không được chứa mật khẩu mẫu/dev như `change-me...` hoặc `bvs_dev_password`. `.env.prod.example` cố ý dùng placeholder để nhắc thay secret trước khi vận hành thật; nếu dùng nguyên file này cho production, API sẽ dừng sớm thay vì mở pool PostgreSQL với thông tin đăng nhập yếu.

`BVS_AUTH_TOKEN_TTL_SECONDS` kiểm soát thời hạn token demo, mặc định `28800` giây và chỉ nhận giá trị từ `300` đến `28800`. Nếu cấu hình ngoài khoảng này, API sẽ dừng khi khởi động để tránh phiên đăng nhập quá dài hoặc quá ngắn ngoài ý muốn.

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
cp .env.prod.example .env.prod.local
sed -i 's|^BVS_AUTH_SECRET=.*|BVS_AUTH_SECRET=local-wiiicare-auth-secret-0123456789abcdef|g' .env.prod.local
sed -i 's|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=local_bvs_postgres_password|g' .env.prod.local
sed -i 's|^DATABASE_URL=.*|DATABASE_URL=postgresql://bvs:local_bvs_postgres_password@postgres:5432/benh_vien_so|g' .env.prod.local
sed -i 's|^MINIO_ROOT_PASSWORD=.*|MINIO_ROOT_PASSWORD=local_bvs_minio_password|g' .env.prod.local

docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml up -d --build --wait postgres valkey minio migrate api web
curl -fsS http://localhost:7310/health
curl -fsS http://localhost:7310/ready
curl -fsS http://localhost:8080/health

status=$(curl -sS -o /tmp/wiiicare-patients.json -w "%{http_code}" http://localhost:8080/api/v1/patients)
test "$status" = "401"
grep -q "UNAUTHENTICATED" /tmp/wiiicare-patients.json

status=$(curl -sS -o /tmp/wiiicare-demo-login.json -w "%{http_code}" \
  -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"practitioner-demo-001","password":"demo","role":"clinician"}')
test "$status" = "403"
grep -q "DEMO_AUTH_DISABLED" /tmp/wiiicare-demo-login.json

docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres psql -U bvs -d benh_vien_so -c "select version, left(checksum_sha256, 12) as checksum_prefix from schema_migrations order by version;"
docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml down -v --remove-orphans
```

`/health` là liveness check tối thiểu. `/ready` đọc repository bệnh nhân, Provider Directory và kho rate limit đăng nhập nên phù hợp hơn để xác nhận API có thể nhận traffic nghiệp vụ sau khi container khởi động.

Migration lưu `checksum_sha256` trong `schema_migrations`. Nếu một migration đã áp dụng bị sửa nội dung, service `migrate` sẽ dừng thay vì âm thầm chạy tiếp với lịch sử schema không còn đáng tin cậy.

Web runtime Nginx gắn CSP chặt cho SPA tại `/`, gồm `default-src 'self'`, `script-src 'self'`, `style-src 'self'`, `object-src 'none'` và `frame-ancestors 'none'`. CSP không áp cho `/docs` để Swagger UI được proxy từ API không bị chặn inline script/style của chính nó.

## Validate compose

```bash
pnpm compose:config
```

## Lưu ý bảo mật

- Không dùng `.env.prod.example` cho production thật; file này cố ý chứa placeholder để buộc người vận hành thay secret/mật khẩu trước khi boot production.
- Network `backend` là internal, chỉ web và API được đưa ra ngoài qua network `frontend`.
- CI kiểm tra cấu hình web security header bằng `pnpm run harness:web-security` và kiểm tra header thật khi boot prod-like stack.
- HAPI FHIR và Orthanc đang ở profile riêng để tránh vô tình bật dịch vụ nặng hoặc chưa có xác thực.
