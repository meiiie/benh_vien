# Harness kiểm chứng

Harness là lớp kiểm chứng quanh mô hình và runtime, không phụ thuộc vào trí nhớ của agent. Mục tiêu là biến các giả định quan trọng thành lệnh có thể chạy lại.

## Lệnh chính

```bash
pnpm run ci
```

Lệnh này chạy:

- TypeScript check cho toàn monorepo.
- Unit test hiện có.
- Build API, web và packages.
- Smoke test ánh xạ Patient Record sang FHIR `Patient`, `Organization`, `Practitioner`, `PractitionerRole`, `Endpoint`, `Consent`, `Encounter`, `AllergyIntolerance`, `Condition`, `ServiceRequest`, `Task`, `Procedure`, `Observation`, `DiagnosticReport`, `ImagingStudy`, `MedicationRequest`, `MedicationDispense`, `MedicationAdministration`, `DocumentReference`, `Composition`, `Bundle`, `AuditEvent` và `Task` điều phối chuyển hồ sơ, kèm RBAC, thu hồi consent, audit tối thiểu và kiểm tra toàn vẹn chuỗi audit.
- Kiểm tra Docker Compose dev/prod parse hợp lệ.

## Smoke test FHIR

```bash
pnpm build
pnpm harness:smoke
```

Smoke test này xác nhận các domain lâm sàng nội bộ có thể chuyển thành các resource FHIR cốt lõi, bao gồm Provider Directory để giải nghĩa `Organization`/`Practitioner`/`Endpoint`, FHIR `Consent` để giải nghĩa căn cứ chia sẻ, `Task` để theo dõi thực thi y lệnh, `Procedure` để ghi nhận hành động y tế đã thực hiện, `ImagingStudy` cho metadata PACS/DICOM, document Bundle có `Composition` ở entry đầu tiên, `RecordTransfer` xuất thành FHIR `Task` trỏ tới Bundle chuyển viện, consent bị thu hồi không còn được dùng để chia sẻ hồ sơ, audit trail có hash integrity `verified` và audit có thể xuất thành FHIR `AuditEvent`; đây là đường sống của hướng liên thông.

## Nguyên tắc mở rộng harness

- Mỗi luồng nghiệp vụ quan trọng cần có ít nhất một smoke test.
- Không để harness phụ thuộc vào service đang chạy nếu có thể kiểm tra thuần domain.
- Với Docker smoke, chỉ bật khi cần vì stack y tế có nhiều thành phần nặng như FHIR server và PACS.
