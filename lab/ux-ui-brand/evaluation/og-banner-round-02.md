# OG/Banner Round 02 Decision

## Quyết định

Chốt lại quy trình chính thức cho social preview và banner: dùng `imagegen` tạo trọn ảnh, bao gồm nền, logo-like mark, typography, bố cục và chi tiết thương hiệu. Không dùng phương án tạo nền bằng AI rồi ghép chữ/logo bằng script cục bộ.

## Tệp chính thức

- `docs/assets/github-social-preview.jpg`: bản GitHub social preview 1280 x 640, tối ưu dung lượng.
- `docs/assets/og/wiiicare-nexus-og.jpg`: bản Open Graph 1280 x 640, tối ưu dung lượng.
- `docs/assets/og/wiiicare-nexus-og.png`: bản Open Graph lossless.
- `docs/assets/brand/wiiicare-nexus-banner-16x9.jpg`: bản banner 1920 x 1080, tối ưu dung lượng.
- `docs/assets/brand/wiiicare-nexus-banner-16x9.png`: bản banner lossless.
- `lab/ux-ui-brand/assets/final/wiiicare-nexus-social-preview-full-imagegen.png`: nguồn social preview do `imagegen` tạo toàn bộ.
- `lab/ux-ui-brand/assets/final/wiiicare-nexus-banner-16x9-full-imagegen.png`: nguồn banner do `imagegen` tạo toàn bộ.

## Nguyên tắc

- `imagegen` chịu trách nhiệm toàn bộ hình ảnh, bao gồm bố cục, chữ và biểu tượng.
- Bước cục bộ sau sinh ảnh chỉ được dùng để đổi kích thước hoặc nén định dạng; không ghép chữ, không ghép logo, không thêm layer mới.
- Ưu tiên nền sáng Clinical Light, motif hồ sơ điện tử, luồng dữ liệu, FHIR, PACS/DICOM và liên thông bệnh viện.
- Tránh biểu tượng chữ thập y tế làm motif chính, X-quang/phổi rõ nghĩa, bác sĩ/bệnh nhân thật, panel UI rối và chữ giả khó đọc.

## Kết luận

Round 02 chuyển sang đúng hướng full-imagegen theo yêu cầu thương hiệu: ảnh có cảm giác đồng nhất hơn, ít cơ khí hơn, vẫn giữ định vị WiiiCare Nexus cho EMR, FHIR, PACS/DICOM và kiến trúc audit-ready.
