# Changelog

Tất cả thay đổi đáng chú ý của dự án sẽ được ghi tại đây.

Định dạng dựa trên Keep a Changelog và version dùng Semantic Versioning.

## [Unreleased]

### Added

- Bổ sung rate limit cấu hình được cho `POST /api/v1/auth/login`, trả `429 AUTH_RATE_LIMITED` kèm `Retry-After` khi vượt ngưỡng thử đăng nhập.
- Bổ sung Valkey-backed rate limit store cho đăng nhập để chia sẻ bộ đếm giữa nhiều API replica và tránh lưu raw username trong rate-limit key.
- Bổ sung readiness check cho kho rate limit đăng nhập để `/ready` trả `503 not_ready` khi Valkey không sẵn sàng.
- Bổ sung kiểm tra mật khẩu demo bằng hash `scrypt`, dummy hash cho username không tồn tại và `requestId` cho các lỗi auth trọng tâm.
- Chặn khởi động production nếu `BVS_AUTH_SECRET` thiếu hoặc ngắn hơn 32 ký tự.
- Chặn khởi động production nếu `BVS_AUTH_SECRET` vẫn là placeholder/dev-only secret, đồng thời tách env CI prod-like khỏi `.env.prod.example`.
- Chặn production API mở PostgreSQL pool nếu `DATABASE_URL` vẫn chứa credential mẫu/dev.
- Bổ sung cấu hình `BVS_AUTH_TOKEN_TTL_SECONDS` cho thời hạn token demo và validation khoảng hợp lệ `300`-`28800` giây lúc khởi động.
- Siết xác minh token demo bằng kiểm tra `iat`/`exp`, giới hạn thời lượng token đã ký và thêm `WWW-Authenticate: Bearer` cho endpoint kiểm tra phiên không hợp lệ.
- Bổ sung guard kích thước và định dạng base64url cho token demo trước khi xác minh sâu.
- Bổ sung `requestId` cho lỗi phân quyền chung và `WWW-Authenticate: Bearer` cho phản hồi `401 UNAUTHENTICATED`.
- Chuẩn hóa lỗi validation payload của endpoint đăng nhập và endpoint nghiệp vụ về envelope `400 VALIDATION_ERROR`.
- Bổ sung response guard tự gắn `requestId` cho lỗi JSON thủ công có trường `error`, đồng thời giữ nguyên payload FHIR `OperationOutcome`.
- Bổ sung CSP chặt cho web runtime Nginx và harness kiểm tra security header để giảm rủi ro XSS/nhúng ngoài ý muốn.
- Bổ sung `Cache-Control: no-store` và `Pragma: no-cache` cho API responses để giảm rủi ro cache dữ liệu bệnh án.
- Bổ sung error handler tập trung cho API, chuẩn hóa lỗi validation/nội bộ, kèm `requestId` và không lộ stack trace cho client.
- Bổ sung kiểm tra `x-request-id` upstream, chỉ nhận trace ID ngắn với ký tự an toàn và tự sinh UUID mới khi header không hợp lệ.
- Bổ sung `X-Request-Id` cho response API và lưu request ID vào metadata audit event để hỗ trợ trace correlation.
- Bổ sung HTTP security headers nền tảng cho API Fastify và web Nginx.
- Siết validation `BVS_CORS_ORIGINS` ở production, chỉ chấp nhận Origin HTTPS canonical và chặn wildcard/HTTP/path.
- Bổ sung `BVS_CORS_ORIGINS` và chặn khởi động production nếu chưa cấu hình Origin được phép.
- Bổ sung checksum SHA-256 cho `schema_migrations` để phát hiện migration đã áp dụng bị sửa nội dung.
- Bổ sung cấu hình `BVS_POSTGRES_REPOSITORY_POOL_MAX` và đóng vòng đời repository PostgreSQL khi Fastify shutdown để giảm rủi ro rỉ kết nối trong Docker/dev-prod.
- Bổ sung FHIR `OperationOutcome` cho các lỗi trọng tâm của facade FHIR, gồm domain builder, API response helper, content type `application/fhir+json`, test, harness smoke và tài liệu API.
- Bổ sung metadata toàn vẹn cho tệp tài liệu bệnh án, gồm MIME type, dung lượng, SHA-1 Base64, thời điểm tạo tệp, validation đầu vào, migration PostgreSQL và ánh xạ sang FHIR `DocumentReference.content.attachment`.
- Bổ sung FHIR `Provenance` cho tài liệu bệnh án đã ký, gồm mapper, API export, UI preview, audit action, CapabilityStatement, test và harness smoke.
- Bổ sung workflow thu hồi consent chia sẻ hồ sơ, gồm domain state, API revoke, PostgreSQL columns, RBAC/audit, UI Interop, test và harness smoke chặn xuất/chuyển hồ sơ sau khi thu hồi.
- Bổ sung FHIR `Consent`, gồm mapper, API export, nhúng consent vào Bundle/document Bundle, UI preview, RBAC/audit, test và harness smoke.
- Bổ sung FHIR `AuditEvent` Bundle cho kiểm toán, gồm mapper, API export theo bệnh nhân, quyền `audit-event:fhir-export`, UI Audit preview, test và harness smoke.
- Bổ sung FHIR `CapabilityStatement` metadata để facade công bố các resource R4 đang hỗ trợ và giả định bảo mật của prototype.
- Bổ sung endpoint readiness `/ready` kiểm tra repository bệnh nhân và Provider Directory, đồng thời chuyển Docker API healthcheck sang readiness.
- Bổ sung vòng đời gửi/nhận cho `RecordTransfer`, gồm API `send`/`receive`, RBAC, audit, UI action và FHIR `Task.executionPeriod`.
- Bổ sung chuỗi băm kiểm tra toàn vẹn `AuditEvent`, gồm domain sealing/verification, PostgreSQL columns, API `/audit-integrity`, UI Audit, test và harness smoke.
- Bổ sung `RecordTransfer` cho gói chuyển hồ sơ liên viện, gồm domain model, API, PostgreSQL migration, UI Interop, FHIR `Task`, RBAC/audit, test và harness smoke.
- Bổ sung FHIR `Procedure` cho thủ thuật/hoạt động đã thực hiện, gồm domain model, mapper, API, PostgreSQL migration, UI workspace, RBAC/audit, test và harness smoke.
- Bổ sung FHIR `MedicationDispense` cho cấp phát thuốc, gồm domain model, mapper, API, PostgreSQL migration, UI workspace, RBAC/audit, Bundle/document Bundle, test và harness smoke.
- Bổ sung FHIR `MedicationAdministration` cho lần dùng thuốc thực tế, gồm domain model, mapper, API, PostgreSQL migration, UI workspace, RBAC/audit, Bundle/document Bundle, test và harness smoke.

## [0.2.0] - 2026-05-26

### Added

- Bổ sung Docker base/dev/prod cho API, web, PostgreSQL, Valkey, MinIO, HAPI FHIR và Orthanc.
- Bổ sung migration SQL, PostgreSQL Patient Repository, bảng `patients`, `clinical_documents`, `audit_events`.
- Bổ sung GitHub Actions CI, release image lên GHCR, Dependabot, PR template, issue templates và CODEOWNERS.
- Bổ sung AGENTS.md, CLAUDE.md, CodeRabbit config và context theo thư mục.
- Bổ sung harness smoke test ánh xạ domain `Patient` sang FHIR `Patient`.
- Bổ sung unit test domain ban đầu.

## [0.1.0] - 2026-05-26

### Added

- Khởi tạo monorepo TypeScript theo hướng modular monolith DDD.
- Bổ sung API Fastify, web React/Vite, domain package và contracts package.
- Bổ sung tài liệu kiến trúc, chuẩn tham chiếu, roadmap và glossary.
