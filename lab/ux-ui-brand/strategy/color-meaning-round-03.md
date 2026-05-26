# Color Meaning - Round 03

Ngày: 26/05/2026.

## Vì sao đổi hướng

Vòng 2 dùng nền tối quá nhiều nên tạo cảm giác gần cybersecurity, crypto hoặc hạ tầng mạng hơn là bệnh viện số. Vòng 3 giữ lại ý nghĩa `Harbor Clinical`, nhưng đảo vai trò:

- Nền chính chuyển sang sáng, sạch, giống môi trường lâm sàng và hồ sơ bệnh án.
- Màu đậm dùng cho chữ, khung và cấu trúc.
- Màu tươi chỉ làm accent dữ liệu, trạng thái và điểm audit.

## Palette đề xuất: Clinical Light

| Token | Hex | Ý nghĩa | Vai trò |
| --- | --- | --- | --- |
| `clinicalWhite` | `#FBFAF6` | Sạch, sáng, chuyên nghiệp, phù hợp tài liệu và bệnh viện. | Nền chính, social preview sáng, slide. |
| `chartPaper` | `#F6F2E8` | Giấy hồ sơ bệnh án, giảm cảm giác lạnh của nền trắng. | Surface, card, vùng record. |
| `seaMist` | `#E6F2F0` | Không gian lâm sàng dịu, gợi biển/cảng rất nhẹ. | Nền phụ, pattern, vùng highlight nhẹ. |
| `harborInk` | `#061823` | Tin cậy, bảo mật, độ nghiêm túc của hạ tầng bệnh viện. | Chữ chính, logo đơn sắc, đường viền mạnh. |
| `harborBlue` | `#0B3A53` | Hải Phòng/cảng, tổ chức, tính ổn định. | Khung logo, heading, navigation. |
| `clinicalTeal` | `#08757C` | Liên thông dữ liệu nhưng đủ tương phản trên nền sáng. | Link, đường kết nối chính, icon trên nền sáng. |
| `dataCyan` | `#1FB8C0` | Luồng dữ liệu/FHIR/API, dùng như ánh sáng dữ liệu. | Accent trong logo, đường/điểm dữ liệu, không dùng làm chữ nhỏ trên nền sáng. |
| `careGreen` | `#176B4D` | Chăm sóc, xác nhận, trạng thái hợp lệ. | Success text/icon trên nền sáng. |
| `careMint` | `#2FB879` | Màu chăm sóc tươi hơn. | Accent lớn hoặc icon trên nền tối, không làm chữ nhỏ trên nền sáng. |
| `auditAmber` | `#9A5C00` | Kiểm toán, dấu mốc xác nhận, sự kiện cần chú ý. | Warning/audit text trên nền sáng. |
| `auditGold` | `#F0B84B` | Tín hiệu audit sáng. | Dot hoặc marker nhỏ, không dùng làm chữ nhỏ trên nền sáng. |
| `safetyRed` | `#9E2B2B` | An toàn người bệnh, lỗi nghiêm trọng. | Error/critical text trên nền sáng. |
| `slate` | `#324957` | Chữ phụ, mô tả, metadata. | Body/subtitle trên nền sáng. |

## Tương phản sơ bộ

Trên `clinicalWhite`:

- `harborInk`: 17.29:1.
- `harborBlue`: 11.53:1.
- `clinicalTeal`: 5.23:1.
- `careGreen`: 6.19:1.
- `auditAmber`: 5.15:1.
- `safetyRed`: 7.09:1.
- `slate`: 9.03:1.

Trên `seaMist`:

- `harborInk`: 15.76:1.
- `harborBlue`: 10.50:1.
- `clinicalTeal`: 4.76:1.
- `careGreen`: 5.64:1.
- `auditAmber`: 4.69:1.
- `safetyRed`: 6.47:1.

## Câu chuyện logo vòng 3

Logo cần chuyển từ “dark tech shield” sang “clinical infrastructure”.

Ý nghĩa nên giữ:

- `W/N`: Wiii + Nexus.
- Ba node: EMR, FHIR, PACS hoặc bệnh nhân, bác sĩ, bệnh viện.
- Một đường liên thông: bệnh án di chuyển an toàn giữa hệ thống.
- Một điểm amber nhỏ: audit trail.
- Khoảng âm record: hồ sơ bệnh án điện tử, không cần vẽ file literal quá rõ.

## Quy tắc tạo concept

- Tạo trên nền sáng để kiểm tra logo có sống được ngoài dark mode không.
- Không dùng chữ trong ảnh AI.
- Không dùng medical cross, stethoscope, trái tim, robot.
- Không dùng nền đen làm “che khuyết điểm”.
- Nếu concept chỉ đẹp nhờ glow/gradient, loại.
