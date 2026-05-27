# Changelog

Tất cả thay đổi đáng chú ý của dự án sẽ được ghi tại đây.

Định dạng dựa trên Keep a Changelog và version dùng Semantic Versioning.

## [Unreleased]

### Added

- Bổ sung workflow thu hồi consent chia sẻ hồ sơ, gồm domain state, API revoke, PostgreSQL columns, RBAC/audit, UI Interop, test và harness smoke chặn xuất/chuyển hồ sơ sau khi thu hồi.
- Bổ sung FHIR `Consent`, gồm mapper, API export, nhúng consent vào Bundle/document Bundle, UI preview, RBAC/audit, test và harness smoke.
- Bổ sung FHIR `AuditEvent` Bundle cho kiểm toán, gồm mapper, API export theo bệnh nhân, quyền `audit-event:fhir-export`, UI Audit preview, test và harness smoke.
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
