# Ví dụ API

API hiện tại là prototype có thể chạy bằng in-memory repository hoặc PostgreSQL tùy `BVS_REPOSITORY`. Lát cắt chính gồm `Patient`, `ProviderDirectory`, `Encounter`, `AllergyIntolerance`, `Condition`, `ServiceRequest`, `Task`, `Procedure`, `Observation`, `DiagnosticReport`, `ImagingStudy`, `MedicationRequest`, `MedicationDispense`, `MedicationAdministration`, `ClinicalDocument`, `Consent`, `RecordTransfer`, `AuditEvent`, phiên đăng nhập demo và FHIR facade.

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

## Lấy Provider Directory và xuất FHIR Endpoint

```bash
curl http://localhost:7310/api/v1/provider-directory \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl http://localhost:7310/api/v1/provider-directory/Endpoint/endpoint-pacs-hai-phong-demo/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

Kết quả mong muốn là danh bạ có `organizations`, `practitioners`, `practitionerRoles`, `endpoints`; endpoint PACS demo xuất sang FHIR `Endpoint` với `connectionType.code = dicom-wado-rs`, `managingOrganization` và `payloadType` mô tả dữ liệu hỗ trợ. Đây là phần giúp Bundle chuyển viện không có các reference treo tới cơ sở y tế, bác sĩ hoặc endpoint ảnh.

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

Kết quả mong muốn là JSON có `resourceType` bằng `Bundle`, `type` bằng `collection`, và `entry` gồm `Patient`, các tài nguyên Provider Directory (`Organization`, `Practitioner`, `PractitionerRole`, `Endpoint`), các `Encounter`, các `AllergyIntolerance`, các `Condition`, các `ServiceRequest`, các `Task`, các `Procedure`, các `Observation`, các `DiagnosticReport`, các `ImagingStudy`, các `MedicationRequest`, các `MedicationDispense`, các `MedicationAdministration` và các `DocumentReference` của bệnh nhân. Endpoint này không chỉ kiểm header: `x-consent-reference` phải trỏ tới một consent đang hiệu lực, đúng bệnh nhân và đúng `x-recipient-organization-id`.

## Xuất gói tài liệu bệnh án sang FHIR document Bundle

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/fhir-document-bundle \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "x-consent-reference: consent-demo-transfer-001" \
  -H "x-recipient-organization-id: hospital-hai-phong-referral"
```

Kết quả mong muốn là JSON có `resourceType` bằng `Bundle`, `type` bằng `document`, và `entry[0].resource.resourceType` bằng `Composition`. Các section của `Composition` tham chiếu tới nhóm cơ sở/nhân sự/endpoint liên thông, lượt khám, dị ứng, chẩn đoán, y lệnh dịch vụ, công việc thực thi y lệnh, thủ thuật/hoạt động đã thực hiện, chỉ số, báo cáo kết quả, nghiên cứu hình ảnh, chỉ định thuốc, cấp phát thuốc, dùng thuốc thực tế và tài liệu lâm sàng trong cùng Bundle.

## Tạo gói chuyển hồ sơ liên viện và xuất FHIR Task

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/record-transfers \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
TRANSFER_ID=$(curl -s -X POST http://localhost:7310/api/v1/patients/patient-demo-001/record-transfers \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "urgent",
    "bundleType": "document",
    "sourceOrganizationId": "hospital-hai-phong-demo",
    "recipientOrganizationId": "hospital-hai-phong-referral",
    "consentReference": "consent-demo-transfer-001",
    "reason": "Chuyển hồ sơ sang bệnh viện tiếp nhận để theo dõi sau cấp cứu.",
    "note": "Dùng FHIR document Bundle có Composition làm mục lục lâm sàng."
  }' | jq -r .id)
```

```bash
curl http://localhost:7310/api/v1/record-transfers/$TRANSFER_ID/fhir-task \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

API sẽ kiểm `consentReference` trước khi tạo `RecordTransfer`. Kết quả FHIR mong muốn là `Task` có `focus` trỏ tới `Bundle/patient-document-patient-demo-001`, `for` trỏ tới `Patient/patient-demo-001`, `requester` là cơ sở gửi và `owner` là cơ sở nhận.

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

## Lấy, tạo và xuất chẩn đoán sang FHIR Condition

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/conditions \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl -X POST http://localhost:7310/api/v1/patients/patient-demo-001/conditions \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{
    "encounterId": "encounter-demo-002",
    "category": "encounter-diagnosis",
    "clinicalStatus": "active",
    "verificationStatus": "confirmed",
    "code": {
      "system": "http://hl7.org/fhir/sid/icd-10",
      "code": "R50.9",
      "display": "Sốt chưa rõ nguyên nhân"
    },
    "severity": "mild",
    "onsetAt": "2026-05-27T00:00:00.000Z",
    "recorderPractitionerId": "practitioner-demo-001",
    "note": "Chẩn đoán làm việc trong quá trình khám."
  }'
```

```bash
curl http://localhost:7310/api/v1/conditions/condition-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

Kết quả mong muốn là JSON có `resourceType` bằng `Condition`, có `subject`, `encounter` nếu được gắn lượt khám, `clinicalStatus`, `verificationStatus`, `category`, `code`, `recordedDate` và `recorder`.

## Lấy, tạo và xuất dị ứng sang FHIR AllergyIntolerance

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/allergy-intolerances \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl -X POST http://localhost:7310/api/v1/patients/patient-demo-001/allergy-intolerances \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{
    "encounterId": "encounter-demo-002",
    "type": "allergy",
    "category": "medication",
    "criticality": "high",
    "code": {
      "system": "http://snomed.info/sct",
      "code": "91936005",
      "display": "Allergy to penicillin"
    },
    "reaction": {
      "manifestation": {
        "system": "http://snomed.info/sct",
        "code": "271807003",
        "display": "Skin rash"
      },
      "severity": "moderate"
    },
    "recorderPractitionerId": "practitioner-demo-001",
    "note": "Cảnh báo dị ứng cần xem trước khi kê thuốc."
  }'
```

```bash
curl http://localhost:7310/api/v1/allergy-intolerances/allergy-intolerance-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

Kết quả mong muốn là JSON có `resourceType` bằng `AllergyIntolerance`, có `patient`, `clinicalStatus`, `verificationStatus`, `type`, `category`, `criticality`, `code`, `reaction`, `recordedDate` và `recorder`.

## Lấy, tạo và xuất chỉ định dịch vụ sang FHIR ServiceRequest

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/service-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl -X POST http://localhost:7310/api/v1/patients/patient-demo-001/service-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{
    "encounterId": "encounter-demo-002",
    "reasonConditionId": "condition-demo-002",
    "category": "laboratory",
    "priority": "urgent",
    "code": {
      "system": "http://loinc.org",
      "code": "58410-2",
      "display": "Complete blood count panel"
    },
    "occurrenceAt": "2026-05-27T04:30:00.000Z",
    "requesterPractitionerId": "practitioner-demo-001",
    "performerOrganizationId": "department-laboratory",
    "patientInstruction": "Lấy mẫu theo hướng dẫn của khoa xét nghiệm."
  }'
```

```bash
curl http://localhost:7310/api/v1/service-requests/service-request-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

Kết quả mong muốn là JSON có `resourceType` bằng `ServiceRequest`, có `status`, `intent`, `category`, `priority`, `code`, `subject`, `encounter`, `requester`, `performer`, `occurrenceDateTime` và `reasonReference` nếu chỉ định dịch vụ được gắn với một chẩn đoán.

## Lấy, tạo và xuất công việc thực thi sang FHIR Task

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/workflow-tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl -X POST http://localhost:7310/api/v1/patients/patient-demo-001/workflow-tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{
    "encounterId": "encounter-demo-001",
    "basedOnServiceRequestId": "service-request-demo-001",
    "status": "completed",
    "priority": "urgent",
    "code": {
      "system": "urn:wiiicare:nexus:task-code",
      "code": "fulfill-laboratory-order",
      "display": "Thực hiện chỉ định xét nghiệm"
    },
    "businessStatus": {
      "code": "result-issued",
      "display": "Kết quả đã phát hành"
    },
    "requesterPractitionerId": "practitioner-demo-002",
    "ownerOrganizationId": "department-laboratory",
    "executionPeriod": {
      "start": "2026-05-26T04:00:00.000Z",
      "end": "2026-05-26T04:45:00.000Z"
    },
    "inputReferences": [
      {
        "resourceType": "ServiceRequest",
        "id": "service-request-demo-001",
        "label": "Chỉ định công thức máu"
      }
    ],
    "outputReferences": [
      {
        "resourceType": "DiagnosticReport",
        "id": "diagnostic-report-demo-001",
        "label": "Báo cáo công thức máu"
      }
    ]
  }'
```

```bash
curl http://localhost:7310/api/v1/workflow-tasks/workflow-task-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

Kết quả mong muốn là JSON có `resourceType` bằng `Task`, có `status`, `businessStatus`, `focus`/`basedOn` trỏ tới `ServiceRequest`, `for` trỏ tới `Patient`, `owner` trỏ tới khoa/phòng hoặc nhân sự phụ trách, `executionPeriod`, `input` và `output`. Đây là lớp theo dõi hàng đợi LIS/PACS/RIS, không phải y lệnh mới.

## Lấy, tạo và xuất thủ thuật/hoạt động sang FHIR Procedure

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/procedures \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl -X POST http://localhost:7310/api/v1/patients/patient-demo-001/procedures \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{
    "encounterId": "encounter-demo-002",
    "basedOnServiceRequestId": "service-request-demo-002",
    "reasonConditionId": "condition-demo-002",
    "status": "completed",
    "category": "diagnostic",
    "code": {
      "system": "http://snomed.info/sct",
      "code": "168537006",
      "display": "Chest X-ray"
    },
    "performedPeriod": {
      "start": "2026-05-27T04:30:00.000Z",
      "end": "2026-05-27T05:00:00.000Z"
    },
    "performers": [
      {
        "actorType": "Practitioner",
        "actorId": "practitioner-demo-001",
        "onBehalfOfOrganizationId": "department-diagnostic-imaging"
      }
    ],
    "reportReferences": [
      {
        "resourceType": "DiagnosticReport",
        "id": "diagnostic-report-demo-002"
      }
    ],
    "note": "Procedure ghi nhận hành động đã thực hiện, không thay thế ServiceRequest hoặc Task."
  }'
```

```bash
curl http://localhost:7310/api/v1/procedures/procedure-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

Kết quả mong muốn là JSON có `resourceType` bằng `Procedure`, có `status`, `category`, `code`, `subject`, `encounter`, `performedPeriod`, `performer`, `basedOn` trỏ tới `ServiceRequest`, `reasonReference` nếu gắn chẩn đoán và `report` trỏ tới báo cáo liên quan.

## Lấy, tạo và xuất chỉ số sang FHIR Observation

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/observations \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl -X POST http://localhost:7310/api/v1/patients/patient-demo-001/observations \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{
    "encounterId": "encounter-demo-002",
    "category": "vital-signs",
    "code": {
      "system": "http://loinc.org",
      "code": "8867-4",
      "display": "Heart rate"
    },
    "effectiveAt": "2026-05-27T04:00:00.000Z",
    "valueQuantity": {
      "value": 78,
      "unit": "/min",
      "system": "http://unitsofmeasure.org",
      "code": "/min"
    },
    "performerPractitionerId": "nurse-demo-001"
  }'
```

```bash
curl http://localhost:7310/api/v1/observations/observation-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

Kết quả mong muốn là JSON có `resourceType` bằng `Observation`, có `subject`, `encounter`, `category`, `code`, `effectiveDateTime` và `valueQuantity`. Ở prototype hiện tại, UI ưu tiên chỉ số định lượng; API vẫn hỗ trợ đúng một trong hai kiểu giá trị: `valueQuantity` hoặc `valueText`.

## Lấy, tạo và xuất báo cáo kết quả sang FHIR DiagnosticReport

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/diagnostic-reports \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl -X POST http://localhost:7310/api/v1/patients/patient-demo-001/diagnostic-reports \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{
    "encounterId": "encounter-demo-001",
    "basedOnServiceRequestId": "service-request-demo-001",
    "category": "laboratory",
    "code": {
      "system": "http://loinc.org",
      "code": "58410-2",
      "display": "Complete blood count panel"
    },
    "effectiveAt": "2026-05-27T06:00:00.000Z",
    "issuedAt": "2026-05-27T06:30:00.000Z",
    "performerOrganizationId": "department-laboratory",
    "resultsInterpreterPractitionerId": "practitioner-demo-002",
    "resultObservationIds": ["observation-demo-001"],
    "conclusion": "Báo cáo xét nghiệm demo."
  }'
```

```bash
curl http://localhost:7310/api/v1/diagnostic-reports/diagnostic-report-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

Kết quả mong muốn là JSON có `resourceType` bằng `DiagnosticReport`, có `basedOn` trỏ tới `ServiceRequest`, `result` trỏ tới `Observation`, `subject`, `encounter`, `category`, `code`, `effectiveDateTime`, `issued` và `conclusion`.

## Lấy, tạo và xuất nghiên cứu hình ảnh sang FHIR ImagingStudy

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/imaging-studies \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl -X POST http://localhost:7310/api/v1/patients/patient-demo-001/imaging-studies \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "content-type: application/json" \
  -d '{
    "encounterId": "encounter-demo-002",
    "basedOnServiceRequestId": "service-request-demo-002",
    "diagnosticReportId": "diagnostic-report-demo-002",
    "studyInstanceUid": "1.2.826.0.1.3680043.10.543.202605270099",
    "accessionNumber": "HP-CXR-20260527-0099",
    "description": "Chest X-ray follow-up study",
    "startedAt": "2026-05-27T07:00:00.000Z",
    "referrerPractitionerId": "practitioner-demo-001",
    "interpreterPractitionerId": "practitioner-demo-001",
    "endpointId": "endpoint-pacs-hai-phong-demo",
    "series": [
      {
        "uid": "1.2.826.0.1.3680043.10.543.202605270099.1",
        "number": 1,
        "modality": {
          "system": "http://dicom.nema.org/resources/ontology/DCM",
          "code": "DX",
          "display": "Digital Radiography"
        },
        "description": "PA and lateral chest radiographs",
        "numberOfInstances": 2,
        "bodySite": {
          "system": "http://snomed.info/sct",
          "code": "51185008",
          "display": "Thoracic structure"
        }
      }
    ]
  }'
```

```bash
curl http://localhost:7310/api/v1/imaging-studies/imaging-study-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

Kết quả mong muốn là JSON có `resourceType` bằng `ImagingStudy`, có `identifier.system = urn:dicom:uid`, `identifier.value` dạng `urn:oid:<StudyInstanceUID>`, `subject`, `encounter`, `basedOn`, `endpoint`, `numberOfSeries`, `numberOfInstances` và `series`. Ảnh thật vẫn thuộc PACS/DICOMweb; API chỉ lưu metadata và liên kết truy xuất.

## Lấy, tạo và xuất chỉ định thuốc sang FHIR MedicationRequest

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/medication-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl -X POST http://localhost:7310/api/v1/patients/patient-demo-001/medication-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{
    "encounterId": "encounter-demo-002",
    "reasonConditionId": "condition-demo-002",
    "category": "outpatient",
    "priority": "routine",
    "medicationCode": {
      "system": "http://www.whocc.no/atc",
      "code": "C08CA01",
      "display": "Amlodipine"
    },
    "dosageInstruction": {
      "text": "Uống 5 mg mỗi ngày vào buổi tối",
      "route": "Đường uống",
      "doseQuantity": {
        "value": 5,
        "unit": "mg",
        "system": "http://unitsofmeasure.org",
        "code": "mg"
      },
      "frequency": 1,
      "period": 1,
      "periodUnit": "d"
    },
    "requesterPractitionerId": "practitioner-demo-001",
    "expectedSupplyDurationDays": 30
  }'
```

```bash
curl http://localhost:7310/api/v1/medication-requests/medication-request-demo-001/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

Kết quả mong muốn là JSON có `resourceType` bằng `MedicationRequest`, có `status`, `intent`, `medicationCodeableConcept`, `subject`, `encounter`, `requester`, `dosageInstruction`, và `reasonReference` nếu chỉ định thuốc được gắn với một chẩn đoán.

## Lấy, tạo và xuất cấp phát thuốc sang FHIR MedicationDispense

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/medication-dispenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl -X POST http://localhost:7310/api/v1/patients/patient-demo-001/medication-dispenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{
    "encounterId": "encounter-demo-002",
    "medicationRequestId": "medication-request-demo-002",
    "status": "completed",
    "category": "outpatient",
    "medicationCode": {
      "system": "http://www.whocc.no/atc",
      "code": "C09AA05",
      "display": "Ramipril"
    },
    "quantity": {
      "value": 30,
      "unit": "viên",
      "system": "http://unitsofmeasure.org",
      "code": "{tablet}"
    },
    "daysSupply": {
      "value": 30,
      "unit": "ngày",
      "system": "http://unitsofmeasure.org",
      "code": "d"
    },
    "whenPrepared": "2026-05-27T05:30:00.000Z",
    "whenHandedOver": "2026-05-27T05:45:00.000Z",
    "dispenserPractitionerId": "nurse-demo-001",
    "receiverPractitionerId": "nurse-demo-001",
    "dosageInstruction": {
      "text": "Uống 5 mg mỗi ngày vào buổi sáng",
      "route": "Đường uống",
      "doseQuantity": {
        "value": 5,
        "unit": "mg",
        "system": "http://unitsofmeasure.org",
        "code": "mg"
      },
      "frequency": 1,
      "period": 1,
      "periodUnit": "d"
    }
  }'
```

```bash
curl http://localhost:7310/api/v1/medication-dispenses/medication-dispense-demo-002/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

Kết quả mong muốn là JSON có `resourceType` bằng `MedicationDispense`, có `status`, `medicationCodeableConcept`, `subject`, `context`, `authorizingPrescription` trỏ tới `MedicationRequest`, `quantity`, `daysSupply`, `whenPrepared`, `whenHandedOver`, `performer`, `receiver` và `dosageInstruction`. Đây là bản ghi “đã cấp phát thuốc”, không thay thế chỉ định thuốc hoặc lần dùng thuốc thực tế.

## Lấy, tạo và xuất lần dùng thuốc sang FHIR MedicationAdministration

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/medication-administrations \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

```bash
curl -X POST http://localhost:7310/api/v1/patients/patient-demo-001/medication-administrations \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT" \
  -H "Content-Type: application/json" \
  -d '{
    "encounterId": "encounter-demo-002",
    "medicationRequestId": "medication-request-demo-002",
    "reasonConditionId": "condition-demo-002",
    "status": "completed",
    "category": "outpatient",
    "medicationCode": {
      "system": "http://www.whocc.no/atc",
      "code": "C09AA05",
      "display": "Ramipril"
    },
    "effectivePeriod": {
      "start": "2026-05-27T06:05:00.000Z"
    },
    "performers": [
      {
        "actorType": "Practitioner",
        "actorId": "nurse-demo-001"
      }
    ],
    "dosage": {
      "text": "Uống 5 mg vào buổi sáng",
      "route": {
        "system": "http://snomed.info/sct",
        "code": "26643006",
        "display": "Oral route"
      },
      "doseQuantity": {
        "value": 5,
        "unit": "mg",
        "system": "http://unitsofmeasure.org",
        "code": "mg"
      }
    }
  }'
```

```bash
curl http://localhost:7310/api/v1/medication-administrations/medication-administration-demo-002/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-purpose-of-use: TREATMENT"
```

Kết quả mong muốn là JSON có `resourceType` bằng `MedicationAdministration`, có `status`, `medicationCodeableConcept`, `subject`, `context`, `effectivePeriod`, `performer`, `request` trỏ tới `MedicationRequest` và `reasonReference` nếu lần dùng thuốc được gắn với một chẩn đoán. Đây là bản ghi “đã dùng thuốc”, không thay thế chỉ định thuốc.

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

Kết quả mong muốn là danh sách sự kiện có `actorId`, `action`, `resourceType`, `resourceId`, `patientId`, `purposeOfUse`, `occurredAt`, `payloadHash` và `integrityHash`.

## Kiểm tra toàn vẹn chuỗi audit

```bash
curl http://localhost:7310/api/v1/patients/patient-demo-001/audit-integrity \
  -H "Authorization: Bearer $AUDIT_TOKEN" \
  -H "x-purpose-of-use: AUDIT"
```

Kết quả mong muốn là JSON có `status = verified`, `verified = true`, số bản ghi đã kiểm và `latestHash`. Nếu có bản ghi cũ chưa được niêm phong hoặc nội dung log bị thay đổi, API trả `status = unsealed` hoặc `status = broken` kèm `brokenAtEventId` và `brokenReason`. Đây là lớp phát hiện sai lệch ở prototype, chưa thay thế ký số, WORM storage hoặc cơ chế audit bất biến ở hạ tầng thật.

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
