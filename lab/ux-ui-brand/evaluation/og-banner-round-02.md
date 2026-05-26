# OG/Banner Round 02 Decision

## Quyết định

Chốt hướng dựng ảnh social preview và banner bằng quy trình hai lớp:

- Lớp nền: dùng `imagegen` để tạo nền trừu tượng Clinical Light, không có chữ, không có con người, không có thiết bị y tế cụ thể và không có biểu tượng chẩn đoán dễ gây hiểu sai.
- Lớp thương hiệu: đặt logo, tên dự án, mô tả và danh sách năng lực bằng render cục bộ để bảo đảm chữ tiếng Việt đúng dấu, khoảng cách ổn định và không xuất hiện chữ giả từ AI.

## Tệp chính thức

- `docs/assets/github-social-preview.png`: bản GitHub social preview 1280 x 640.
- `docs/assets/og/wiiicare-nexus-og.png`: bản Open Graph cùng kích thước với social preview.
- `docs/assets/brand/wiiicare-nexus-banner-16x9.png`: bản banner 1920 x 1080 cho README, slide và tài liệu.
- `lab/ux-ui-brand/assets/backgrounds/clinical-light-abstract-background-imagegen.png`: nền nguồn từ `imagegen`.

## Tiêu chí kiểm tra

- Tỉ lệ GitHub social preview giữ ở 2:1 và xuất ở 1280 x 640 để phù hợp khuyến nghị hiển thị tốt nhất của GitHub.
- Banner 16:9 giữ khoảng thở lớn, dùng nền sáng để không làm logo bị nặng hoặc giống poster AI.
- Nội dung tiếng Việt do hệ thống render trực tiếp, không phụ thuộc vào khả năng sinh chữ của mô hình ảnh.
- Motif hình ảnh chỉ gợi ý hồ sơ, luồng dữ liệu và kết nối hệ thống; không mô phỏng bác sĩ, bệnh nhân, xét nghiệm, phổi, ống nghiệm hoặc biểu tượng y tế sai phạm vi EMR/FHIR/PACS.

## Kết luận

Round 02 phù hợp hơn với định vị WiiiCare Nexus: hiện đại, sạch, có cảm giác bệnh viện số nhưng vẫn đủ kỹ thuật cho một dự án monorepo về EMR, FHIR, PACS/DICOM và kiến trúc audit-ready.
