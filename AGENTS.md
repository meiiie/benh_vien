# AGENTS.md

> Last updated: 2026-05-26 | Version: 0.2.0 | Status: Architecture prototype with Docker/CI harness

Tài liệu này là ngữ cảnh bắt buộc cho Codex, Claude Code và các agent khi làm việc trong repo. Giữ ngắn, rõ, cập nhật khi runtime hoặc quy ước thay đổi.

## Quick Start

```bash
pnpm install
pnpm run ci
```

Chạy API và web cục bộ không Docker:

```bash
pnpm dev:api
pnpm dev:web
```

Chạy Docker dev stack:

```bash
docker compose --env-file .env.dev.example -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

URL mặc định:

- Web: `http://localhost:7311`
- API health: `http://localhost:7310/health`
- API docs: `http://localhost:7310/docs`
- API versioned base: `http://localhost:7310/api/v1`
- HAPI FHIR nếu bật profile `interop`: `http://localhost:8090`
- Orthanc nếu bật profile `imaging`: `http://localhost:8042`

## Source Of Truth

- Kiến trúc: `docs/ARCHITECTURE.md`
- Chuẩn y tế: `docs/STANDARDS.md`
- Thuật ngữ: `docs/GLOSSARY.md`
- Roadmap: `docs/ROADMAP.md`
- Docker: `docs/runbooks/DOCKER.md`
- Testing/harness: `harness/README.md`
- Versioning: `VERSIONING.md`

## Architecture Rules

- Khởi đầu bằng modular monolith theo DDD, không tách microservice khi chưa có lý do vận hành thật.
- `packages/domain` chứa domain model thuần, không phụ thuộc Fastify, React, database hay Docker.
- `packages/contracts` chứa schema request/response dùng chung, ưu tiên Zod.
- `apps/api` là adapter HTTP và orchestration nhẹ, không để business rule phình trong route handler.
- `apps/web` là giao diện demo, không quyết định nghiệp vụ.
- `migrations/` là source of truth cho schema PostgreSQL; không để API tự tạo schema ngoài migration.
- FHIR là lớp liên thông, không phải toàn bộ database nội bộ.
- PACS/DICOM xử lý ảnh y khoa; EMR chỉ lưu metadata và liên kết cần thiết.

## Healthcare Domain Rules

- Không dùng lẫn HIS, LIS, PACS, EMR, EHR nếu chưa giải thích rõ.
- Khi nói “chuyển bệnh án giữa bệnh viện”, luôn nghĩ tới định danh bệnh nhân, metadata tài liệu, quyền truy cập, audit trail và chuẩn trao đổi.
- Dữ liệu bệnh án là dữ liệu nhạy cảm: mọi luồng xem/sửa/ký/chia sẻ phải thiết kế được audit.
- Tiếng Việt có dấu trong tài liệu và UI. Tiếng Anh chỉ giữ khi là tên chuẩn, protocol, library, code identifier hoặc thuật ngữ đã được chú thích.

## Commands

```bash
pnpm check              # TypeScript check
pnpm test               # Unit tests
pnpm build              # Build all apps/packages
pnpm harness:smoke      # FHIR mapping smoke test
pnpm compose:config     # Validate dev/prod Docker Compose
pnpm run ci             # Full local gate
```

## Git Workflow

- Nhánh chính: `main`.
- Nhánh làm việc: `feature/*`, `fix/*`, `docs/*`, `chore/*`.
- Commit theo Conventional Commits: `feat(api): add patient registry endpoint`.
- Không push thẳng vào `main` khi repo đã có branch protection.
- Mọi thay đổi runtime, API, Docker, chuẩn y tế hoặc quy tắc agent phải cập nhật docs tương ứng.

## Common Mistakes

- Đừng bật HAPI FHIR/Orthanc nếu mục tiêu chỉ là sửa domain/API.
- Đừng lưu ảnh y khoa trong PostgreSQL như blob mặc định.
- Đừng tạo microservice mới chỉ để “trông enterprise”.
- Đừng trả dữ liệu bệnh án dư thừa qua API.
- Đừng sửa generated files trong `dist/`, `node_modules/`, coverage hoặc lockfile nếu không có thay đổi dependency.
