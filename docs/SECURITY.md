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

- Các phản hồi `403 FORBIDDEN` và `403 PATIENT_ACCESS_DENIED` được ghi thành audit event `access.denied`; với lỗi theo hồ sơ bệnh nhân, sự kiện được gắn vào audit trail của bệnh nhân và khi xuất FHIR sẽ có `AuditEvent.outcome = 4` để thể hiện lần truy cập bị chặn.
- Kiểm toán viên hoặc quản trị viên dùng mục đích `AUDIT` có thể gọi `GET /api/v1/audit-events` để xem các audit event gần nhất ở phạm vi toàn hệ thống, bao gồm cả sự kiện bảo mật không gắn `patientId`.

- API đã yêu cầu `Authorization: Bearer <token>` cho endpoint nghiệp vụ.
- Ở `NODE_ENV=production`, API bắt buộc `BVS_REPOSITORY=postgres`; in-memory repository chỉ dành cho dev/test và không được dùng cho dữ liệu bệnh án thật.
- Ở `NODE_ENV=production`, API bắt buộc cấu hình `BVS_PUBLIC_API_BASE_URL` bằng URL HTTPS public, không dùng `localhost`/loopback, để FHIR metadata không công bố nhầm địa chỉ nội bộ.
- Token demo do `POST /api/v1/auth/login` phát hành, ký bằng `BVS_AUTH_SECRET`. Mật khẩu demo được kiểm tra bằng hash `scrypt` và so sánh timing-safe; đây vẫn là cơ chế demo, chưa thay thế IAM/SSO production.
- Ở `NODE_ENV=production`, đăng nhập demo mặc định bị tắt và chỉ hoạt động nếu cấu hình rõ `BVS_DEMO_AUTH_ENABLED=true` cho phiên smoke/demo có kiểm soát.
- Ở `NODE_ENV=production`, API kiểm tra `BVS_AUTH_SECRET` ngay khi khởi động và dừng sớm nếu secret thiếu, ngắn hơn 32 ký tự hoặc vẫn là placeholder/dev-only secret.
- Ở `NODE_ENV=production`, API cũng từ chối mở PostgreSQL repository pool nếu `DATABASE_URL` vẫn chứa credential mẫu/dev như `change-me...` hoặc `bvs_dev_password`.
- TTL của token demo được cấu hình bằng `BVS_AUTH_TOKEN_TTL_SECONDS`, mặc định `28800` giây, và bị giới hạn trong khoảng `300` đến `28800` giây để tránh phiên quá ngắn hoặc quá dài do cấu hình sai.
- Khi xác minh token, API kiểm tra định dạng base64url/kích thước segment trước khi xử lý sâu, sau đó kiểm tra `iat`, `exp`, không chấp nhận token phát hành trong tương lai quá xa, token hết hạn, token có `exp <= iat` hoặc thời lượng vượt trần `28800` giây dù chữ ký HMAC hợp lệ.
- Lỗi auth trả `requestId` để nối phản hồi client với log kỹ thuật mà không lộ stack trace hoặc chi tiết nội bộ.
- Lỗi phân quyền chung trả `requestId`; lỗi `401 UNAUTHENTICATED` có thêm `WWW-Authenticate: Bearer` để client/proxy nhận biết yêu cầu Bearer token.
- `POST /api/v1/auth/login` có rate limit theo IP + username đã băm SHA-256, cấu hình bằng `BVS_RATE_LIMIT_STORE`, `BVS_VALKEY_URL`, `BVS_AUTH_LOGIN_RATE_LIMIT_MAX` và `BVS_AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS`. Dev đơn lẻ có thể dùng memory store; production bắt buộc Valkey để chia sẻ bộ đếm giữa nhiều replica.
- `/ready` kiểm tra kho rate limit đăng nhập để tránh đưa API vào rotation khi Valkey không sẵn sàng trong cấu hình dev-prod/production.
- Ở production, `BVS_CORS_ORIGINS` chỉ chấp nhận Origin HTTPS canonical, không chấp nhận wildcard, HTTP hoặc URL có path để tránh mở rộng nhầm phạm vi truy cập từ trình duyệt.
- API và web container đặt security headers nền tảng gồm `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` và `Cross-Origin-Resource-Policy`.
- Web runtime Nginx áp dụng Content Security Policy chặt cho SPA (`default-src 'self'`, chặn inline script/style, `object-src 'none'`, `frame-ancestors 'none'`) để giảm rủi ro XSS/nhúng ngoài ý muốn. CSP được scope ở `location /` để không phá `/api` và Swagger UI được proxy qua `/docs`.
- API đặt `Cache-Control: no-store` và `Pragma: no-cache` để giảm rủi ro browser/proxy lưu nhầm response chứa dữ liệu bệnh án.
- API phản hồi `X-Request-Id`, chấp nhận `x-request-id` từ proxy/upstream và ghi `requestId` vào metadata của audit event để nối log kỹ thuật với hành động lâm sàng.
- API chỉ tin `x-request-id` upstream nếu ID ngắn và dùng tập ký tự an toàn; giá trị rỗng, quá dài hoặc có khoảng trắng/ký tự lạ sẽ bị thay bằng UUID mới trước khi phản hồi/log/audit.
- API có error handler tập trung: lỗi validation trả `400 VALIDATION_ERROR`, lỗi ngoài ý muốn trả `500 INTERNAL_SERVER_ERROR`, luôn kèm `requestId` và không trả stack trace hoặc chi tiết nội bộ cho client.
- API có lớp bảo vệ cuối ở response boundary để tự bổ sung `requestId` cho lỗi JSON thủ công có trường `error`; payload FHIR `OperationOutcome` được loại trừ để giữ đúng contract liên thông.
- Các lỗi validation payload của endpoint đăng nhập và endpoint nghiệp vụ đều đi qua cùng envelope `400 VALIDATION_ERROR`, tránh trộn nhiều format lỗi cho client.
- `x-purpose-of-use` vẫn được dùng để khai báo mục đích truy cập như `TREATMENT` hoặc `AUDIT`; đây là ngữ cảnh sử dụng dữ liệu, không phải định danh người dùng.
- Các endpoint lâm sàng như bệnh nhân, Provider Directory, lượt khám, dị ứng/cảnh báo `AllergyIntolerance`, chẩn đoán `Condition`, chỉ định dịch vụ `ServiceRequest`, công việc thực thi `Task`, thủ thuật/hoạt động `Procedure`, chỉ số `Observation`, báo cáo kết quả `DiagnosticReport`, nghiên cứu hình ảnh `ImagingStudy`, chỉ định thuốc `MedicationRequest`, cấp phát thuốc `MedicationDispense`, dùng thuốc thực tế `MedicationAdministration`, tài liệu, gói chuyển hồ sơ liên viện và Bundle đều đi qua kiểm tra quyền ở API.
- Patient Registry đã có ABAC tối thiểu theo Provider Directory: với mục đích `TREATMENT`, bác sĩ/điều dưỡng chỉ thấy và đọc hồ sơ bệnh nhân thuộc tổ chức mà họ có vai trò đang hoạt động, có tính quan hệ bệnh viện-khoa/phòng. Quản trị viên có quyền bao phủ; kiểm toán viên chỉ đọc theo mục đích `AUDIT`.
- `Encounter`, `AllergyIntolerance`, `Condition`, `MedicationRequest`, `MedicationDispense`, `MedicationAdministration`, `ClinicalDocument`, `Observation`, `ServiceRequest`, `Task`, `Procedure`, `DiagnosticReport`, `ImagingStudy`, `Consent`, `AuditEvent` và `RecordTransfer` dùng cùng rào ABAC theo bệnh nhân cho list/create/read/export/update tương ứng, nên người dùng điều trị không thể đi vòng qua endpoint con để xem lượt khám, dị ứng, chẩn đoán, thuốc, tài liệu, chỉ số, y lệnh, thủ thuật, báo cáo cận lâm sàng, hình ảnh, consent, audit trail hoặc gói chuyển hồ sơ của bệnh nhân ngoài tổ chức.
- `Task` có quyền đọc/tạo/xuất riêng để tránh trộn quyền y lệnh với quyền thao tác hàng đợi vận hành. Điều dưỡng có thể tạo/đọc công việc nhưng không xuất FHIR; bác sĩ/quản trị có thể xuất khi mục đích sử dụng là điều trị.
- `Procedure` có quyền đọc/tạo/xuất riêng để tách bản ghi hành động đã thực hiện khỏi y lệnh và hàng đợi vận hành. Điều dưỡng có thể ghi nhận/đọc trong phạm vi điều trị nhưng không xuất FHIR; bác sĩ/quản trị có thể xuất khi mục đích sử dụng là điều trị.
- `MedicationDispense` và `MedicationAdministration` có quyền đọc/tạo/xuất riêng để tách “đã cấp thuốc” và “đã dùng thuốc” khỏi “đã kê thuốc”. Điều dưỡng có thể ghi nhận/đọc trong phạm vi điều trị nhưng không xuất FHIR; bác sĩ/quản trị có thể xuất khi mục đích sử dụng là điều trị.
- Provider Directory được cho phép đọc rộng hơn dữ liệu bệnh án để điều dưỡng/bác sĩ thấy mã cơ sở, khoa phòng và endpoint; xuất Provider Directory sang FHIR vẫn bị giới hạn theo quyền `provider-directory:fhir-export`.
- FHIR Bundle chia sẻ liên viện yêu cầu consent tồn tại trong store, còn hiệu lực, chưa bị thu hồi, đúng bệnh nhân và đúng đơn vị nhận.
- FHIR document Bundle có `Composition` cũng dùng cùng rào consent và audit như Bundle collection; không có đường xuất tài liệu liên viện “bỏ qua consent”.
- FHIR `Provenance` của tài liệu chỉ xuất được qua quyền xuất FHIR tài liệu và chỉ hợp lệ khi tài liệu đã ký, để tránh tạo bằng chứng nguồn gốc cho bản nháp chưa được xác nhận.
- Consent chia sẻ hồ sơ có endpoint thu hồi riêng, quyền `consent:revoke`, audit action `consent.revoke`, endpoint FHIR `Consent` riêng và metadata thu hồi để chặn các lần xuất/chuyển hồ sơ mới.
- `RecordTransfer` kiểm consent trước khi tạo, ghi audit khi liệt kê/tạo/xem/gửi/xác nhận nhận/xuất FHIR `Task`, và không lưu bản sao đầy đủ của Bundle trong bảng vận hành.
- `AuditEvent` được niêm phong bằng chuỗi băm `sha256` theo từng bệnh nhân. API kiểm toán có thể gọi `/api/v1/patients/:patientId/audit-integrity` để phát hiện bản ghi chưa niêm phong, nội dung bị sửa hoặc liên kết hash bị đứt; kiểm toán viên cũng có endpoint xuất FHIR `AuditEvent` Bundle với quyền `audit-event:fhir-export`.
- Kiểm toán viên có thể liệt kê/đọc ngữ cảnh bệnh nhân tối thiểu bằng `patient:list` và `patient:read` khi `x-purpose-of-use` là `AUDIT`; cùng vai trò đó sẽ bị chặn nếu khai báo mục đích `TREATMENT`, tránh biến phiên kiểm toán thành phiên điều trị trá hình.
- Cơ chế này chỉ là lớp phiên nội bộ cho prototype, chưa thay thế IAM/SSO, MFA, quản lý thiết bị hoặc chính sách truy cập theo cơ sở y tế.

## Hướng triển khai sau

- Thêm IAM/SSO bằng Keycloak hoặc nhà cung cấp định danh tương đương.
- Thiết kế RBAC kết hợp ABAC: vai trò, khoa phòng, ca trực, quan hệ điều trị và mục đích truy cập.
- Bổ sung workflow ký/xác nhận consent, consent cho người giám hộ/đại diện hợp pháp, phạm vi dữ liệu được chia sẻ theo từng loại hồ sơ và trạng thái gửi/nhận thực tế của `RecordTransfer`.
- Nâng audit từ chuỗi băm prototype lên lưu trữ append-only/WORM, retention policy, cảnh báo khi chuỗi hash lỗi và quy trình điều tra.
- Tách secret khỏi mã nguồn.
- Bổ sung kiểm thử phân quyền và kiểm thử API contract.
