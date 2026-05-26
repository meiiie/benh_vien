# UX/UI Brand Lab

Khu vực này dùng để nghiên cứu, thử nghiệm và chấm điểm nhận diện cho dự án trước khi đưa asset vào `docs/assets` hoặc sản phẩm chính.

## Mục tiêu

- Chọn tên thương hiệu đủ chuyên nghiệp cho bối cảnh bệnh viện số.
- Tạo nhiều hướng logo bằng `imagegen`, sau đó chỉ chọn concept tốt để redraw thành SVG/vector.
- Thiết kế banner/social preview theo tiêu chuẩn GitHub và tài liệu kỹ thuật.
- Xây design token ban đầu cho màu sắc, typography, spacing và trạng thái giao diện.
- Ghi lại quyết định để tránh đổi phong cách tùy hứng.

## Quy trình

1. Nghiên cứu chuẩn và nguyên tắc từ tổ chức lớn.
2. Viết creative brief và tiêu chí chấm điểm.
3. Tạo nhiều concept logo bằng `imagegen`.
4. Chấm concept theo scorecard.
5. Redraw concept thắng thành SVG sạch.
6. Tạo banner/social preview từ asset vector và design token.
7. Chỉ khi đã ổn mới chuyển asset sang thư mục dùng chính thức.

## Cấu trúc

```text
assets/
  concepts/     Ảnh concept tạo bằng imagegen
  contact-sheet/ Ảnh tổng hợp để so sánh nhanh
evaluation/     Scorecard và tiêu chí chấm
prompts/        Prompt dùng cho imagegen
research/       Ghi chú nghiên cứu nguồn chính thống
strategy/       Tên thương hiệu, định vị, creative brief
tokens/         Design token thử nghiệm
```

## Nguyên tắc chất lượng

- Không dùng logo có chữ do AI render trực tiếp.
- Không dùng medical cross làm ý tưởng chính.
- Không dùng quá nhiều glow, panel giả, chi tiết y tế stock.
- Logo phải dùng được ở kích thước nhỏ, trên nền sáng và nền tối.
- Banner phải dễ đọc khi GitHub crop hoặc hiển thị trên mạng xã hội.

## Vòng nghiên cứu hiện tại

- Palette vòng 2: [strategy/color-meaning-round-02.md](strategy/color-meaning-round-02.md).
- Token vòng 2: [tokens/design-tokens.round-02.json](tokens/design-tokens.round-02.json).
