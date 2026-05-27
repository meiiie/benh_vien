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

## Luồng giao diện hiện có

Ứng dụng web hiện đã có luồng sản phẩm đầy đủ hơn thay vì chỉ một trang demo:

- `Landing`: giới thiệu WiiiCare Nexus, định vị EMR/FHIR và điều hướng vào phiên demo.
- `Login`: đăng nhập demo phát Bearer token nội bộ cho vai trò bác sĩ, điều dưỡng, kiểm toán hoặc quản trị; đây chưa phải IAM/SSO sản xuất.
- `Dashboard`: tổng quan số hồ sơ, lượt khám đang mở, dị ứng/cảnh báo, chẩn đoán/vấn đề sức khỏe, chỉ định dịch vụ, chỉ định thuốc, tài liệu nháp và hàng chờ thao tác.
- `Patient Workspace`: chọn bệnh nhân, xem định danh, mở/kết thúc lượt khám, ghi nhận dị ứng/cảnh báo, chẩn đoán, chỉ định xét nghiệm/hình ảnh/thủ thuật, chỉ số sinh hiệu/xét nghiệm, chỉ định thuốc, tạo tài liệu và xem FHIR theo hồ sơ.
- `Documents`: quản lý tài liệu bệnh án theo nhóm CCD/CCDA/CCR, lab report, medical record và referral.
- `Audit`: xem nhật ký thao tác nhạy cảm theo bệnh nhân, actor, mục đích sử dụng và tài nguyên.
- `Interop`: kiểm tra FHIR `Patient`, `Encounter`, `AllergyIntolerance`, `Condition`, `ServiceRequest`, `Observation`, `DiagnosticReport`, `ImagingStudy`, `MedicationRequest`, `DocumentReference`, `Composition`, `Bundle` và các hướng mở sang HIS/LIS/PACS.
- `Settings`: mô tả quyền demo, cấu hình vận hành và các việc cần thay bằng bảo mật thật khi lên production.

## Ảnh kiểm thử giao diện

![WiiiCare Nexus landing](docs/assets/screenshots/wiiicare-lms-style-landing.png)

![WiiiCare Nexus dashboard](docs/assets/screenshots/wiiicare-lms-style-dashboard.png)

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

Backend hiện dùng Fastify + TypeScript. Trong Docker, API chạy với `BVS_REPOSITORY=postgres`, migration service tạo schema PostgreSQL trước khi API khởi động. Các bảng nền tảng gồm `patients`, `encounters`, `allergy_intolerances`, `conditions`, `service_requests`, `observations`, `diagnostic_reports`, `imaging_studies`, `medication_requests`, `clinical_documents`, `consents`, `audit_events` và `schema_migrations`.

Khi chạy local không Docker, có thể dùng in-memory repository để phát triển nhanh; khi cần kiểm chứng sát thực tế, dùng Docker dev/prod để chạy PostgreSQL.

API nghiệp vụ yêu cầu đăng nhập qua `POST /api/v1/auth/login` và gửi `Authorization: Bearer <token>`. Biến `BVS_AUTH_SECRET` phải dài tối thiểu 32 ký tự; ở `NODE_ENV=production`, API sẽ từ chối khởi động nếu thiếu secret hợp lệ.

## GitHub và release

Repo đã được chuẩn bị cho GitHub Actions:

- CI: TypeScript check, test, build, harness smoke và Docker smoke.
- Release: tag `v*.*.*` sẽ build/push image API và web lên GHCR.
- Dependabot: kiểm tra npm, Dockerfile và GitHub Actions hằng tuần.
- Review context: `.coderabbit.yaml`, `AGENTS.md`, `CLAUDE.md`.

Chi tiết version xem [VERSIONING.md](VERSIONING.md).

## Phạm vi phiên bản đầu

- Quản lý hồ sơ bệnh nhân tối thiểu.
- Quản lý lượt khám/đợt điều trị tối thiểu để tài liệu bệnh án có ngữ cảnh lâm sàng.
- Xuất biểu diễn bệnh nhân sang FHIR `Patient`.
- Xuất lượt khám sang FHIR `Encounter`.
- Quản lý dị ứng/cảnh báo an toàn lâm sàng và xuất sang FHIR `AllergyIntolerance`.
- Quản lý chẩn đoán/vấn đề sức khỏe có cấu trúc và xuất sang FHIR `Condition`.
- Quản lý chỉ định xét nghiệm/chẩn đoán hình ảnh/thủ thuật và xuất sang FHIR `ServiceRequest`.
- Quản lý chỉ số sinh hiệu/xét nghiệm có cấu trúc và xuất sang FHIR `Observation`.
- Quản lý báo cáo kết quả xét nghiệm/chẩn đoán hình ảnh và xuất sang FHIR `DiagnosticReport`, có thể nối `basedOn` tới `ServiceRequest` và `result` tới `Observation`.
- Quản lý metadata ảnh y khoa/PACS tối thiểu và xuất sang FHIR `ImagingStudy`, gồm DICOM Study Instance UID, Accession Number, modality, series, số ảnh, vùng chụp và endpoint PACS/DICOMweb.
- Quản lý chỉ định thuốc/đơn thuốc tối thiểu và xuất sang FHIR `MedicationRequest`.
- Quản lý tài liệu bệnh án tối thiểu: tạo bản nháp, ký tài liệu và xuất metadata sang FHIR `DocumentReference`.
- Quản lý consent chia sẻ hồ sơ tối thiểu, gồm lưu consent theo bệnh nhân, đơn vị nhận và thời hạn hiệu lực.
- Xuất gói hồ sơ bệnh nhân sang FHIR `Bundle` dạng `collection` gồm Patient, Encounter, AllergyIntolerance, Condition, ServiceRequest, Observation, DiagnosticReport, ImagingStudy, MedicationRequest và DocumentReference; API chỉ cho xuất khi consent còn hiệu lực và khớp đơn vị nhận.
- Xuất gói tài liệu bệnh án sang FHIR `Bundle` dạng `document`, có `Composition` là entry đầu tiên để đóng vai trò mục lục lâm sàng cho hồ sơ chuyển viện/liên viện.
- Ghi nhật ký kiểm toán tối thiểu cho các thao tác xem/tạo/ký/xuất dữ liệu nhạy cảm.
- Chặn quyền tối thiểu ở API theo vai trò demo `clinician`, `nurse`, `auditor`, `admin`.
- Chuẩn bị đường mở rộng sang hồ sơ lâm sàng, hình ảnh y khoa và liên thông bệnh viện.
- Tài liệu hóa các quyết định kiến trúc để dễ bảo vệ trước thầy hoặc mở rộng thành đề tài lớn hơn.
