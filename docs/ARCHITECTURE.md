# Kiến trúc hệ thống

## Mục tiêu

Dự án hướng tới một nền tảng bệnh án điện tử có thể giải thích rõ trong bối cảnh học thuật, đồng thời đủ thực tế để mở rộng thành hệ thống thí nghiệm nghiêm túc. Trọng tâm không phải là “làm một HIS hoàn chỉnh ngay lập tức”, mà là xây phần lõi EMR/EHR có khả năng liên thông với HIS, LIS, PACS và các hệ thống bên ngoài.

## Lựa chọn kiến trúc khởi đầu

Kiến trúc khởi đầu là **modular monolith theo DDD**. Lý do:

- Dự án còn ở giai đoạn khám phá, chưa nên trả chi phí vận hành của microservice quá sớm.
- Ranh giới nghiệp vụ vẫn được tách rõ để sau này có thể tách service.
- Giao tiếp nội bộ trước mắt dùng module boundary trong mã nguồn; giao tiếp liên thông bên ngoài dùng API và chuẩn FHIR.
- Các thành phần hạ tầng như HAPI FHIR, Orthanc, PostgreSQL, Redis/Valkey và MinIO được để trong `infra/` như môi trường thử nghiệm, không tự bật.

## Bounded context

| Context | Vai trò | Có thể tách service khi nào |
| --- | --- | --- |
| Identity & Access | Người dùng, vai trò, quyền truy cập, phiên đăng nhập | Khi cần SSO, tích hợp định danh ngoài hoặc nhiều ứng dụng dùng chung |
| Patient Registry | Hồ sơ hành chính, định danh bệnh nhân, đối soát mã bệnh nhân | Khi cần liên thông nhiều bệnh viện hoặc master patient index |
| Clinical Records | Bệnh án, chẩn đoán, y lệnh, diễn biến, tài liệu lâm sàng | Khi khối lượng tài liệu và quy trình ký/xác nhận tăng |
| Consent & Sharing | Consent chia sẻ hồ sơ, đơn vị nhận, thời hạn hiệu lực và căn cứ xuất dữ liệu | Khi có nhiều chính sách chia sẻ, nhiều bệnh viện nhận hoặc cần đồng bộ consent từ hệ thống ngoài |
| Interoperability | FHIR facade, mapping dữ liệu, luồng gửi/nhận tài liệu | Khi kết nối nhiều chuẩn và nhiều đối tác |
| Imaging | Tích hợp PACS, DICOM/DICOMweb, báo cáo hình ảnh | Khi dữ liệu ảnh lớn hoặc cần quản trị riêng |
| Audit & Compliance | Nhật ký truy cập, nhật ký chỉnh sửa, báo cáo tuân thủ | Khi có yêu cầu kiểm toán độc lập |

## Sơ đồ tổng quan

```mermaid
flowchart LR
  Doctor["Bác sĩ / điều dưỡng"]
  Admin["Nhân sự hành chính"]
  Portal["Cổng người bệnh"]
  Web["Web App"]
  Api["WiiiCare Nexus API"]
  Domain["Domain modules"]
  Db[("PostgreSQL")]
  ObjectStore[("MinIO / Object Storage")]
  Fhir["HAPI FHIR Server"]
  Pacs["Orthanc PACS"]
  External["Bệnh viện / hệ thống ngoài"]

  Doctor --> Web
  Admin --> Web
  Portal --> Web
  Web --> Api
  Api --> Domain
  Domain --> Db
  Domain --> ObjectStore
  Api --> Fhir
  Api --> Pacs
  Fhir --> External
  Pacs --> External
```

## Luồng bệnh án điện tử ở mức khái niệm

```mermaid
sequenceDiagram
  actor User as Nhân viên y tế
  participant App as Ứng dụng WiiiCare Nexus
  participant EMR as Clinical Records
  participant Audit as Audit & Compliance
  participant FHIR as FHIR facade
  participant Partner as Hệ thống nhận liên thông

  User->>App: Tạo/cập nhật nội dung bệnh án
  App->>EMR: Ghi tài liệu lâm sàng
  EMR->>Audit: Ghi nhật ký thao tác
  User->>App: Ký hoặc xác nhận điện tử
  App->>EMR: Chuyển trạng thái tài liệu sang signed
  EMR->>FHIR: Chuyển đổi sang FHIR Patient/Encounter/DocumentReference/Composition
  FHIR->>Partner: Chia sẻ theo API hoặc hồ sơ IHE phù hợp
```

## Nguyên tắc dữ liệu

- **Không coi FHIR là database nội bộ duy nhất.** FHIR là lớp trao đổi và liên thông; domain model vẫn giữ ngữ nghĩa nghiệp vụ của hệ thống.
- **PostgreSQL là hệ quản trị dữ liệu nghiệp vụ chính.** Dữ liệu lõi như bệnh nhân, tài liệu lâm sàng và audit trail được quản lý bằng migration SQL, không phụ thuộc vào dữ liệu demo trong bộ nhớ.
- **Không coi một mã bệnh nhân là đủ.** Cần quản lý nhiều định danh: mã bệnh viện, số định danh cá nhân, mã bảo hiểm y tế, mã hệ thống cũ.
- **Tài liệu phải đi qua ngữ cảnh lượt khám/đợt điều trị khi có thể.** OpenEMR cho thấy tài liệu rời rạc khó sử dụng nếu không bám vào patient chart và encounter timeline.
- **Tài liệu bệnh án cần có vòng đời.** Tối thiểu gồm nháp, đã ký, bị thay thế, nhập sai.
- **Chia sẻ hồ sơ cần consent có trạng thái và thời hạn.** FHIR Bundle liên viện không được xuất chỉ vì người dùng có role điều trị; phải có consent khớp bệnh nhân, đơn vị nhận và thời điểm truy cập.
- **Ảnh y khoa đi theo chuẩn riêng.** Ảnh X-quang, CT, MRI, siêu âm nên đi qua PACS/DICOM, không nhồi trực tiếp vào bảng bệnh án.
- **Mọi truy cập nhạy cảm cần kiểm toán.** Bệnh án là dữ liệu đặc biệt nhạy cảm, không thể thiếu audit trail.

## Lược đồ dữ liệu nền tảng

Phiên bản hiện tại tạo các bảng tối thiểu:

- `patients`: hồ sơ hành chính và định danh bệnh nhân, dùng `jsonb` cho nhiều định danh.
- `encounters`: lượt khám hoặc đợt điều trị, là cầu nối giữa bệnh nhân, tài liệu, người phụ trách và FHIR Encounter.
- `clinical_documents`: tài liệu lâm sàng có vòng đời nháp, đã ký, bị thay thế hoặc nhập sai.
- `consents`: consent chia sẻ hồ sơ theo bệnh nhân, đơn vị nhận, trạng thái và thời hạn hiệu lực.
- `audit_events`: nhật ký thao tác theo thời gian, tài nguyên, bệnh nhân và mục đích sử dụng.
- `schema_migrations`: quản lý migration đã áp dụng.

## Luồng mở rộng dự kiến

1. Hoàn thiện registry bệnh nhân và tài liệu lâm sàng tối thiểu.
2. Kết nối HAPI FHIR để xuất/nhập `Patient`, `Encounter`, `Observation`, `Condition`, `DocumentReference`, `Composition`.
3. Kết nối Orthanc để minh họa PACS/DICOM và DICOMweb.
4. Bổ sung xác thực, phân quyền, nhật ký kiểm toán và chính sách lưu trữ.
5. Nếu cần mở rộng lớn, tách `Interoperability`, `Imaging`, `Audit` thành service riêng.
