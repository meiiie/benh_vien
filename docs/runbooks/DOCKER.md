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

API giới hạn tần suất `POST /api/v1/auth/login` bằng `BVS_AUTH_LOGIN_RATE_LIMIT_MAX` trong cửa sổ `BVS_AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS`, mặc định `20` lần trong `60` giây theo IP + username đã băm SHA-256. `BVS_RATE_LIMIT_STORE=valkey` và `BVS_VALKEY_URL=redis://valkey:6379` dùng chung bộ đếm giữa nhiều replica; `memory` chỉ phù hợp dev đơn lẻ và bị từ chối trong production.

`BVS_RECORD_TRANSFER_DELIVERY_WORKER_ENABLED=false` là mặc định an toàn. Chỉ bật `true` khi endpoint FHIR nhận đã sẵn sàng, vì worker sẽ POST FHIR Bundle thật tới `targetEndpointAddress` trong Provider Directory. Các biến liên quan gồm `BVS_RECORD_TRANSFER_DELIVERY_WORKER_INTERVAL_SECONDS`, `BVS_RECORD_TRANSFER_DELIVERY_WORKER_LIMIT`, `BVS_RECORD_TRANSFER_DELIVERY_WORKER_TIMEOUT_SECONDS`, `BVS_RECORD_TRANSFER_DELIVERY_WORKER_RETRY_DELAY_SECONDS` và `BVS_RECORD_TRANSFER_DELIVERY_WORKER_RUN_IMMEDIATELY`.

`BVS_RECORD_TRANSFER_RETRY_WORKER_MAX_RETRY_COUNT` cũng là ngưỡng vận hành quan trọng. Khi một `RecordTransfer` ở trạng thái `failed`, đã đến `nextRetryAt` và `retryCount` còn dưới ngưỡng này, retry worker đưa gói về `ready` để delivery worker gửi lại. Khi `retryCount` đã chạm ngưỡng, worker chuyển gói sang `dead-lettered`, xóa lịch thử lại và ghi audit `record-transfer.dead-letter`; đội vận hành cần kiểm tra endpoint, consent, mạng hoặc cấu hình bên nhận trước khi tạo luồng xử lý tiếp theo.

Ở `NODE_ENV=production`, API yêu cầu `BVS_CORS_ORIGINS` là danh sách Origin HTTPS canonical được phép, phân tách bằng dấu phẩy, ví dụ `https://wiiicare.example.vn`. Không dùng wildcard, URL có path hoặc Origin HTTP cho production vì API xử lý dữ liệu bệnh án nhạy cảm.

Ở `NODE_ENV=production`, API yêu cầu `BVS_PUBLIC_API_BASE_URL` là URL HTTPS public của API, ví dụ `https://api.wiiicare.example.vn/api/v1`. Giá trị này được công bố trong FHIR `CapabilityStatement.implementation.url`, nên không được để mặc định `localhost` hoặc loopback.

Ở `NODE_ENV=production`, API bắt buộc `BVS_REPOSITORY=postgres`. `in-memory` chỉ dành cho dev/test để tránh mất dữ liệu và tránh nhầm store demo thành môi trường vận hành thật.

Ở `NODE_ENV=production`, API cũng yêu cầu `BVS_AUTH_SECRET` tối thiểu 32 ký tự ngay khi khởi động và không chấp nhận giá trị mẫu như `change-me...` hoặc secret dev-only. Nếu thiếu secret hoặc dùng placeholder, container API sẽ dừng thay vì chờ tới request đăng nhập đầu tiên mới lỗi.

`BVS_HTTP_BODY_LIMIT_BYTES` giới hạn request body JSON ở API, mặc định `1048576` byte. Chỉ tăng giá trị này khi có lý do vận hành rõ ràng; tài liệu/ảnh thật nên đi qua object storage hoặc luồng upload chuyên dụng, không gửi binary lớn trong JSON.

Ở `NODE_ENV=production`, callback xác nhận nhận hồ sơ nên dùng `BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON` để cấu hình secret riêng theo key id gateway, ví dụ `{"gateway-hai-phong-referral":"..."}`. Gateway bệnh viện nhận phải gửi `x-wiiicare-callback-key-id`, `x-wiiicare-callback-timestamp` và `x-wiiicare-callback-signature`; chữ ký là `HMAC-SHA256` trên chuỗi `$TIMESTAMP.$TRANSFER_ID.$CANONICAL_JSON_BODY`, với object key được sắp xếp ổn định, và chỉ được lệch tối đa 5 phút. `BVS_RECORD_TRANSFER_CALLBACK_SECRET` vẫn là fallback cho môi trường chỉ có một gateway.

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

Prod-like compose chỉ publish web edge (`APP_HTTP_PORT`, mặc định `8080`). API không publish trực tiếp ra host; health/readiness của API được kiểm tra từ bên trong container để giữ ranh giới backend nội bộ.

```bash
cp .env.prod.example .env.prod.local
sed -i 's|^BVS_AUTH_SECRET=.*|BVS_AUTH_SECRET=local-wiiicare-auth-secret-0123456789abcdef|g' .env.prod.local
sed -i 's|^BVS_RECORD_TRANSFER_CALLBACK_SECRET=.*|BVS_RECORD_TRANSFER_CALLBACK_SECRET=local-wiiicare-callback-secret-0123456789abcdef|g' .env.prod.local
sed -i 's|^BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON=.*|BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON={"gateway-hai-phong-referral":"local-wiiicare-callback-secret-0123456789abcdef"}|g' .env.prod.local
sed -i 's|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=local_bvs_postgres_password|g' .env.prod.local
sed -i 's|^DATABASE_URL=.*|DATABASE_URL=postgresql://bvs:local_bvs_postgres_password@postgres:5432/benh_vien_so|g' .env.prod.local
sed -i 's|^MINIO_ROOT_PASSWORD=.*|MINIO_ROOT_PASSWORD=local_bvs_minio_password|g' .env.prod.local

docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml up -d --build --wait postgres valkey minio migrate api web
docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml exec -T api wget -qO- http://127.0.0.1:7310/health
docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml exec -T api wget -qO- http://127.0.0.1:7310/ready > /tmp/wiiicare-ready.json
node <<'NODE'
const fs = require("node:fs");
const ready = JSON.parse(fs.readFileSync("/tmp/wiiicare-ready.json", "utf8"));
if (ready.status !== "ready") {
  throw new Error("API is not ready: " + ready.status);
}
if (ready.repository !== "postgres") {
  throw new Error("Expected postgres repository, received " + ready.repository);
}
for (const [name, check] of Object.entries(ready.checks ?? {})) {
  if (check.status !== "ok") {
    throw new Error(`Readiness check ${name} is not ok: ${check.status}`);
  }
}
if (ready.checks?.loginRateLimit?.store !== "valkey") {
  throw new Error("Expected Valkey-backed login rate limit store.");
}
NODE
curl -fsS http://localhost:8080/health
curl -fsS http://localhost:8080/api/v1/fhir/metadata -o /tmp/wiiicare-fhir-metadata.json
node <<'NODE'
const fs = require("node:fs");
const metadata = JSON.parse(fs.readFileSync("/tmp/wiiicare-fhir-metadata.json", "utf8"));
if (metadata.resourceType !== "CapabilityStatement") {
  throw new Error("Expected CapabilityStatement");
}
if (metadata.implementation?.url !== "https://api.wiiicare.example.vn/api/v1") {
  throw new Error("Unexpected implementation.url: " + metadata.implementation?.url);
}
NODE

status=$(curl -sS -o /tmp/wiiicare-patients.json -w "%{http_code}" http://localhost:8080/api/v1/patients)
test "$status" = "401"
grep -q "UNAUTHENTICATED" /tmp/wiiicare-patients.json

status=$(curl -sS -o /tmp/wiiicare-demo-login.json -w "%{http_code}" \
  -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"practitioner-demo-001","password":"demo","role":"clinician"}')
test "$status" = "403"
grep -q "DEMO_AUTH_DISABLED" /tmp/wiiicare-demo-login.json

cp .env.prod.local .env.prod.local.auth-smoke
sed -i 's|^BVS_DEMO_AUTH_ENABLED=.*|BVS_DEMO_AUTH_ENABLED=true|g' .env.prod.local.auth-smoke
docker compose --env-file .env.prod.local.auth-smoke -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps --force-recreate api
for attempt in $(seq 1 30); do
  if docker compose --env-file .env.prod.local.auth-smoke -f docker-compose.yml -f docker-compose.prod.yml exec -T api wget -qO- http://127.0.0.1:7310/ready >/tmp/wiiicare-ready-auth-smoke.json; then
    break
  fi
  sleep 2
done
BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON='{"gateway-hai-phong-referral":"local-wiiicare-callback-secret-0123456789abcdef"}' \
BVS_RECORD_TRANSFER_CALLBACK_KEY_ID=gateway-hai-phong-referral \
WIIICARE_SMOKE_BASE_URL=http://localhost:8080/api/v1 node scripts/harness/authenticated-api-smoke.mjs

docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres psql -U bvs -d benh_vien_so -c "select version, left(checksum_sha256, 12) as checksum_prefix from schema_migrations order by version;"
expected_migrations=$(find migrations -maxdepth 1 -name '*.sql' | wc -l | tr -d ' ')
actual_migrations=$(docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres psql -U bvs -d benh_vien_so -Atc "select count(*) from schema_migrations;")
test "$actual_migrations" = "$expected_migrations"
missing_checksums=$(docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres psql -U bvs -d benh_vien_so -Atc "select count(*) from schema_migrations where checksum_sha256 is null or checksum_sha256 = '';")
test "$missing_checksums" = "0"
docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres psql -U bvs -d benh_vien_so -Atc "
with expected(table_name) as (
  values
    ('patients'),
    ('encounters'),
    ('allergy_intolerances'),
    ('conditions'),
    ('service_requests'),
    ('workflow_tasks'),
    ('procedures'),
    ('observations'),
    ('diagnostic_reports'),
    ('imaging_studies'),
    ('medication_requests'),
    ('medication_dispenses'),
    ('medication_administrations'),
    ('clinical_documents'),
    ('consents'),
    ('record_transfers'),
    ('record_transfer_delivery_attempts'),
    ('provider_directory_resources'),
    ('audit_events'),
    ('schema_migrations')
)
select table_name
from expected
except
select table_name
from information_schema.tables
where table_schema = 'public';
" | tee /tmp/missing-wiiicare-tables.txt
test ! -s /tmp/missing-wiiicare-tables.txt
docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml down -v --remove-orphans
```

`/health` là liveness check tối thiểu. `/ready` đọc repository bệnh nhân, Provider Directory và kho rate limit đăng nhập nên phù hợp hơn để xác nhận API có thể nhận traffic nghiệp vụ sau khi container khởi động.

Migration lưu `checksum_sha256` trong `schema_migrations`. Nếu một migration đã áp dụng bị sửa nội dung, service `migrate` sẽ dừng thay vì âm thầm chạy tiếp với lịch sử schema không còn đáng tin cậy.

Web runtime Nginx gắn CSP chặt cho SPA tại `/`, gồm `default-src 'self'`, `script-src 'self'`, `style-src 'self'`, `object-src 'none'` và `frame-ancestors 'none'`. CSP không áp cho `/docs` để Swagger UI không bị chặn inline script/style của chính nó khi docs được bật. Web edge cũng tắt `server_tokens`, gửi thêm `Cross-Origin-Opener-Policy`, `Strict-Transport-Security` và chuyển tiếp `X-Request-Id` xuống API để giữ trace correlation. Trong production, API mặc định không đăng ký `/docs`; chỉ đặt `BVS_API_DOCS_ENABLED=true` cho môi trường nội bộ hoặc phiên demo có kiểm soát.

## Validate compose

```bash
pnpm compose:config
```

## Lưu ý bảo mật

- Không dùng `.env.prod.example` cho production thật; file này cố ý chứa placeholder để buộc người vận hành thay secret/mật khẩu trước khi boot production.
- Network `backend` là internal, chỉ web và API được đưa ra ngoài qua network `frontend`.
- CI kiểm tra cấu hình web security header bằng `pnpm run harness:web-security` và kiểm tra header thật khi boot prod-like stack.
- HAPI FHIR và Orthanc đang ở profile riêng để tránh vô tình bật dịch vụ nặng hoặc chưa có xác thực.
