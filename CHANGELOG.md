# Changelog

Tất cả thay đổi đáng chú ý của dự án sẽ được ghi tại đây.

Định dạng dựa trên Keep a Changelog và version dùng Semantic Versioning.

## [Unreleased]

### Added

- Bổ sung FHIR `Procedure` cho thủ thuật/hoạt động đã thực hiện, gồm domain model, mapper, API, PostgreSQL migration, UI workspace, RBAC/audit, test và harness smoke.

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
