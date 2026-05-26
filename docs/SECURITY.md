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

## Hướng triển khai sau

- Thêm IAM/SSO bằng Keycloak hoặc nhà cung cấp định danh tương đương.
- Thiết kế RBAC kết hợp ABAC: vai trò, khoa phòng, ca trực, quan hệ điều trị và mục đích truy cập.
- Tạo bảng audit append-only.
- Tách secret khỏi mã nguồn.
- Bổ sung kiểm thử phân quyền và kiểm thử API contract.

