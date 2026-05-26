# ADR-0001: Khởi đầu bằng modular monolith theo DDD

## Trạng thái

Chấp nhận.

## Bối cảnh

Dự án bệnh án điện tử có nhiều miền nghiệp vụ: định danh bệnh nhân, tài liệu lâm sàng, liên thông, ảnh y khoa, phân quyền và kiểm toán. Nếu tách microservice ngay, dự án sẽ phải xử lý thêm network, deployment, observability, versioning và distributed transactions trong khi nghiệp vụ còn đang được khám phá.

## Quyết định

Khởi đầu bằng modular monolith trong monorepo. Các bounded context được tách bằng package/module và interface rõ ràng. Hạ tầng bên ngoài như FHIR server và PACS được xem là hệ thống tích hợp, không nhúng trực tiếp vào domain core.

## Hệ quả

- Dễ phát triển và trình bày hơn trong giai đoạn đầu.
- Giảm rủi ro “microservice hóa giả” nhưng vẫn giữ đường tách service.
- Cần kỷ luật kiến trúc: module không được truy cập dữ liệu của nhau tùy tiện.
- Khi tách service, cần bổ sung contract, event, migration dữ liệu và observability.

