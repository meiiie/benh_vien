# Chuẩn và tài liệu tham chiếu

Tài liệu này ghi lại các chuẩn được dùng để định hướng dự án. Mục tiêu là tránh thiết kế theo cảm tính và giúp phần bảo vệ có căn cứ rõ ràng.

## Việt Nam: hồ sơ bệnh án điện tử

Theo thông tin công bố trên Cổng thông tin Bộ Y tế ngày 11/06/2025, Bộ Y tế đã ban hành **Thông tư 13/2025/TT-BYT** hướng dẫn triển khai hồ sơ bệnh án điện tử. Bài công bố nêu hồ sơ bệnh án điện tử là hồ sơ bệnh án được lập, cập nhật, hiển thị, ký, lưu trữ, quản lý, sử dụng và khai thác bằng phương tiện điện tử; đồng thời nhấn mạnh yêu cầu kết nối với số định danh cá nhân, tuân thủ quy định về dữ liệu, an toàn thông tin, an ninh mạng, giao dịch điện tử và lưu trữ dữ liệu.

Nguồn: [Cổng thông tin Bộ Y tế - Hướng dẫn mới nhất triển khai hồ sơ bệnh án điện tử](https://moh.gov.vn/thong-tin-chi-dao-dieu-hanh/-/asset_publisher/DOHhlnDN87WZ/content/huong-dan-moi-nhat-trien-khai-ho-so-benh-an-ien-tu)

Hàm ý cho dự án:

- Cần có mô hình hồ sơ bệnh án điện tử, không chỉ là trang nhập liệu.
- Cần có ký/xác nhận điện tử ở vòng đời tài liệu.
- Cần quản lý định danh bệnh nhân đủ nghiêm túc.
- Cần audit trail và chính sách bảo vệ dữ liệu.
- Cần cơ sở dữ liệu có migration, phân quyền, lưu vết, sao lưu và quy trình vận hành; phiên bản hiện tại mới đặt nền `patients`, `clinical_documents`, `audit_events`, chưa tuyên bố đạt điều kiện triển khai bệnh viện thật.

## HL7 FHIR R4

HL7 FHIR là chuẩn trao đổi dữ liệu y tế. Bản R4 vẫn là lựa chọn thực tế cho nhiều hệ thống vì mức độ hỗ trợ công cụ và triển khai rộng. Trong dự án này, FHIR được dùng làm lớp liên thông, không thay thế toàn bộ domain model nội bộ.

Nguồn:

- [HL7 FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [FHIR Patient Resource](https://hl7.org/fhir/R4/patient.html)

Hàm ý cho dự án:

- `Patient` là resource nền cho hồ sơ bệnh nhân.
- Khi phát triển tiếp cần bổ sung `Encounter`, `Condition`, `Observation`, `Procedure`, `MedicationRequest`, `DocumentReference`, `Composition`.
- Với liên thông bệnh án, `DocumentReference` và `Composition` quan trọng hơn việc chỉ gửi một file PDF rời rạc.

## DICOM và PACS

DICOM là chuẩn quốc tế cho hình ảnh y khoa và thông tin liên quan. PACS là hệ thống lưu trữ, truy xuất và phân phối ảnh y khoa; trong prototype, Orthanc có thể đóng vai trò PACS nhẹ để thử nghiệm.

Nguồn: [DICOM Standard - Overview](https://www.dicomstandard.org/about)

Hàm ý cho dự án:

- Không lưu ảnh y khoa lớn trực tiếp vào bảng hồ sơ bệnh án.
- EMR nên lưu metadata và liên kết tới hệ thống PACS.
- Nếu demo ảnh y khoa, nên dùng Orthanc/DICOMweb thay vì tự chế định dạng.

## IHE MHD, PIXm và hướng chia sẻ tài liệu

IHE MHD định nghĩa API chuẩn hóa để chia sẻ tài liệu y tế trong môi trường mobile/constrained, dựa trên FHIR R4. IHE PIXm hỗ trợ đối chiếu định danh bệnh nhân giữa nhiều miền định danh.

Nguồn:

- [IHE MHD - Mobile access to Health Documents](https://profiles.ihe.net/ITI/MHD/index.html)
- [IHE PIXm - Patient Identifier Cross-referencing for mobile](https://profiles.ihe.net/ITI/PIXm/index.html)

Hàm ý cho dự án:

- Luồng “chuyển bệnh án giữa bệnh viện” nên hiểu là chia sẻ dữ liệu/tài liệu có metadata và định danh rõ ràng, không đơn thuần gửi file.
- Cần Patient Registry hoặc Master Patient Index khi liên thông nhiều bệnh viện.
- MHD là hướng phù hợp để nghiên cứu API chia sẻ tài liệu bệnh án theo FHIR.

## SMART App Launch

SMART App Launch là hướng chuẩn để ứng dụng bên thứ ba truy cập dữ liệu EHR/FHIR qua cơ chế ủy quyền an toàn dựa trên OAuth. Dự án chưa triển khai ngay, nhưng nên dành ranh giới kiến trúc cho luồng ứng dụng bên thứ ba.

Nguồn: [HL7 SMART App Launch](https://hl7.org/fhir/smart-app-launch/STU2.1/app-launch.html)

Hàm ý cho dự án:

- Không để ứng dụng ngoài truy cập trực tiếp database.
- Cần authorization server hoặc tích hợp IAM nếu phát triển thành nền tảng mở.
- Scope truy cập dữ liệu y tế cần rõ ràng theo từng vai trò và mục đích.

## Bảo mật và kiểm toán

OWASP API Security Top 10 2023 là nền kiểm tra rủi ro API. NIST SP 800-207 là tài liệu chính thức về Zero Trust Architecture. Với hệ thống bệnh án, hai hướng này giúp tránh thiết kế dựa vào niềm tin mạng nội bộ.

Nguồn:

- [OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0x00-header/)
- [NIST SP 800-207 - Zero Trust Architecture](https://www.nist.gov/publications/zero-trust-architecture-0)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

Hàm ý cho dự án:

- Mọi API cần xác thực, phân quyền và kiểm soát truy cập theo đối tượng dữ liệu.
- Cần chống lộ dữ liệu quá mức, truy cập sai bệnh nhân, thiếu rate limit và thiếu logging.
- Không mặc định tin cậy request chỉ vì nó đến từ mạng nội bộ.

## ISO 27799

ISO 27799 đưa ra kiểm soát an toàn thông tin trong lĩnh vực y tế dựa trên ISO/IEC 27002. Đây là nguồn tham chiếu tốt cho định hướng quản trị bảo mật, dù việc áp dụng chính thức cần xem bản tiêu chuẩn đầy đủ và yêu cầu của tổ chức.

Nguồn: [ISO 27799:2025](https://www.iso.org/standard/84647.html)

Hàm ý cho dự án:

- Cần chính sách phân quyền, lưu trữ, sao lưu, khôi phục và quản lý sự cố.
- Cần kiểm toán truy cập dữ liệu sức khỏe cá nhân.
- Cần tách rõ môi trường phát triển, thử nghiệm và sản xuất.
