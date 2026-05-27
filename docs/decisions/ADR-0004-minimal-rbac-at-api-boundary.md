# ADR-0004: RBAC Tối Thiểu Ở Biên API

## Trạng Thái

Accepted.

## Bối Cảnh

Sau khi đã có audit trail, hệ thống vẫn chưa đủ an toàn nếu mọi actor đều có thể gọi mọi API. Với EMR/EHR, quyền truy cập phải được kiểm soát ở backend, không chỉ ẩn nút trên giao diện. Lát cắt hiện tại chưa triển khai IAM/SSO thật, nhưng vẫn cần một policy tối thiểu để chứng minh hướng thiết kế đúng.

## Quyết Định

Thêm access-control domain với các vai trò demo:

- `clinician`: thực hiện nghiệp vụ điều trị, tạo bệnh nhân, mở lượt khám, ghi nhận chỉ số, tạo/ký tài liệu và xuất FHIR phục vụ điều trị.
- `nurse`: đọc bệnh nhân, đọc/tạo tài liệu, ghi nhận chỉ số, nhưng không ký và không xuất FHIR.
- `auditor`: đọc hồ sơ tối thiểu và đọc audit trail khi `purposeOfUse` là `AUDIT`.
- `admin`: có toàn quyền trong prototype.

API đọc actor từ Bearer token nội bộ do `POST /api/v1/auth/login` phát hành. Token được ký bằng `BVS_AUTH_SECRET` và có thời hạn ngắn trong prototype.

API vẫn đọc `x-purpose-of-use` để xác định mục đích sử dụng dữ liệu:

- `TREATMENT`: thao tác điều trị và xuất FHIR phục vụ điều trị.
- `AUDIT`: xem nhật ký kiểm toán.
- `OPERATIONS`: dự phòng cho vận hành, chưa mở rộng trong lát cắt hiện tại.

Nếu role/purpose không phù hợp, API trả `403 FORBIDDEN` trước khi đọc hoặc ghi dữ liệu nghiệp vụ.

## Hệ Quả

Tích cực:

- Quyền được chặn ở backend, không phụ thuộc vào UI.
- Audit event ghi thêm `actorRole` trong metadata.
- UI trình bày rõ policy demo: `clinician/TREATMENT` cho nghiệp vụ và `auditor/AUDIT` cho kiểm toán.
- Harness smoke test kiểm cả phiên token, FHIR, audit event và trường hợp RBAC được phép/bị chặn.

Giới hạn còn lại:

- Phiên demo chưa phải IAM/SSO thật, chưa có MFA, rotation, revoke-list hoặc refresh token.
- Tài khoản demo chưa dùng password hashing/database user store.
- Chưa có phân quyền theo từng bệnh nhân, khoa/phòng hoặc quan hệ điều trị; consent chia sẻ liên viện mới là lát cắt tối thiểu.

## Bước Tiếp Theo

1. Thay token nội bộ bằng JWT/session do IAM phát hành.
2. Thêm policy theo organization, khoa/phòng và quan hệ điều trị.
3. Mở rộng consent sang thu hồi, người đại diện hợp pháp và ràng buộc theo loại dữ liệu được chia sẻ.
