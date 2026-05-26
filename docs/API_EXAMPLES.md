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
