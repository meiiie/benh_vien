# ADR-0002: Ưu tiên liên thông theo chuẩn trước khi tự thiết kế giao thức riêng

## Trạng thái

Chấp nhận.

## Bối cảnh

Bệnh án điện tử không chỉ là form nhập dữ liệu. Khi đặt trong bối cảnh nhiều bệnh viện, cần xử lý định danh bệnh nhân, chia sẻ tài liệu, ảnh y khoa, bảo mật và kiểm toán. Nếu tự thiết kế giao thức riêng từ đầu, hệ thống dễ khó liên thông và khó bảo vệ về mặt học thuật.

## Quyết định

Dùng FHIR R4 làm lớp trao đổi dữ liệu chính, DICOM/PACS cho ảnh y khoa, IHE MHD cho hướng chia sẻ tài liệu và IHE PIXm cho định danh bệnh nhân liên miền. Domain model nội bộ vẫn giữ ngữ nghĩa riêng, sau đó mapping sang chuẩn khi trao đổi; với workflow, `ServiceRequest` là y lệnh còn `Task` là trạng thái thực thi y lệnh. Với thuốc, `MedicationRequest` là chỉ định, `MedicationDispense` là sự kiện cấp phát thuốc, còn `MedicationAdministration` là sự kiện dùng thuốc thực tế. Với tài liệu, `DocumentReference` mô tả metadata tài liệu còn `Provenance` mô tả nguồn gốc/ký xác nhận của tài liệu đã hoàn tất.

## Hệ quả

- Kiến trúc sát thực tế hơn và dễ giải thích với thầy.
- Prototype có thể kết nối HAPI FHIR và Orthanc.
- Cần đầu tư mapping và kiểm thử tương thích.
- Không nên nhầm FHIR server với toàn bộ hệ thống EMR.
