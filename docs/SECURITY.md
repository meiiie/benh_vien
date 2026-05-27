# Định hướng bảo mật

Hồ sơ bệnh án là dữ liệu đặc biệt nhạy cảm. Dự án chưa triển khai bảo mật đầy đủ ở phiên bản đầu, nhưng kiến trúc cần giữ sẵn các ràng buộc sau.

## Nguyên tắc bắt buộc

- Không truy cập bệnh án nếu chưa xác thực.
- Không chỉ dựa vào vai trò chung; cần kiểm tra quyền trên từng đối tượng bệnh nhân hoặc từng ngữ cảnh điều trị.
- Không trả dữ liệu dư thừa qua API.
- Không cho hệ thống ngoài truy cập trực tiếp database.
- Mọi thao tác xem, sửa, ký, xuất, chia sẻ hồ sơ cần ghi audit trail.
- Dữ liệu lưu trữ và truyền qua mạng cần được bảo vệ bằng cơ chế phù hợp với môi trường triển khai.

## Rủi ro cần kiểm tra theo OWASP API Security

- Broken Object Level Authorization: người dùng truy cập hồ sơ bệnh nhân không thuộc quyền.
- Broken Authentication: phiên đăng nhập hoặc token yếu.
- Broken Object Property Level Authorization: trả hoặc sửa trường dữ liệu nhạy cảm ngoài thẩm quyền.
- Security Misconfiguration: bật debug, CORS rộng, thiếu header bảo mật.
- Improper Inventory Management: API cũ vẫn mở nhưng không được quản lý.

## Trạng thái hiện tại

- API đã yêu cầu `Authorization: Bearer <token>` cho endpoint nghiệp vụ.
- Token demo do `POST /api/v1/auth/login` phát hành, ký bằng `BVS_AUTH_SECRET`.
- `x-purpose-of-use` vẫn được dùng để khai báo mục đích truy cập như `TREATMENT` hoặc `AUDIT`; đây là ngữ cảnh sử dụng dữ liệu, không phải định danh người dùng.
- Các endpoint lâm sàng như bệnh nhân, lượt khám, dị ứng/cảnh báo `AllergyIntolerance`, chẩn đoán `Condition`, chỉ định dịch vụ `ServiceRequest`, chỉ số `Observation`, chỉ định thuốc `MedicationRequest`, tài liệu và Bundle đều đi qua kiểm tra quyền ở API.
- FHIR Bundle chia sẻ liên viện yêu cầu consent tồn tại trong store, còn hiệu lực, đúng bệnh nhân và đúng đơn vị nhận.
- Cơ chế này chỉ là lớp phiên nội bộ cho prototype, chưa thay thế IAM/SSO, MFA, quản lý thiết bị hoặc chính sách truy cập theo cơ sở y tế.

## Hướng triển khai sau

- Thêm IAM/SSO bằng Keycloak hoặc nhà cung cấp định danh tương đương.
- Thiết kế RBAC kết hợp ABAC: vai trò, khoa phòng, ca trực, quan hệ điều trị và mục đích truy cập.
- Bổ sung workflow thu hồi consent, ký/xác nhận consent và consent cho người giám hộ/đại diện hợp pháp.
- Tạo bảng audit append-only.
- Tách secret khỏi mã nguồn.
- Bổ sung kiểm thử phân quyền và kiểm thử API contract.
