# ADR-0003: Audit Trail Trước Khi Mở Rộng Dữ Liệu Nhạy Cảm

## Trạng Thái

Accepted.

## Bối Cảnh

WiiiCare Nexus đang đi theo hướng EMR/EHR liên thông. Khi hệ thống bắt đầu có bệnh nhân, tài liệu bệnh án, ký tài liệu và xuất FHIR, rủi ro không còn nằm ở giao diện demo nữa mà nằm ở việc không biết ai đã xem, tạo, ký hoặc xuất dữ liệu.

Trong các hệ thống y tế, audit trail là lớp nền để truy vết truy cập, hỗ trợ điều tra sự cố, giải trình với đơn vị vận hành và chuẩn bị cho các yêu cầu bảo vệ dữ liệu. Nếu tiếp tục thêm dữ liệu lâm sàng mà chưa có audit, nguyên mẫu sẽ lệch khỏi cách vận hành thực tế của một EMR chuyên nghiệp.

## Quyết Định

Bổ sung `AuditEvent` như một bounded context tối thiểu trước khi mở rộng sang các phần nhạy cảm hơn:

- Ghi audit khi tải danh sách bệnh nhân, tạo bệnh nhân, xem/xuất FHIR Patient.
- Ghi audit khi đọc Provider Directory và xuất FHIR Provider Directory/Endpoint để truy vết danh bạ liên thông.
- Ghi audit khi tải, tạo, xem và xuất FHIR AllergyIntolerance cho dị ứng/cảnh báo an toàn lâm sàng.
- Ghi audit khi tải, tạo, xem và xuất FHIR Condition cho chẩn đoán/vấn đề sức khỏe.
- Ghi audit khi tải, tạo, xem và xuất FHIR ServiceRequest cho chỉ định xét nghiệm/chẩn đoán hình ảnh/thủ thuật.
- Ghi audit khi tải, tạo, xem và xuất FHIR Observation cho chỉ số lâm sàng.
- Ghi audit khi tải, tạo, xem và xuất FHIR DiagnosticReport cho báo cáo kết quả xét nghiệm/chẩn đoán hình ảnh.
- Ghi audit khi tải, tạo, xem và xuất FHIR ImagingStudy cho metadata ảnh y khoa/PACS.
- Ghi audit khi tải, tạo, xem và xuất FHIR MedicationRequest cho chỉ định thuốc.
- Ghi audit khi xuất FHIR document Bundle có `Composition` cho hồ sơ chuyển viện/liên viện.
- Ghi audit khi tải, tạo, ký và xuất FHIR DocumentReference cho tài liệu bệnh án.
- Ghi audit khi đọc audit trail của một bệnh nhân.
- Lưu actor, hành động, loại tài nguyên, mã tài nguyên, mã bệnh nhân, mục đích sử dụng, IP, user agent và metadata.
- Dùng in-memory repository cho local dev nhanh và PostgreSQL repository cho Docker/dev-prod.

## Hệ Quả

Tích cực:

- Có thể trình bày được luồng truy vết tối thiểu ngay trên UI.
- Bảng `audit_events` trong migration đã có vai trò thật thay vì chỉ là placeholder.
- Harness có smoke check cho `AuditEvent`, không chỉ FHIR mapping.

Giới hạn còn lại:

- Bearer token nội bộ và header `x-purpose-of-use` mới là cơ chế demo, chưa thay thế IAM/RBAC thật.
- Chưa có chống sửa/xóa audit log, retention policy, alerting hoặc phân quyền đọc audit.
- Chưa ánh xạ audit nội bộ sang FHIR `AuditEvent`; hiện mới dùng domain model nội bộ.

## Bước Tiếp Theo

1. Thêm IAM/RBAC tối thiểu cho vai trò bác sĩ, điều dưỡng, quản trị và cán bộ kiểm toán.
2. Tách quyền `TREATMENT` và `AUDIT` rõ hơn ở API.
3. Ánh xạ audit nội bộ sang FHIR `AuditEvent` khi cần liên thông hoặc xuất log chuẩn hóa.
