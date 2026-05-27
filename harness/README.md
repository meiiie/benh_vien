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
- Smoke test ánh xạ Patient Record sang FHIR `Patient`, `Encounter`, `AllergyIntolerance`, `Condition`, `ServiceRequest`, `Observation`, `DiagnosticReport`, `ImagingStudy`, `MedicationRequest`, `DocumentReference`, `Composition`, `Bundle`, kèm RBAC và audit tối thiểu.
- Kiểm tra Docker Compose dev/prod parse hợp lệ.

## Smoke test FHIR

```bash
pnpm build
pnpm harness:smoke
```

Smoke test này xác nhận các domain lâm sàng nội bộ có thể chuyển thành các resource FHIR cốt lõi, bao gồm cả `ImagingStudy` cho metadata PACS/DICOM và document Bundle có `Composition` ở entry đầu tiên; đây là đường sống của hướng liên thông.

## Nguyên tắc mở rộng harness

- Mỗi luồng nghiệp vụ quan trọng cần có ít nhất một smoke test.
- Không để harness phụ thuộc vào service đang chạy nếu có thể kiểm tra thuần domain.
- Với Docker smoke, chỉ bật khi cần vì stack y tế có nhiều thành phần nặng như FHIR server và PACS.
