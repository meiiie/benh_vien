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
- Cần cơ sở dữ liệu có migration, phân quyền, lưu vết, sao lưu và quy trình vận hành; phiên bản hiện tại mới đặt nền `patients`, `encounters`, `allergy_intolerances`, `conditions`, `service_requests`, `workflow_tasks`, `procedures`, `observations`, `diagnostic_reports`, `imaging_studies`, `medication_requests`, `medication_dispenses`, `medication_administrations`, `clinical_documents`, `consents`, `record_transfers`, `provider_directory_resources`, `audit_events`, chưa tuyên bố đạt điều kiện triển khai bệnh viện thật.

## HL7 FHIR R4

HL7 FHIR là chuẩn trao đổi dữ liệu y tế. Bản R4 vẫn là lựa chọn thực tế cho nhiều hệ thống vì mức độ hỗ trợ công cụ và triển khai rộng. Trong dự án này, FHIR được dùng làm lớp liên thông, không thay thế toàn bộ domain model nội bộ.

Nguồn:

- [HL7 FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [FHIR Patient Resource](https://hl7.org/fhir/R4/patient.html)
- [FHIR Organization Resource](https://hl7.org/fhir/R4/organization.html)
- [FHIR Practitioner Resource](https://hl7.org/fhir/R4/practitioner.html)
- [FHIR PractitionerRole Resource](https://hl7.org/fhir/R4/practitionerrole.html)
- [FHIR Endpoint Resource](https://hl7.org/fhir/R4/endpoint.html)
- [FHIR Encounter Resource](https://hl7.org/fhir/R4/encounter.html)
- [FHIR AllergyIntolerance Resource](https://hl7.org/fhir/R4/allergyintolerance.html)
- [FHIR Condition Resource](https://hl7.org/fhir/R4/condition.html)
- [FHIR ServiceRequest Resource](https://hl7.org/fhir/R4/servicerequest.html)
- [FHIR Task Resource](https://hl7.org/fhir/R4/task.html)
- [FHIR Procedure Resource](https://hl7.org/fhir/R4/procedure.html)
- [FHIR Workflow Module](https://hl7.org/fhir/R4/workflow.html)
- [FHIR Observation Resource](https://hl7.org/fhir/R4/observation.html)
- [FHIR DiagnosticReport Resource](https://hl7.org/fhir/R4/diagnosticreport.html)
- [FHIR ImagingStudy Resource](https://hl7.org/fhir/R4/imagingstudy.html)
- [FHIR MedicationRequest Resource](https://hl7.org/fhir/R4/medicationrequest.html)
- [FHIR MedicationDispense Resource](https://hl7.org/fhir/R4/medicationdispense.html)
- [FHIR MedicationAdministration Resource](https://hl7.org/fhir/R4/medicationadministration.html)
- [FHIR Composition Resource](https://hl7.org/fhir/R4/composition.html)
- [FHIR Bundle Resource](https://hl7.org/fhir/R4/bundle.html)
- [FHIR DocumentReference Resource](https://hl7.org/fhir/R4/documentreference.html)
- [FHIR Attachment Data Type](https://hl7.org/fhir/R4/datatypes.html#Attachment)
- [FHIR Provenance Resource](https://hl7.org/fhir/R4/provenance.html)
- [FHIR Consent Resource](https://hl7.org/fhir/R4/consent.html)
- [FHIR AuditEvent Resource](https://hl7.org/fhir/R4/auditevent.html)
- [FHIR CapabilityStatement Resource](https://hl7.org/fhir/R4/capabilitystatement.html)
- [HL7 Terminology - DataOperation](https://terminology.hl7.org/5.1.0/CodeSystem-v3-DataOperation.html)

Hàm ý cho dự án:

- `Patient` là resource nền cho hồ sơ bệnh nhân.
- `Organization`, `Practitioner`, `PractitionerRole` và `Endpoint` tạo thành Provider Directory tối thiểu: cơ sở/khoa phòng, nhân sự, vai trò của nhân sự trong cơ sở và điểm kết nối kỹ thuật. Đây là lớp cần có để các tham chiếu trong `Patient.managingOrganization`, `Encounter.participant`, `DiagnosticReport.performer`, `ImagingStudy.endpoint` không bị rỗng ngữ cảnh khi chuyển viện/liên viện.
- `Encounter` đặt ngữ cảnh lượt khám/đợt điều trị cho chẩn đoán, tài liệu và chỉ số lâm sàng.
- `AllergyIntolerance` phù hợp cho nguy cơ phản ứng bất lợi với thuốc, thực phẩm, môi trường hoặc sinh phẩm; nên xem trước khi kê thuốc và không trộn lẫn với chẩn đoán bệnh thông thường.
- `Condition` phù hợp cho chẩn đoán, vấn đề sức khỏe và problem list; nên đi kèm ICD-10/SNOMED CT hoặc danh mục được bệnh viện phê duyệt khi có dữ liệu thật.
- `ServiceRequest` phù hợp cho chỉ định xét nghiệm, chẩn đoán hình ảnh, thủ thuật, hội chẩn hoặc dịch vụ điều trị; đây là yêu cầu thực hiện, không phải kết quả cuối cùng. Khi xuất FHIR, nhóm chỉ định nội bộ được ánh xạ sang SNOMED CT theo value set ví dụ của HL7 để tránh dùng mã UI làm mã trao đổi. Kết quả xét nghiệm/hình ảnh về sau nên được biểu diễn bằng `Observation`, `DiagnosticReport`, `ImagingStudy` hoặc tài liệu phù hợp.
- `Task` phù hợp để theo dõi trạng thái thực thi của một công việc chăm sóc y tế: đã yêu cầu, đã nhận, đang thực hiện, hoàn tất hoặc thất bại. Trong dự án này, `Task` không thay thế `ServiceRequest`; `Task.focus`/`basedOn` trỏ về y lệnh gốc, còn `output` trỏ tới kết quả như `Observation`, `DiagnosticReport` hoặc `ImagingStudy`. Với chuyển hồ sơ liên viện, `RecordTransfer` cũng xuất thành FHIR `Task`, nhưng `focus` trỏ tới FHIR `Bundle` đích và `owner` là cơ sở nhận.
- `Procedure` phù hợp để ghi nhận hành động y tế đã thực hiện cho người bệnh: thủ thuật, chẩn đoán hình ảnh đã thực hiện, tư vấn, phục hồi chức năng hoặc can thiệp điều trị. Trong dự án này, `Procedure` không thay thế `ServiceRequest` hay `Task`; nó là bằng chứng lâm sàng “đã làm gì”, có thể nối `basedOn` về y lệnh, `performer` về người/khoa thực hiện, `performedPeriod` về thời gian, `bodySite` về vị trí cơ thể và `report` về báo cáo liên quan.
- `Observation` phù hợp cho sinh hiệu, kết quả xét nghiệm và chỉ số có cấu trúc; nên đi kèm mã chuẩn như LOINC khi có dữ liệu thật.
- `DiagnosticReport` phù hợp cho báo cáo xét nghiệm/hình ảnh đã phát hành; nên dùng `basedOn` để nối y lệnh `ServiceRequest` và `result` để tham chiếu các `Observation` nguyên tử.
- `ImagingStudy` phù hợp để biểu diễn metadata của một nghiên cứu DICOM/PACS. Resource này nên chứa DICOM Study Instance UID trong `identifier`, trạng thái, modality, bệnh nhân, lượt khám, y lệnh gốc, endpoint truy xuất ảnh, số series, số instance và series metadata; không dùng nó để lưu ảnh nhị phân trực tiếp.
- `MedicationRequest` phù hợp cho yêu cầu/chỉ định dùng thuốc, gồm trạng thái, mục đích, thuốc, bệnh nhân, lượt khám, người kê và hướng dẫn dùng thuốc; không nên đồng nhất với cấp phát hoặc dùng thuốc thực tế.
- `MedicationDispense` phù hợp cho sự kiện thuốc đã được cấp phát cho người bệnh hoặc khoa/phòng, thường là kết quả của hệ thống dược/kho đáp ứng một `MedicationRequest`. Trong dự án này, resource này giữ các thông tin “đã cấp bao nhiêu, cấp cho bao nhiêu ngày, chuẩn bị/bàn giao lúc nào, ai cấp và ai nhận”.
- `MedicationAdministration` phù hợp cho sự kiện thuốc đã được dùng hoặc được xác nhận dùng cho người bệnh. Trong dự án này, resource này đóng vòng `MedicationRequest -> MedicationDispense -> MedicationAdministration`: chỉ định thuốc là “cần dùng thuốc gì”, cấp phát thuốc là “đã bàn giao thuốc gì, bao nhiêu”, còn dùng thuốc thực tế là “đã dùng lúc nào, liều bao nhiêu, ai/thiết bị nào xác nhận”.
- `Composition` phù hợp để tạo mục lục lâm sàng cho một FHIR document. Khi `Bundle.type = document`, entry đầu tiên bắt buộc phải là `Composition`; các section của Composition nên tham chiếu các resource nằm trong Bundle.
- `DocumentReference.content.attachment` nên có metadata kiểm tra tối thiểu: `contentType` để bên nhận biết định dạng, `size` theo kiểu FHIR `unsignedInt`, `hash` dạng SHA-1 Base64 để kiểm tra nội dung lấy từ URL không thay đổi và `creation` để biết thời điểm tệp được tạo. `hash` là checksum theo chuẩn FHIR R4, không thay thế chữ ký số pháp lý.
- `Provenance` phù hợp để ghi nguồn gốc của một resource: ai tham gia, hoạt động gì đã xảy ra, xảy ra khi nào và resource nào là đích. Trong dự án này, tài liệu bệnh án đã ký có thể xuất `Provenance` trỏ tới `DocumentReference`, dùng `recorded`/`occurredDateTime` theo thời điểm ký và `agent.who` trỏ tới bác sĩ/người chịu trách nhiệm. Resource này không thay thế chữ ký số pháp lý; nếu triển khai chữ ký số thật thì mới bổ sung `Provenance.signature`.
- `Consent` là hướng chuẩn FHIR để biểu diễn đồng ý, chính sách chia sẻ và trạng thái hiệu lực của đồng ý. Domain hiện dùng trạng thái nội bộ `active`, `revoked`, `expired`; khi ánh xạ sang FHIR, `active` được giữ là `active`, còn `revoked`/`expired` được biểu diễn là `inactive` kèm metadata giải thích trong extension nội bộ của prototype.
- `AuditEvent` dùng để biểu diễn sự kiện bảo mật/kiểm toán. Domain hiện ánh xạ action nội bộ sang `AuditEvent.type`, `subtype`, `action`, `recorded`, `agent`, `source`, `entity` và các `detail` chứa hash toàn vẹn; đây là profile tối thiểu để kiểm toán viên xem log theo ngôn ngữ FHIR R4.
- `CapabilityStatement` dùng để công bố năng lực FHIR của facade. Endpoint `/api/v1/fhir/metadata` hiện khai báo các resource R4 đang xuất được, chế độ `server`, định dạng `json`, endpoint triển khai và cảnh báo rằng prototype chưa phải FHIR REST server đầy đủ.
- Khi phát triển tiếp cần bổ sung Medication Administration Record (MAR), kiểm tra barcode/5 đúng dùng thuốc, workflow duyệt đơn thuốc và ràng buộc profile cụ thể hơn.
- Với liên thông bệnh án, `DocumentReference` và `Composition` quan trọng hơn việc chỉ gửi một file PDF rời rạc.

## DICOM và PACS

DICOM là chuẩn quốc tế cho hình ảnh y khoa và thông tin liên quan. PACS là hệ thống lưu trữ, truy xuất và phân phối ảnh y khoa; trong prototype, Orthanc có thể đóng vai trò PACS nhẹ để thử nghiệm.

Nguồn: [DICOM Standard - Overview](https://www.dicomstandard.org/about)

Hàm ý cho dự án:

- Không lưu ảnh y khoa lớn trực tiếp vào bảng hồ sơ bệnh án.
- EMR nên lưu metadata và liên kết tới hệ thống PACS.
- Với FHIR R4, metadata PACS nên đi qua `ImagingStudy`; ảnh thật nên được truy xuất bằng PACS/DICOMweb như WADO-RS hoặc viewer chuyên dụng.
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
- `RecordTransfer` là lớp vận hành nội bộ để chuẩn bị cho MHD/XDS trong tương lai; nó không thay thế `DocumentReference`, `Composition` hoặc `Bundle`, mà theo dõi việc gửi gói hồ sơ tới bên nhận. Trước khi tạo/gửi, đơn vị nhận phải có endpoint FHIR REST hỗ trợ `Bundle`; sau đó hệ thống ghi một delivery attempt dạng outbox cho từng lần gửi, kèm idempotency key để chống gửi trùng. Delivery worker có thể POST FHIR Bundle sang endpoint đích và ghi `succeeded/failed`; retry worker chỉ đưa gói lỗi đã đến hạn về hàng đợi gửi lại khi còn lượt thử, hoặc chuyển sang `dead-lettered` để nhân sự vận hành xử lý khi quá trần retry. Khi bên nhận xác nhận thủ công, hệ thống lưu người xác nhận và mã biên nhận kỹ thuật; đây là biên nhận vận hành, chưa thay thế chữ ký số, giao dịch IHE MHD hoặc callback xác thực hai chiều. Đây vẫn chưa phải IHE MHD đầy đủ vì chưa có profile/transaction MHD và registry tài liệu chuẩn hóa.

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
