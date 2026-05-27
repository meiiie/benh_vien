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
- Ghi audit khi tải, tạo, xem và xuất FHIR Task cho công việc thực thi y lệnh.
- Ghi audit khi tải, tạo, xem và xuất FHIR Procedure cho thủ thuật/hoạt động đã thực hiện.
- Ghi audit khi tải, tạo, xem và xuất FHIR Observation cho chỉ số lâm sàng.
- Ghi audit khi tải, tạo, xem và xuất FHIR DiagnosticReport cho báo cáo kết quả xét nghiệm/chẩn đoán hình ảnh.
- Ghi audit khi tải, tạo, xem và xuất FHIR ImagingStudy cho metadata ảnh y khoa/PACS.
- Ghi audit khi tải, tạo, xem và xuất FHIR MedicationRequest cho chỉ định thuốc.
- Ghi audit khi tải, tạo, xem và xuất FHIR MedicationDispense cho cấp phát thuốc.
- Ghi audit khi tải, tạo, xem và xuất FHIR MedicationAdministration cho lần dùng thuốc thực tế.
- Ghi audit khi xuất FHIR document Bundle có `Composition` cho hồ sơ chuyển viện/liên viện.
- Ghi audit khi tải, tạo, ký và xuất FHIR DocumentReference cho tài liệu bệnh án.
- Ghi audit khi tạo, thu hồi hoặc xuất FHIR Consent cho đồng ý chia sẻ hồ sơ.
- Ghi audit khi đọc audit trail hoặc xuất FHIR `AuditEvent` Bundle của một bệnh nhân.
- Lưu actor, hành động, loại tài nguyên, mã tài nguyên, mã bệnh nhân, mục đích sử dụng, IP, user agent và metadata.
- Dùng in-memory repository cho local dev nhanh và PostgreSQL repository cho Docker/dev-prod.

## Hệ Quả

Tích cực:

- Có thể trình bày được luồng truy vết tối thiểu ngay trên UI.
- Bảng `audit_events` trong migration đã có vai trò thật thay vì chỉ là placeholder.
- Mỗi `AuditEvent` mới được niêm phong bằng chuỗi băm `sha256` gồm `previousHash`, `payloadHash` và `integrityHash` để phát hiện sửa/xóa log ở mức prototype.
- API có endpoint `/api/v1/patients/:patientId/audit-integrity` cho vai trò kiểm toán/quản trị kiểm tra chuỗi audit theo bệnh nhân.
- API có endpoint `/api/v1/patients/:patientId/audit-events/fhir-bundle` để kiểm toán viên xuất log dưới dạng FHIR `AuditEvent` Bundle.
- Harness có smoke check cho `AuditEvent` và trạng thái toàn vẹn audit, không chỉ FHIR mapping.

Giới hạn còn lại:

- Bearer token nội bộ và header `x-purpose-of-use` mới là cơ chế demo, chưa thay thế IAM/RBAC thật.
- Chuỗi băm giúp phát hiện sai lệch nhưng chưa thay thế lưu trữ append-only/WORM, retention policy, alerting hoặc kiểm toán độc lập.
- FHIR `AuditEvent` hiện là profile tối thiểu, chưa thay thế cơ chế lưu trữ bất biến, ký số hoặc SIEM/monitoring chuyên dụng.

## Bước Tiếp Theo

1. Thêm IAM/RBAC tối thiểu cho vai trò bác sĩ, điều dưỡng, quản trị và cán bộ kiểm toán.
2. Tách quyền `TREATMENT` và `AUDIT` rõ hơn ở API.
3. Hoàn thiện profile FHIR `AuditEvent` theo implementation guide của cơ sở triển khai và nối với SIEM/WORM storage khi cần vận hành thật.
