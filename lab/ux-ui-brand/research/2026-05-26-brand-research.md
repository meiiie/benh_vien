# Brand Research - 2026-05-26

Ngày nghiên cứu: 26/05/2026.

## Nguồn chính thống đã dùng

- GitHub Docs - Social preview: ảnh social preview nên dùng tỉ lệ 2:1, khuyến nghị `1280 x 640`, dung lượng dưới `1 MB`.  
  Nguồn: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview
- GOV.UK Design System - Colour and accessibility: màu phải phục vụ ý nghĩa, có tương phản đủ tốt và không chỉ truyền tải thông tin bằng màu.  
  Nguồn: https://design-system.service.gov.uk/styles/colour/
- W3C Design Tokens Community Group: token hóa màu, typography, spacing giúp hệ thống thiết kế nhất quán giữa code, tài liệu và thiết kế.  
  Nguồn: https://www.w3.org/community/design-tokens/
- HL7 FHIR: FHIR là chuẩn kỹ thuật và có license/brand context riêng; dự án nên nhắc FHIR như chuẩn tham chiếu, không dùng hoặc biến tấu logo FHIR làm logo dự án.  
  Nguồn: https://www.hl7.org/fhir/ và https://www.hl7.org/fhir/license.html
- IBM Carbon Design System: pictogram/illustration cần nhất quán kích thước, container, khoảng thở và màu; Carbon cũng cảnh báo không dùng pictogram như logo.  
  Nguồn: https://carbondesignsystem.com/elements/pictograms/usage/
- Atlassian Design System: illustration nên làm rõ ý tưởng, hỗ trợ nội dung và tránh gây tải nhận thức quá mức.  
  Nguồn: https://atlassian.design/foundations/illustrations/

## Kết luận thiết kế

- Logo chính phải là vector-first, không phải ảnh AI raster.
- `imagegen` phù hợp để tạo concept mood/shape, nhưng asset cuối cần redraw hoặc dựng lại bằng SVG.
- Banner GitHub nên là brand card tối giản, không phải tranh minh họa bệnh viện phức tạp.
- Dự án y tế nên dùng cảm giác tin cậy, bình tĩnh, kiểm toán được; tránh neon cyberpunk và poster AI nhiều chi tiết.
- Vì dự án có HoLiLiHu và The Wiii Lab, nên ưu tiên một dấu hiệu riêng có liên quan đến `Wiii`, kết nối dữ liệu và an toàn.

## Hướng thị giác đề xuất

- Hình khối: nexus node, medical record layer, shield/data vault, hoặc abstract `Wiii`.
- Không dùng làm motif chính: chữ thập y tế, trái tim, robot, DNA xoắn kép, stethoscope.
- Cảm xúc: calm infrastructure, clinical trust, engineering precision.
- Màu: nền navy sâu, teal/mint lâm sàng, off-white ấm; không dùng tím mặc định.
