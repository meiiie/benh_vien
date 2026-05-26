# Ví dụ API

API hiện tại là prototype tối thiểu để kiểm chứng hướng kiến trúc. Chưa có database thật, dữ liệu đang nằm trong in-memory repository.

## Kiểm tra sức khỏe API

```bash
curl http://localhost:7310/health
```

## Lấy danh sách bệnh nhân

```bash
curl http://localhost:7310/api/v1/patients
```

## Tạo bệnh nhân mới

```bash
curl -X POST http://localhost:7310/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{
    "identifiers": [
      {
        "system": "urn:benh-vien-so:mrn",
        "value": "MRN-HP-0002",
        "type": "hospital-mrn"
      }
    ],
    "fullName": "Trần Thị Bình",
    "birthDate": "1992-09-18",
    "gender": "female",
    "address": "Hải Phòng, Việt Nam",
    "phone": "0900000002",
    "managingOrganizationId": "hospital-hai-phong-demo"
  }'
```

## Xuất bệnh nhân sang FHIR Patient

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/fhir
```

Kết quả mong muốn là một JSON có `resourceType` bằng `Patient`, có định danh, họ tên, ngày sinh, giới tính và cơ sở quản lý. Đây là bước đầu để chứng minh dữ liệu nội bộ có thể chuyển sang chuẩn liên thông.

## Lấy tài liệu bệnh án của một bệnh nhân

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/documents
```

## Tạo tài liệu bệnh án dạng nháp

```bash
curl -X POST http://localhost:7310/api/v1/patients/patient-demo-001/documents \
  -H "Content-Type: application/json" \
  -d '{
    "encounterId": "encounter-demo-002",
    "type": "referral-letter",
    "title": "Giấy chuyển tuyến điện tử - Hải Phòng",
    "storageUri": "s3://wiiicare-demo/patients/patient-demo-001/referral-letter.pdf",
    "authorPractitionerId": "practitioner-demo-003"
  }'
```

## Ký tài liệu bệnh án

```bash
curl -X POST http://localhost:7310/api/v1/clinical-documents/clinical-document-demo-002/sign
```

## Xuất tài liệu sang FHIR DocumentReference

```bash
curl http://localhost:7310/api/v1/clinical-documents/clinical-document-demo-001/fhir
```

Kết quả mong muốn là JSON có `resourceType` bằng `DocumentReference`, có `subject` trỏ về `Patient`, có `author`, `status`, `docStatus` và `content.attachment.url`. Đây là nền để về sau kết nối HAPI FHIR hoặc luồng chia sẻ tài liệu kiểu IHE MHD.
