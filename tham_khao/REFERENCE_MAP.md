# Reference Map

Ngày tạo: 27/05/2026.

## Trạng Thái Clone

| Dự án | Remote | Commit | Sparse checkout |
| --- | --- | --- | --- |
| OpenEMR | `https://github.com/openemr/openemr.git` | `d096fa7` | `Documentation`, `apis`, `docs`, `interface`, `library`, `oauth2`, `portal`, `sql`, `src`, `swagger` |
| HAPI FHIR JPA Server Starter | `https://github.com/hapifhir/hapi-fhir-jpaserver-starter.git` | `d4368b8` | `charts`, `configs`, `custom`, `src` |
| Orthanc Setup Samples | `https://github.com/orthanc-server/orthanc-setup-samples.git` | `53651d3` | `dicomFiles`, `docker`, `lua-samples`, `python-samples`, `windows` |
| Vietsens/hisnguonmo | `https://github.com/Vietsens/hisnguonmo.git` | `3b87b2ce` | `HIS`, `MPS`, `UC` |

Ghi chú: `Vietsens/hisnguonmo` có nhiều đường dẫn .NET rất sâu trong `Common/...ElectronicBill/...Service References`, dễ lỗi `Filename too long` trên Windows. Vì vậy chỉ checkout `HIS`, `MPS`, `UC` để tham khảo luồng chính, không kéo toàn bộ `Common`.

## Luồng Đối Chiếu Với WiiiCare Nexus

### 1. Patient Registry Và Hồ Sơ Hành Chính

Nguồn chính:

- OpenEMR: `API_README.md`, `Documentation/api/FHIR_API.md`, `Documentation/api/STANDARD_API.md`.
- Vietsens: `HIS/HIS.Desktop.ADO`, `UC/Inventec.UC.TreatmentRecord`.

Áp dụng cho dự án:

- Bệnh nhân phải có nhiều định danh: mã bệnh viện, giấy tờ quốc gia, mã liên thông.
- `Patient Registry` là module nền trước khi làm encounter, hồ sơ điều trị, tài liệu và liên thông.
- Không đồng nhất `Patient` nội bộ với FHIR `Patient`; cần mapping rõ.

### 2. Encounter, Treatment Và Clinical Document

Nguồn chính:

- OpenEMR: luồng encounter và tài liệu qua Standard API/FHIR API.
- Vietsens: các thành phần `TreatmentRecord`, `AssignService`, `AssignPrescription`, `TreeSereServHein`.

Áp dụng cho dự án:

- Cần bổ sung bounded context `encounters` hoặc `clinical-records`.
- Tài liệu lâm sàng nên có vòng đời `draft -> signed -> superseded/entered-in-error`.
- Khi ký hoặc chia sẻ hồ sơ phải ghi audit event.

### 3. Liên Thông FHIR

Nguồn chính:

- HAPI FHIR JPA Server Starter: `src/main/resources/application.yaml`, `src/main/java/ca/uhn/fhir/jpa/starter`.
- OpenEMR: `FHIR_README.md`, `API_README.md`, `Documentation/api/FHIR_API.md`.

Áp dụng cho dự án:

- WiiiCare Nexus nên giữ FHIR là lớp trao đổi, không biến FHIR server thành database nghiệp vụ duy nhất.
- Giai đoạn tới cần mapping thêm `Encounter`, `Condition`, `Observation`, `DocumentReference`, `Composition`.
- Có thể bật HAPI FHIR như hệ thống liên thông ngoài, rồi kiểm thử round-trip xuất/nhập dữ liệu.

### 4. PACS/DICOM Và Ảnh Y Khoa

Nguồn chính:

- Orthanc Setup Samples: `docker/dicom-web`, `docker/ohif`, `docker/postgresql`, `python-samples`.

Áp dụng cho dự án:

- EMR chỉ lưu metadata và liên kết tới ảnh; không lưu DICOM lớn trực tiếp trong PostgreSQL nghiệp vụ.
- Cần module `imaging` để quản lý study/series/instance metadata, accession number và liên kết bệnh nhân.
- Nếu demo ảnh, nên dùng Orthanc + DICOMweb/OHIF thay vì tự chế viewer.

## Nhận Định Sau Khi Mở Web Hiện Tại

Trang `http://localhost:7311/` hiện là landing/demo giới thiệu kiến trúc. Người dùng chưa thấy luồng nghiệp vụ vì FE chưa gọi API và chưa có màn hình thao tác.

Luồng nên làm tiếp theo:

1. Tạo màn hình `Patient Registry` gọi `GET /api/v1/patients`.
2. Cho phép xem chi tiết bệnh nhân và tab FHIR JSON từ `GET /api/v1/patients/:id/fhir`.
3. Thêm mock luồng `Clinical Document`: tạo nháp, ký, xuất `DocumentReference`.
4. Sau đó mới nối HAPI FHIR và Orthanc thật trong Docker profile.
