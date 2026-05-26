# ADR-0004: RBAC Tối Thiểu Ở Biên API

## Trạng Thái

Accepted.

## Bối Cảnh

Sau khi đã có audit trail, hệ thống vẫn chưa đủ an toàn nếu mọi actor đều có thể gọi mọi API. Với EMR/EHR, quyền truy cập phải được kiểm soát ở backend, không chỉ ẩn nút trên giao diện. Lát cắt hiện tại chưa triển khai đăng nhập thật, nhưng vẫn cần một policy tối thiểu để chứng minh hướng thiết kế đúng.

## Quyết Định

Thêm access-control domain với các vai trò demo:

- `clinician`: thực hiện nghiệp vụ điều trị, tạo bệnh nhân, tạo/ký tài liệu và xuất FHIR phục vụ điều trị.
- `nurse`: đọc bệnh nhân, đọc/tạo tài liệu, nhưng không ký và không xuất FHIR.
- `auditor`: đọc hồ sơ tối thiểu và đọc audit trail khi `purposeOfUse` là `AUDIT`.
- `admin`: có toàn quyền trong prototype.

API đọc actor từ các header demo:

- `x-actor-id`
- `x-actor-role`
- `x-purpose-of-use`

Nếu role/purpose không phù hợp, API trả `403 FORBIDDEN` trước khi đọc hoặc ghi dữ liệu nghiệp vụ.

## Hệ Quả

Tích cực:

- Quyền được chặn ở backend, không phụ thuộc vào UI.
- Audit event ghi thêm `actorRole` trong metadata.
- UI trình bày rõ policy demo: `clinician/TREATMENT` cho nghiệp vụ và `auditor/AUDIT` cho kiểm toán.
- Harness smoke test kiểm cả trường hợp được phép và bị chặn.

Giới hạn còn lại:

- Header demo chưa phải xác thực thật, có thể bị giả mạo nếu không có gateway/IAM phía trước.
- Chưa có token, session, passwordless/MFA, hay kiểm soát theo phòng ban/cơ sở y tế.
- Chưa có phân quyền theo từng bệnh nhân hoặc consent.

## Bước Tiếp Theo

1. Thay header demo bằng JWT/session do IAM phát hành.
2. Thêm policy theo organization, khoa/phòng và quan hệ điều trị.
3. Thêm consent trước khi chia sẻ hồ sơ sang bệnh viện khác.
