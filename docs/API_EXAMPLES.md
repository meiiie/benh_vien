# Ví dụ API

API hiện tại là prototype có thể chạy bằng in-memory repository hoặc PostgreSQL tùy `BVS_REPOSITORY`. Lát cắt chính gồm `Patient`, `Encounter`, `ClinicalDocument`, `Consent`, `AuditEvent`, phiên đăng nhập demo và FHIR facade.

## Kiểm tra sức khỏe API

```bash
curl http://localhost:7310/health
```

## Đăng nhập và lấy token

Các API nghiệp vụ yêu cầu `Authorization: Bearer <token>`. Header `x-purpose-of-use` vẫn được giữ để khai báo mục đích truy cập dữ liệu y tế.

```bash
TOKEN=$(curl -s -X POST http://localhost:7310/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "practitioner-demo-001",
    "password": "demo",
    "role": "clinician"
  }' | jq -r .accessToken)
```

Tài khoản demo:

- `practitioner-demo-001` / `demo`: vai trò `clinician`, dùng cho luồng điều trị.
- `nurse-demo-001` / `demo`: vai trò `nurse`, dùng cho tiếp nhận/đọc hồ sơ.
- `security-officer-demo` / `demo`: vai trò `auditor`, dùng cho nhật ký kiểm toán.
- `admin-demo` / `demo`: vai trò `admin`, dùng cho kiểm tra toàn quyền trong prototype.

## Header dùng chung

Luồng điều trị:

```bash
-H "Authorization: Bearer $TOKEN" \
-H "x-purpose-of-use: TREATMENT"
```

Luồng kiểm toán cần đăng nhập bằng `security-officer-demo` hoặc `admin-demo`:

```bash
-H "Authorization: Bearer $AUDIT_TOKEN" \
-H "x-purpose-of-use: AUDIT"
```

## Lấy danh sách bệnh nhân

```bash
curl http://localhost:7310/api/v1/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

## Tạo bệnh nhân mới

```bash
curl -X POST http://localhost:7310/api/v1/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
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
curl http://localhost:7310/api/v1/patients/patient-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

Kết quả mong muốn là JSON có `resourceType` bằng `Patient`, có định danh, họ tên, ngày sinh, giới tính và cơ sở quản lý.

## Lấy consent chia sẻ hồ sơ của bệnh nhân

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/consents \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

Kết quả mong muốn là danh sách consent theo bệnh nhân, gồm trạng thái, loại consent, đơn vị nhận, thời hạn hiệu lực và tài liệu căn cứ nếu có.

## Tạo consent chia sẻ hồ sơ

```bash
curl -X POST http://localhost:7310/api/v1/patients/patient-demo-001/consents \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "record-sharing",
    "granteeOrganizationId": "hospital-hai-phong-referral",
    "evidenceDocumentId": "clinical-document-demo-003",
    "validFrom": "2026-05-27T00:00:00.000Z",
    "validUntil": "2026-12-31T23:59:59.000Z"
  }'
```

API sẽ ghi audit action `consent.create`. Ở prototype, `grantorActorId` lấy từ Bearer token hiện tại; khi lên thật cần thay bằng workflow ký/xác nhận consent.

## Xuất gói hồ sơ bệnh nhân sang FHIR Bundle

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/fhir-bundle \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "x-consent-reference: consent-demo-transfer-001" \
  -H "x-recipient-organization-id: hospital-hai-phong-referral"
```

Kết quả mong muốn là JSON có `resourceType` bằng `Bundle`, `type` bằng `collection`, và `entry` gồm `Patient`, các `Encounter` và các `DocumentReference` của bệnh nhân. Endpoint này không chỉ kiểm header: `x-consent-reference` phải trỏ tới một consent đang hiệu lực, đúng bệnh nhân và đúng `x-recipient-organization-id`.

## Lấy và mở lượt khám

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/encounters \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl -X POST http://localhost:7310/api/v1/patients/patient-demo-001/encounters \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{
    "class": "ambulatory",
    "serviceType": "Khám ngoại trú",
    "reasonText": "Tiếp nhận hồ sơ và đánh giá ban đầu",
    "departmentId": "department-outpatient",
    "attendingPractitionerId": "practitioner-demo-002",
    "startedAt": "2026-05-27T03:00:00.000Z"
  }'
```

## Kết thúc và xuất lượt khám sang FHIR Encounter

```bash
curl -X POST http://localhost:7310/api/v1/encounters/encounter-demo-002/finish \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl http://localhost:7310/api/v1/encounters/encounter-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

## Lấy, tạo, ký và xuất tài liệu bệnh án

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/documents \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl -X POST http://localhost:7310/api/v1/patients/patient-demo-001/documents \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{
    "encounterId": "encounter-demo-002",
    "type": "referral-letter",
    "title": "Giấy chuyển tuyến điện tử - Hải Phòng",
    "storageUri": "s3://wiiicare-demo/patients/patient-demo-001/referral-letter.pdf",
    "authorPractitionerId": "practitioner-demo-003"
  }'
```

```bash
curl -X POST http://localhost:7310/api/v1/clinical-documents/clinical-document-demo-002/sign \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl http://localhost:7310/api/v1/clinical-documents/clinical-document-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

Kết quả mong muốn là JSON có `resourceType` bằng `DocumentReference`, có `subject`, `author`, `status`, `docStatus` và `content.attachment.url`.

## Xem nhật ký kiểm toán của bệnh nhân

```bash
AUDIT_TOKEN=$(curl -s -X POST http://localhost:7310/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "security-officer-demo",
    "password": "demo",
    "role": "auditor"
  }' | jq -r .accessToken)

curl http://localhost:7310/api/v1/patients/patient-demo-001/audit-events \
  -H "Authorization: Bearer $AUDIT_TOKEN" \
  -H "x-purpose-of-use: AUDIT"
```

Kết quả mong muốn là danh sách sự kiện có `actorId`, `action`, `resourceType`, `resourceId`, `patientId`, `purposeOfUse` và `occurredAt`.

## Kiểm tra chặn quyền RBAC

Ví dụ dưới đây cố tình dùng vai trò `auditor` để tạo bệnh nhân. API phải trả `403 FORBIDDEN`:

```bash
curl -i -X POST http://localhost:7310/api/v1/patients \
  -H "Authorization: Bearer $AUDIT_TOKEN" \
  -H "x-purpose-of-use: AUDIT" \
  -H "Content-Type: application/json" \
  -d '{
    "identifiers": [
      {
        "system": "urn:benh-vien-so:mrn",
        "value": "MRN-DENIED-001",
        "type": "hospital-mrn"
      }
    ],
    "fullName": "RBAC Denied",
    "managingOrganizationId": "hospital-hai-phong-demo"
  }'
```
