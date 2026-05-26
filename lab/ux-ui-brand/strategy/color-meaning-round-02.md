# Color Meaning - Round 02

Ngày: 26/05/2026.

## Nguyên tắc chọn màu

Màu không chỉ để đẹp. Mỗi màu phải có vai trò vận hành, ý nghĩa thương hiệu và cặp tương phản dùng được trong giao diện.

Nguồn tham chiếu:

- NHS digital service manual: màu giúp người dùng nhận diện, tin tưởng dịch vụ và phân biệt mức ưu tiên thông tin.
- GOV.UK Design System: màu chức năng nên gắn với ngữ cảnh, không dùng màu như tín hiệu duy nhất, và phải đáp ứng tương phản WCAG.
- W3C WCAG 2.2: văn bản thường cần tương phản tối thiểu 4.5:1 theo Success Criterion 1.4.3.
- W3C Design Tokens Community Group: màu nên được quản lý bằng token để dùng nhất quán giữa thiết kế, code và tài liệu.

## Palette đề xuất: Harbor Clinical

| Token | Hex | Ý nghĩa | Vai trò |
| --- | --- | --- | --- |
| `harborInk` | `#061823` | Nền sâu, bảo mật, độ tin cậy của hạ tầng y tế. | Nền tối, header, hero, banner. |
| `harborBlue` | `#0B3A53` | Hải Phòng/cảng biển, tổ chức, sự ổn định. | Nền phụ, card đậm, vùng điều hướng. |
| `nexusCyan` | `#1FB8C0` | Luồng dữ liệu, FHIR/API, kết nối liên thông. | Accent trên nền tối, đường kết nối, node dữ liệu. |
| `nexusCyanDark` | `#08757C` | Phiên bản cyan đủ tương phản trên nền sáng. | Link hoặc accent trên `chartPaper`. |
| `clinicalGreen` | `#2FB879` | Chăm sóc, tiến triển, trạng thái ổn định. | Success, trạng thái đã xác nhận, nhánh hồ sơ hợp lệ. |
| `clinicalGreenDark` | `#176B4D` | Green dùng cho nền sáng. | Success text, icon trạng thái trên nền sáng. |
| `chartPaper` | `#F6F2E8` | Giấy hồ sơ bệnh án, cảm giác con người và dễ đọc. | Nền sáng, chữ trên nền tối. |
| `mist` | `#E7F0EF` | Không gian lâm sàng sạch, giảm độ gắt. | Nền phụ sáng, surface nhẹ. |
| `slateStrong` | `#324957` | Chữ phụ nhưng vẫn đủ nghiêm túc. | Body text trên nền sáng. |
| `portAmber` | `#F0B84B` | Tín hiệu kiểm toán/cảnh báo cần chú ý, không phải lỗi. | Audit marker, warning nhẹ trên nền tối. |
| `portAmberDark` | `#7A4D00` | Amber đủ tương phản trên nền sáng. | Warning text, badge trên nền sáng. |
| `safetyRed` | `#D94A4A` | An toàn người bệnh, lỗi nghiêm trọng. | Error/critical trên nền tối. |
| `safetyRedDark` | `#9E2B2B` | Red đủ tương phản trên nền sáng. | Error text, critical badge. |

## Kiểm tra tương phản sơ bộ

Các cặp chính đạt hoặc gần đạt yêu cầu dùng cho chữ:

- `chartPaper` trên `harborInk`: 16.16:1.
- `nexusCyan` trên `harborInk`: 7.46:1.
- `clinicalGreen` trên `harborInk`: 7.10:1.
- `portAmber` trên `harborInk`: 10.03:1.
- `harborInk` trên `chartPaper`: 16.16:1.
- `harborBlue` trên `chartPaper`: 10.77:1.
- `nexusCyanDark` trên `chartPaper`: 4.88:1.
- `clinicalGreenDark` trên `chartPaper`: 5.79:1.
- `portAmberDark` trên `chartPaper`: 6.50:1.
- `safetyRedDark` trên `chartPaper`: 6.63:1.

Không dùng các màu sáng như `nexusCyan`, `clinicalGreen`, `portAmber` làm chữ nhỏ trên nền sáng vì tương phản không đủ.

## Ý nghĩa logo cần bám theo màu

- `harborInk` và `harborBlue`: hệ thống lõi, bảo mật, ổn định.
- `nexusCyan`: luồng dữ liệu bệnh án chuyển qua các hệ thống.
- `clinicalGreen`: chăm sóc và trạng thái hợp lệ của hồ sơ.
- `chartPaper`: hồ sơ bệnh án và yếu tố con người.
- `portAmber`: audit trail, dấu mốc xác nhận, sự kiện cần chú ý.

## Hướng logo vòng 2

Logo nên có một câu chuyện rõ:

```text
Ba tín hiệu Wiii đại diện cho team và ba lớp dữ liệu y tế.
Đường nexus đại diện cho liên thông bệnh án giữa hệ thống.
Khung bảo vệ hoặc khoảng âm đại diện cho an toàn dữ liệu người bệnh.
Màu harbor gợi Hải Phòng/cảng và hạ tầng kết nối.
```
