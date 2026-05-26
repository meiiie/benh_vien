# Thuật ngữ cốt lõi

## EMR

**Electronic Medical Record** là hồ sơ bệnh án điện tử trong phạm vi một cơ sở khám chữa bệnh. EMR tập trung vào quá trình khám, chẩn đoán, điều trị, chăm sóc, xét nghiệm, hình ảnh, thuốc, ký/xác nhận và lưu trữ hồ sơ tại cơ sở đó.

Trong dự án này, EMR là phần lõi cần xây.

## EHR

**Electronic Health Record** là hồ sơ sức khỏe điện tử có phạm vi rộng hơn EMR, hướng tới tổng hợp dữ liệu sức khỏe của người bệnh qua nhiều cơ sở và nhiều lần chăm sóc.

Trong đề tài liên thông, hệ thống có thể bắt đầu từ EMR nhưng nên thiết kế để tiến dần tới EHR.

## HIS

**Hospital Information System** là hệ thống thông tin bệnh viện. HIS thường bao gồm tiếp đón, đăng ký khám, quản lý khoa phòng, viện phí, bảo hiểm, điều phối dịch vụ, nhập viện, ra viện và các nghiệp vụ vận hành bệnh viện.

HIS không đồng nghĩa với EMR. HIS thiên về vận hành bệnh viện; EMR thiên về nội dung bệnh án và dữ liệu lâm sàng.

## LIS

**Laboratory Information System** là hệ thống thông tin xét nghiệm. LIS quản lý chỉ định xét nghiệm, lấy mẫu, mã vạch, kết nối máy xét nghiệm, trả kết quả và đồng bộ kết quả về hồ sơ bệnh án.

Trong kiến trúc này, LIS là hệ thống tích hợp hoặc context mở rộng, không phải phần lõi đầu tiên.

## PACS

**Picture Archiving and Communication System** là hệ thống lưu trữ và truyền tải hình ảnh y khoa. PACS xử lý ảnh X-quang, CT, MRI, siêu âm, nội soi và các dữ liệu hình ảnh theo chuẩn DICOM.

Trong dự án, PACS có thể được minh họa bằng Orthanc. EMR chỉ nên lưu metadata và liên kết tới ảnh, không lưu ảnh y khoa lớn trực tiếp trong bảng bệnh án.

## FHIR

**Fast Healthcare Interoperability Resources** là chuẩn trao đổi dữ liệu y tế của HL7. FHIR định nghĩa các resource như `Patient`, `Encounter`, `Observation`, `Condition`, `DocumentReference`, `Composition`.

Trong dự án này, FHIR là lớp liên thông. Domain model nội bộ vẫn có thể khác FHIR, sau đó được mapping sang FHIR khi cần trao đổi.

## DICOM

**Digital Imaging and Communications in Medicine** là chuẩn quốc tế cho hình ảnh y khoa và thông tin liên quan.

DICOM phù hợp với PACS và dữ liệu hình ảnh; FHIR phù hợp hơn với dữ liệu hành chính, lâm sàng và tài liệu.

## IHE MHD

**Mobile access to Health Documents** là hồ sơ IHE dùng FHIR để chia sẻ tài liệu y tế qua API. MHD phù hợp khi cần nghiên cứu luồng gửi, tìm kiếm và truy xuất tài liệu bệnh án giữa hệ thống.

## IHE PIXm

**Patient Identifier Cross-referencing for mobile** hỗ trợ đối chiếu định danh bệnh nhân giữa nhiều hệ thống hoặc nhiều miền định danh.

Đây là ý quan trọng nếu đề tài nói tới chuyển hồ sơ giữa bệnh viện: trước khi chuyển dữ liệu, phải xác định đúng người bệnh.

