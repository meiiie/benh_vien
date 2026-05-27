# Roadmap phát triển

## Giai đoạn 0: Nền móng kiến trúc

- Hoàn thiện monorepo, domain model, API prototype và tài liệu chuẩn.
- Chốt phạm vi đề tài: EMR/EHR liên thông, không cố xây HIS đầy đủ trong phiên bản đầu.
- Xây bộ thuật ngữ thống nhất: HIS, LIS, PACS, EMR, EHR, FHIR, DICOM, MHD, PIXm.

## Giai đoạn 1: Hồ sơ bệnh nhân và tài liệu bệnh án

- Patient Registry: nhiều định danh cho một bệnh nhân.
- Provider Directory: cơ sở y tế, khoa/phòng, nhân sự, vai trò và endpoint liên thông.
- Workflow core: hàng đợi thực thi y lệnh bằng FHIR `Task`, nối `ServiceRequest` với kết quả trả về từ LIS/PACS/RIS.
- Procedure core: bản ghi thủ thuật/hoạt động y tế đã thực hiện bằng FHIR `Procedure`, nối y lệnh, người thực hiện, thời gian và báo cáo liên quan.
- Clinical Records: tài liệu bệnh án, trạng thái ký/xác nhận, lịch sử chỉnh sửa.
- Audit & Compliance: nhật ký xem, sửa, ký, xuất hồ sơ.
- Web demo: màn hình bệnh nhân, danh sách tài liệu, trạng thái ký.

## Giai đoạn 2: Liên thông FHIR

- Kết nối HAPI FHIR ở chế độ thử nghiệm.
- Mapping `Patient`, `Organization`, `Practitioner`, `PractitionerRole`, `Endpoint`, `Encounter`, `AllergyIntolerance`, `Condition`, `ServiceRequest`, `Task`, `Procedure`, `Observation`, `DiagnosticReport`, `ImagingStudy`, `MedicationRequest`, `DocumentReference`, `Composition`.
- Tạo luồng xuất gói hồ sơ bệnh án cho một bệnh nhân.
- Kiểm tra luồng nhận lại dữ liệu từ FHIR server.

## Giai đoạn 3: Ảnh y khoa và PACS

- Kết nối Orthanc.
- Đã có lát cắt tối thiểu để lưu metadata ảnh trong EMR bằng FHIR `ImagingStudy`; ảnh thật vẫn nằm trong PACS.
- Đã hiển thị danh sách study/series và liên kết y lệnh, báo cáo chẩn đoán hình ảnh trong Patient Workspace.
- Nghiên cứu DICOMweb nếu cần tích hợp hiện đại hơn.

## Giai đoạn 4: Bảo mật, vận hành và chuẩn hóa

- Tích hợp IAM/SSO, phân quyền theo vai trò và ngữ cảnh điều trị.
- Hoàn thiện audit trail và báo cáo tuân thủ.
- Bổ sung kiểm thử bảo mật API theo OWASP.
- Chuẩn hóa backup, restore, retention và disaster recovery.

## Giai đoạn 5: Mở rộng kiến trúc

Chỉ tách microservice khi có lý do thật:

- `Interoperability Service` khi cần nhiều adapter và nhiều bệnh viện.
- `Imaging Service` khi dữ liệu ảnh lớn hoặc cần vận hành PACS riêng.
- `Audit Service` khi cần lưu trữ bất biến hoặc kiểm toán độc lập.
- `Identity Service` khi có nhiều ứng dụng cùng dùng định danh và phân quyền.
