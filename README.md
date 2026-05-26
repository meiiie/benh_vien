# WiiiCare Nexus

![WiiiCare Nexus social preview](docs/assets/github-social-preview.jpg)

**WiiiCare Nexus** là dự án nền tảng bệnh viện số do **HoLiLiHu** thuộc **The Wiii Lab** phát triển, tập trung vào hồ sơ bệnh án điện tử, liên thông dữ liệu y tế và kiến trúc mở cho EMR/FHIR/PACS.

Mục tiêu trước mắt là tạo một nền tảng monorepo đủ rõ ràng để trình bày, thử nghiệm và mở rộng; chưa giả định đây là phần mềm đạt điều kiện triển khai sản xuất tại bệnh viện.

Brand assets: [docs/BRAND.md](docs/BRAND.md).

## Định hướng kiến trúc

- Bắt đầu bằng **modular monolith theo DDD** để giữ tốc độ phát triển, giảm chi phí vận hành và vẫn có ranh giới nghiệp vụ rõ.
- Thiết kế các bounded context có thể tách thành microservice khi lưu lượng, đội ngũ hoặc yêu cầu triển khai thật sự cần.
- Lấy **HL7 FHIR R4** làm ngôn ngữ trao đổi dữ liệu y tế, **DICOM** cho ảnh y khoa, và các hồ sơ IHE như **MHD/PIXm** cho hướng liên thông tài liệu và định danh bệnh nhân.
- Ưu tiên bảo mật theo “least privilege”, nhật ký kiểm toán, phân quyền theo vai trò và sẵn sàng ký/xác nhận điện tử theo yêu cầu pháp lý.

## Cấu trúc chính

```text
apps/
  api/      API nghiệp vụ, FHIR facade và điểm tích hợp
  web/      Giao diện demo để giải thích luồng bệnh án điện tử
packages/
  domain/   Mô hình nghiệp vụ lõi theo DDD
  contracts/ Schema request/response dùng chung
infra/      Docker Compose cho hạ tầng thử nghiệm, không tự bật
docs/       Kiến trúc, chuẩn tham chiếu, quyết định kỹ thuật, roadmap
migrations/ SQL migration cho PostgreSQL
```

## Chạy kiểm tra

```bash
pnpm install
pnpm run ci
```

Khi cần chạy API sau khi đã cài dependency:

```bash
pnpm dev:api
```

Hạ tầng trong `infra/docker-compose.yml` chỉ là môi trường thí nghiệm. Không nên bật toàn bộ khi chưa xác định rõ mục tiêu demo.

## Docker dev/prod

```bash
docker compose --env-file .env.dev.example -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

Nếu cần bật thêm FHIR server và PACS:

```bash
docker compose --env-file .env.dev.example -f docker-compose.yml -f docker-compose.dev.yml --profile interop --profile imaging up -d --build
```

Chi tiết xem [docs/runbooks/DOCKER.md](docs/runbooks/DOCKER.md).

## Backend và cơ sở dữ liệu

Backend hiện dùng Fastify + TypeScript. Trong Docker, API chạy với `BVS_REPOSITORY=postgres`, migration service tạo schema PostgreSQL trước khi API khởi động. Các bảng nền tảng gồm `patients`, `clinical_documents`, `audit_events` và `schema_migrations`.

Khi chạy local không Docker, có thể dùng in-memory repository để phát triển nhanh; khi cần kiểm chứng sát thực tế, dùng Docker dev/prod để chạy PostgreSQL.

## GitHub và release

Repo đã được chuẩn bị cho GitHub Actions:

- CI: TypeScript check, test, build, harness smoke và Docker smoke.
- Release: tag `v*.*.*` sẽ build/push image API và web lên GHCR.
- Dependabot: kiểm tra npm, Dockerfile và GitHub Actions hằng tuần.
- Review context: `.coderabbit.yaml`, `AGENTS.md`, `CLAUDE.md`.

Chi tiết version xem [VERSIONING.md](VERSIONING.md).

## Phạm vi phiên bản đầu

- Quản lý hồ sơ bệnh nhân tối thiểu.
- Xuất biểu diễn bệnh nhân sang FHIR `Patient`.
- Chuẩn bị đường mở rộng sang hồ sơ lâm sàng, tài liệu bệnh án, hình ảnh y khoa và liên thông bệnh viện.
- Tài liệu hóa các quyết định kiến trúc để dễ bảo vệ trước thầy hoặc mở rộng thành đề tài lớn hơn.
