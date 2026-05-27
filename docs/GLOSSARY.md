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

**Fast Healthcare Interoperability Resources** là chuẩn trao đổi dữ liệu y tế của HL7. FHIR định nghĩa các resource như `Patient`, `Organization`, `Practitioner`, `PractitionerRole`, `Endpoint`, `Encounter`, `AllergyIntolerance`, `Condition`, `ServiceRequest`, `Task`, `Procedure`, `Observation`, `DiagnosticReport`, `MedicationRequest`, `MedicationAdministration`, `DocumentReference`, `Composition`.

Trong dự án này, FHIR là lớp liên thông. Domain model nội bộ vẫn có thể khác FHIR, sau đó được mapping sang FHIR khi cần trao đổi.

## Provider Directory

**Provider Directory** là danh bạ cơ sở cung cấp dịch vụ y tế, thường gồm bệnh viện, khoa/phòng, nhân sự, vai trò của nhân sự và endpoint kỹ thuật để trao đổi dữ liệu. Trong FHIR R4, phần này thường được biểu diễn bằng `Organization`, `Practitioner`, `PractitionerRole` và `Endpoint`.

Trong dự án này, Provider Directory giúp các tham chiếu như cơ sở quản lý hồ sơ, khoa thực hiện xét nghiệm, bác sĩ chỉ định, bác sĩ đọc ảnh và endpoint PACS/FHIR không bị rỗng ngữ cảnh khi xuất Bundle chuyển viện/liên viện.

## AllergyIntolerance

**AllergyIntolerance** là resource FHIR dùng để ghi nhận nguy cơ dị ứng, không dung nạp hoặc phản ứng bất lợi với thuốc, thực phẩm, môi trường hoặc sinh phẩm. Trong EMR, phần này nên được đặt nổi bật trước luồng kê thuốc để bác sĩ nhìn thấy cảnh báo an toàn trước khi ra y lệnh.

Trong dự án này, AllergyIntolerance là lát cắt an toàn lâm sàng tối thiểu: ghi tác nhân, nhóm dị ứng, mức cảnh báo, trạng thái xác minh, biểu hiện phản ứng và người ghi nhận.

## ServiceRequest

**ServiceRequest** là resource FHIR dùng cho chỉ định dịch vụ như xét nghiệm, chẩn đoán hình ảnh, thủ thuật, hội chẩn hoặc điều trị hỗ trợ. Đây là phần “yêu cầu thực hiện” trước khi có kết quả trả về.

Trong dự án này, ServiceRequest là cầu nối từ EMR sang LIS/PACS/RIS: bác sĩ tạo chỉ định, hệ thống lưu mã dịch vụ, mức ưu tiên, khoa thực hiện, thời điểm dự kiến, người chỉ định và chẩn đoán liên quan.

## Task

**Task** là resource FHIR dùng để theo dõi một công việc cần thực hiện hoặc đang được thực hiện. Task phù hợp với hàng đợi nhận mẫu xét nghiệm, lịch chụp ảnh, đọc kết quả, hoàn tất báo cáo hoặc các bước vận hành khác.

Trong dự án này, Task đóng vòng `ServiceRequest -> Task -> Output`: y lệnh gốc vẫn là ServiceRequest, còn Task theo dõi trạng thái thực thi, đơn vị phụ trách, thời gian bắt đầu/kết thúc và kết quả đầu ra như Observation, DiagnosticReport hoặc ImagingStudy.

## Procedure

**Procedure** là resource FHIR dùng để ghi nhận thủ thuật hoặc hoạt động y tế đã thực hiện cho người bệnh. Procedure khác `ServiceRequest` ở chỗ nó không phải yêu cầu thực hiện, và khác `Task` ở chỗ nó không phải hàng đợi vận hành.

Trong dự án này, Procedure đóng vai trò “đã làm gì cho bệnh nhân”: ghi y lệnh gốc nếu có, lượt khám, thời gian thực hiện, người/khoa thực hiện, vị trí cơ thể, kết quả thủ thuật và báo cáo liên quan. Ví dụ: chụp X-quang đã thực hiện, tư vấn người bệnh hoặc một thủ thuật điều trị.

## DiagnosticReport

**DiagnosticReport** là resource FHIR dùng cho báo cáo kết quả xét nghiệm, chẩn đoán hình ảnh, giải phẫu bệnh hoặc các báo cáo chẩn đoán tương tự. Nó thường tham chiếu y lệnh gốc qua `basedOn` và tham chiếu kết quả nguyên tử qua `result`.

Trong dự án này, DiagnosticReport đóng vòng `ServiceRequest -> Observation -> DiagnosticReport`: y lệnh đi ra LIS/RIS/PACS, kết quả nguyên tử được lưu bằng Observation, còn báo cáo tổng hợp/kết luận được xuất bằng DiagnosticReport.

## ImagingStudy

**ImagingStudy** là resource FHIR mô tả metadata của một nghiên cứu hình ảnh DICOM/PACS. Nó không chứa ảnh nhị phân, mà mô tả Study Instance UID, Accession Number, modality, series, số ảnh, bệnh nhân, lượt khám, y lệnh gốc và endpoint để truy xuất ảnh qua PACS/DICOMweb.

Trong dự án này, ImagingStudy là lát cắt PACS tối thiểu sau `ServiceRequest` và `DiagnosticReport`: bác sĩ tạo y lệnh hình ảnh, PACS/RIS sinh metadata ảnh, báo cáo hình ảnh được lưu bằng DiagnosticReport, còn Bundle liên viện có thêm chỉ mục ảnh máy đọc được.

## MedicationAdministration

**MedicationAdministration** là resource FHIR ghi nhận việc thuốc đã được dùng hoặc được xác nhận dùng cho người bệnh. Resource này khác `MedicationRequest`: `MedicationRequest` là chỉ định/kế hoạch dùng thuốc, còn `MedicationAdministration` là sự kiện thực tế có thời điểm, liều dùng và người/thiết bị xác nhận.

Trong dự án này, MedicationAdministration đóng vòng điều trị thuốc tối thiểu: bác sĩ kê đơn bằng MedicationRequest, nhân sự y tế hoặc hệ thống xác nhận lần dùng thuốc bằng MedicationAdministration, và Bundle liên viện có đủ cả “đã kê gì” lẫn “đã dùng gì”.

## Composition

**Composition** là resource FHIR mô tả cấu trúc của một tài liệu lâm sàng. Trong FHIR document, `Composition` phải nằm ở entry đầu tiên của `Bundle.type = document` và các section của nó tham chiếu tới những resource tạo nên nội dung tài liệu.

Trong dự án này, Composition đóng vai trò mục lục bệnh án điện tử khi xuất hồ sơ chuyển viện/liên viện: nhóm lượt khám, dị ứng, chẩn đoán, y lệnh, kết quả, ảnh y khoa, thuốc và tài liệu lâm sàng vào một gói có cấu trúc.

## DICOM

**Digital Imaging and Communications in Medicine** là chuẩn quốc tế cho hình ảnh y khoa và thông tin liên quan.

DICOM phù hợp với PACS và dữ liệu hình ảnh; FHIR phù hợp hơn với dữ liệu hành chính, lâm sàng và tài liệu.

## IHE MHD

**Mobile access to Health Documents** là hồ sơ IHE dùng FHIR để chia sẻ tài liệu y tế qua API. MHD phù hợp khi cần nghiên cứu luồng gửi, tìm kiếm và truy xuất tài liệu bệnh án giữa hệ thống.

## IHE PIXm

**Patient Identifier Cross-referencing for mobile** hỗ trợ đối chiếu định danh bệnh nhân giữa nhiều hệ thống hoặc nhiều miền định danh.

Đây là ý quan trọng nếu đề tài nói tới chuyển hồ sơ giữa bệnh viện: trước khi chuyển dữ liệu, phải xác định đúng người bệnh.
