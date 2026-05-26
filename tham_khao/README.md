# Thư Mục Tham Khảo

Thư mục này dùng để clone các dự án mã nguồn mở phục vụ nghiên cứu luồng EMR/EHR, FHIR và PACS/DICOM cho WiiiCare Nexus.

## Nguyên Tắc

- Mã nguồn clone về đặt trong `tham_khao/repos/` và không commit vào repo chính.
- Chỉ dùng các dự án tham khảo để học luồng nghiệp vụ, kiến trúc, thuật ngữ, API và mô hình dữ liệu.
- Không copy nguyên xi thiết kế, mã nguồn hoặc giao diện nếu chưa kiểm tra giấy phép và độ phù hợp.
- Khi rút ra quyết định kiến trúc cho dự án chính, ghi lại trong `docs/decisions/` hoặc `docs/ARCHITECTURE.md`.

## Dự Án Tham Khảo Ban Đầu

| Dự án | Vai trò tham khảo | Ghi chú |
| --- | --- | --- |
| OpenEMR | Luồng EMR thực tế: bệnh nhân, encounter, hồ sơ, billing/clinical workflow | Dùng để hiểu hệ EMR/HIS mở đầy đủ, không bê nguyên vào kiến trúc. |
| HAPI FHIR JPA Server Starter | FHIR server, lưu trữ và trao đổi resource HL7 FHIR | Dùng cho lớp liên thông, mapping `Patient`, `Encounter`, `Observation`, `DocumentReference`, `Composition`. |
| Orthanc Setup Samples | PACS/DICOM, DICOMweb và triển khai Orthanc | Dùng để hiểu cách EMR liên kết metadata ảnh thay vì lưu ảnh lớn trong database. |
| Vietsens/hisnguonmo | HIS nguồn mở bối cảnh Việt Nam | Dùng để tham khảo thuật ngữ/luồng nội địa, cần kiểm tra kỹ mức độ cập nhật và giấy phép. |

## Đường Dẫn Clone

```text
tham_khao/repos/openemr
tham_khao/repos/hapi-fhir-jpaserver-starter
tham_khao/repos/orthanc-setup-samples
tham_khao/repos/vietsens-hisnguonmo
```
