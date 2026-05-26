# WiiiCare Nexus Brand

## Tên dự án

**WiiiCare Nexus** là tên chính thức của dự án. Cách gọi đầy đủ trong tài liệu:

```text
WiiiCare Nexus by HoLiLiHu · The Wiii Lab
```

Ý nghĩa:

- `WiiiCare`: giữ dấu ấn The Wiii Lab và định vị vào lĩnh vực chăm sóc sức khỏe.
- `Nexus`: nhấn mạnh vai trò kết nối hồ sơ bệnh án điện tử, FHIR, PACS/DICOM và trao đổi dữ liệu giữa hệ thống.

## Nguyên tắc thị giác

- Ưu tiên nhận diện tối giản, dễ đọc ở kích thước nhỏ.
- Không dùng biểu tượng chữ thập y tế làm motif chính để tránh cảm giác chung chung.
- Logo phải dùng được ở README, slide, favicon, tài liệu kỹ thuật và giao diện demo.
- Hạn chế hiệu ứng 3D, glow, phối cảnh phức tạp và các panel giả lập chứa chữ không đọc được.
- Ảnh social preview nên là bố cục thương hiệu, không phải tranh minh họa y tế rối.

## Asset

- `docs/assets/brand/wiiicare-nexus-final-source-imagegen.png`: logo nguồn đã chốt từ `imagegen`.
- `docs/assets/brand/wiiicare-nexus-mark.png`: logo mark vuông.
- `docs/assets/brand/wiiicare-nexus-mark-on-light.png`: logo mark trên nền sáng.
- `docs/assets/brand/wiiicare-nexus-logo.png`: logo lockup ngang.
- `docs/assets/brand/wiiicare-nexus-banner-16x9.png`: banner 16:9 lossless cho slide/tài liệu.
- `docs/assets/brand/wiiicare-nexus-banner-16x9.jpg`: banner 16:9 bản nhẹ cho README/tài liệu web.
- `docs/assets/og/wiiicare-nexus-og.png`: ảnh Open Graph 1280 x 640 bản lossless.
- `docs/assets/og/wiiicare-nexus-og.jpg`: ảnh Open Graph 1280 x 640 bản nhẹ.
- `docs/assets/github-social-preview.jpg`: social preview 1280 x 640 cho GitHub.
- `lab/ux-ui-brand/assets/final/wiiicare-nexus-social-preview-full-imagegen.png`: nguồn social preview do `imagegen` tạo toàn bộ.
- `lab/ux-ui-brand/assets/final/wiiicare-nexus-banner-16x9-full-imagegen.png`: nguồn banner do `imagegen` tạo toàn bộ.

Ghi chú: logo hiện được chốt theo bản raster `imagegen`; nếu cần in ấn hoặc dùng trong hệ thống thiết kế dài hạn, bước tiếp theo là redraw lại thành SVG/vector dựa trên chính bản nguồn đã chốt. Riêng social preview và banner phải được tạo trọn ảnh bằng `imagegen`; bước cục bộ chỉ được dùng để đổi kích thước/nén định dạng, không ghép chữ, logo hoặc bố cục thủ công.

## Màu nền tảng: Clinical Light

| Token | Hex | Vai trò |
| --- | --- | --- |
| Clinical White | `#FBFAF6` | Nền chính sáng, sạch, phù hợp bệnh viện và tài liệu. |
| Sea Mist | `#E6F2F0` | Nền phụ dịu, gợi không gian lâm sàng và biển/cảng. |
| Harbor Ink | `#061823` | Chữ chính, độ tin cậy và bảo mật. |
| Harbor Blue | `#0B3A53` | Cấu trúc, heading, liên tưởng Hải Phòng/cảng. |
| Clinical Teal | `#08757C` | Liên thông dữ liệu đủ tương phản trên nền sáng. |
| Data Cyan | `#1FB8C0` | Accent luồng dữ liệu/FHIR/API. |
| Care Green | `#176B4D` | Trạng thái chăm sóc, xác nhận hợp lệ. |
| Audit Gold | `#F0B84B` | Điểm audit trail. |
