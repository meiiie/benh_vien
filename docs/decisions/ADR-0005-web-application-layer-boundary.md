# ADR-0005: Tách application composition khỏi presentation trong web client

## Trạng thái

Chấp nhận.

## Ngày

2026-06-01. Quyết định này phản ánh đợt rà soát kiến trúc theo mục tiêu cập nhật đến ngày 30/05/2026.

## Bối cảnh

Web client của WiiiCare Nexus không chỉ hiển thị màn hình. Nó đang điều phối nhiều luồng nhạy cảm của hồ sơ bệnh án điện tử: đăng nhập, chọn bệnh nhân, tải hồ sơ, tạo dữ liệu lâm sàng, xuất FHIR, xem audit trail, kiểm consent và gửi gói chuyển hồ sơ. Nếu các luồng này nằm trực tiếp trong `App.tsx` hoặc trong các trang UI, frontend rất dễ biến thành một "God component": khó đọc, khó kiểm thử, khó tách module và khó giải thích khi mở rộng sang nhiều bệnh viện.

HL7 FHIR R4 tổ chức đặc tả theo các module chức năng như Foundation, Security & Privacy, Administration, Clinical, Diagnostics, Medications và Workflow; phần Security của FHIR cũng nhấn mạnh authentication, authorization/access control, audit, digital signature, attachment, label và input validation là mối quan tâm xuyên suốt khi trao đổi dữ liệu y tế. OWASP ASVS 5.0.0 là baseline để kiểm chứng bảo mật ứng dụng web/API. Hướng dẫn DDD/microservice của Microsoft khuyến nghị thiết kế quanh business capability và bounded context, không quanh lớp kỹ thuật ngang như "data access" hoặc "messaging".

Vì vậy, web client cần một lớp application composition rõ ràng: không phải domain core, nhưng là nơi nối state, loader, command handler, effect và panel context theo ranh giới nghiệp vụ.

## Quyết định

Giữ cấu trúc web client theo ranh giới sau:

- `apps/web/src/pages`: chỉ chứa route/page renderer và composition rất mỏng cho layout hiển thị.
- `apps/web/src/application`: chứa application composition của frontend, gồm loader wiring, command/handler wiring, derived context, runtime effect, shell state và panel context.
- `apps/web/src/features`: chứa UI panel, API adapter, selector, command builder và helper thuộc về từng feature như Patient Registry, Clinical Records, Clinical Documents, Audit, Consent, Provider Directory và Record Transfer.
- `apps/web/src/api`, `apps/web/src/auth`, `apps/web/src/lib`, `apps/web/src/types` và `apps/web/src/config`: chứa hạ tầng client, xác thực, helper dùng chung, kiểu dữ liệu và cấu hình demo.

`App.tsx` được phép làm nhiệm vụ khởi tạo state cấp ứng dụng, tạo API client, gọi các composition function trong `application`, dựng auth gate và chuyển context cho route renderer. `App.tsx` không được chứa direct `fetch`, không gọi `clinicalApi.requestJson` trực tiếp, không hard-code HTTP route nghiệp vụ, không chứa mapper FHIR và không gom ma trận setter/handler của từng feature vào cùng một chỗ.

Harness `scripts/harness/web-app-composition.mjs` là rào kiểm chứng tối thiểu cho quyết định này: bắt buộc các module composition nằm trong `apps/web/src/application`, chặn direct fetch ngoài `clinicalApi.ts`, chặn HTTP route nghiệp vụ trong `App.tsx`, và giữ ngân sách dòng của `App.tsx`.

## Hệ quả

- Frontend trở thành modular monolith ở tầng UI/application, phù hợp hướng DDD hiện tại mà chưa cần tách micro-frontend.
- Các luồng nhạy cảm như consent, audit, FHIR preview và record transfer có điểm nối rõ ràng, dễ kiểm tra trước khi mở rộng.
- Khi cần tách service hoặc thay backend, feature adapter và application composition là điểm đổi chính; page renderer ít bị ảnh hưởng.
- Đổi lại, số file tăng lên và người mới cần đọc `docs/ARCHITECTURE.md`, ADR này và harness để hiểu ranh giới.
- Không tạo abstraction chỉ để "đẹp kiến trúc"; mỗi module application phải có lý do rõ: giảm coupling, bảo vệ boundary hoặc gom orchestration có thật.

## Cách kiểm chứng

- Chạy `node scripts/harness/web-app-composition.mjs`.
- Chạy `pnpm --filter @benh-vien-so/web check`.
- Chạy `pnpm run ci` trước khi merge hoặc khi thay đổi boundary lớn.
- Khi review PR, nếu logic HTTP/FHIR/consent/audit quay lại `App.tsx` hoặc `pages`, cần yêu cầu chuyển về feature/application module phù hợp.

## Tài liệu tham khảo

- HL7 FHIR R4 - Modules: https://hl7.org/fhir/R4/modules.html
- HL7 FHIR R4 - Security: https://hl7.org/fhir/R4/security.html
- OWASP Application Security Verification Standard 5.0.0: https://owasp.org/www-project-application-security-verification-standard/
- Microsoft Azure Architecture Center - Use domain analysis to model microservices: https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis
- Bộ Y tế - Thông tư 13/2025/TT-BYT hướng dẫn triển khai hồ sơ bệnh án điện tử: https://vbpl.vn/boyte/Pages/vbpq-toanvan.aspx?ItemID=178219
