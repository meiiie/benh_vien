# Security Policy

## Phạm vi

Dự án đang ở giai đoạn prototype kiến trúc. Không dùng dữ liệu bệnh nhân thật trong môi trường này nếu chưa có quy trình pháp lý, bảo mật và đồng ý phù hợp.

## Báo cáo lỗ hổng

Tạo GitHub issue private/security advisory nếu repo bật tính năng này, hoặc liên hệ trực tiếp maintainer của repo. Không công bố công khai dữ liệu nhạy cảm, token, log chứa thông tin bệnh nhân hoặc cấu hình thật.

## Nguyên tắc

- Secret nằm ngoài Git.
- Dữ liệu bệnh án cần audit trail.
- API truy cập bệnh nhân phải có authorization theo đối tượng dữ liệu trước khi dùng thật.
- Docker prod không dùng mật khẩu mẫu trong `.env.prod.example`.

