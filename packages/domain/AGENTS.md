# Domain Agent Notes

## Scope

`packages/domain` là lõi nghiệp vụ. Không import Fastify, React, database client, Docker SDK hoặc framework hạ tầng.

## Local Commands

```bash
pnpm --filter @benh-vien-so/domain run check
pnpm --filter @benh-vien-so/domain run test
pnpm --filter @benh-vien-so/domain run build
```

## Rules

- Domain model phải bảo vệ invariant bằng method hoặc factory.
- Value object/aggregate dùng thông báo lỗi tiếng Việt có dấu khi lỗi có thể hiển thị cho người dùng.
- Mapping FHIR đặt trong namespace `fhir`, không trộn vào aggregate.
- Với `RecordTransfer`, aggregate `record-transfer.ts` giữ hành vi vòng đời; type, snapshot, command input và status set nằm trong `record-transfer.types.ts`. Chạy `pnpm run harness:domain-composition` khi đổi boundary domain này.
- Với `ProviderDirectory`, aggregate `provider-directory.ts` giữ assemble/rehydrate/validation; type, snapshot, coding, telecom và endpoint code set nằm trong `provider-directory.types.ts`.
- Với `AuditEvent`, aggregate `audit-event.ts` giữ record/rehydrate/seal/integrity behavior; action, resource, snapshot và integrity report type nằm trong `audit-event.types.ts`.
- Với `AccessControl`, file `access-control.ts` giữ logic quyết định quyền và phạm vi bệnh nhân; role, purpose, permission và role-permission catalog nằm trong `access-control.policy.ts`.
- Với `Patient`, aggregate `patient.ts` giữ register/update/merge behavior; gender, identifier, snapshot, registration input và code set nằm trong `patient.types.ts`.
- Với `WorkflowTask`, aggregate `workflow-task.ts` giữ lifecycle behavior; code/reference/status/timeline guard nằm trong `workflow-task.validation.ts`; status, intent, priority, reference, snapshot và input type nằm trong `workflow-task.types.ts`.
- Với `Procedure`, aggregate `procedure.ts` giữ lifecycle/performer/report-reference behavior; status, category, performer, report reference, snapshot và input type nằm trong `procedure.types.ts`.
- Với `RecordTransferDeliveryAttempt`, aggregate `record-transfer-delivery-attempt.ts` giữ queue/terminal update behavior; delivery normalization và terminal-state guard nằm trong `record-transfer-delivery-attempt.validation.ts`; status, bundle, snapshot và command input type nằm trong `record-transfer-delivery-attempt.types.ts`.
- Với miền thuốc, `medication-request.ts`, `medication-dispense.ts` và `medication-administration.ts` giữ prescribe/record/rehydrate behavior; medication code, dosage/quantity, handover/effective-period, performer, status và timeline guard nằm trong các file `*.validation.ts`; status, category/intent/priority, dosage, performer, snapshot và command input type nằm trong các file `*.types.ts` tương ứng.
- Với `ServiceRequest`, aggregate `service-request.ts` giữ ordering/scheduling behavior; code/status/priority/timeline guard nằm trong `service-request.validation.ts`; status, intent, category, priority, snapshot và command input type nằm trong `service-request.types.ts`.
- Với `ImagingStudy`, aggregate `imaging-study.ts` giữ DICOM UID, series count và timeline validation behavior; status, coding, series, snapshot và command input type nằm trong `imaging-study.types.ts`.
- Với `ClinicalDocument`, aggregate `clinical-document.ts` giữ create/sign behavior; attachment, status và timeline guard nằm trong `clinical-document.validation.ts`; document type, status, snapshot và command input type nằm trong `clinical-document.types.ts`.
- Với `DiagnosticReport`, aggregate `diagnostic-report.ts` giữ issue/rehydrate behavior; code, content, status/category và timeline guard nằm trong `diagnostic-report.validation.ts`; status, category, code, snapshot và command input type nằm trong `diagnostic-report.types.ts`.
- Với `Observation`, aggregate `observation.ts` giữ recording behavior; quantity/value/status/timeline guard nằm trong `observation.validation.ts`; status, category, coding, quantity, snapshot và command input type nằm trong `observation.types.ts`.
- Với `Condition`, aggregate `condition.ts` giữ recording và clinical status behavior; code/status/severity/timeline guard nằm trong `condition.validation.ts`; status, category, severity, code, snapshot và command input type nằm trong `condition.types.ts`.
- Với `AllergyIntolerance`, aggregate `allergy-intolerance.ts` giữ recording và reaction behavior; code/reaction/status/timeline guard nằm trong `allergy-intolerance.validation.ts`; status, category, reaction, snapshot và command input type nằm trong `allergy-intolerance.types.ts`.
- Với `Encounter`, aggregate `encounter.ts` giữ creation, lifecycle và finish behavior; class/status/timeline guard nằm trong `encounter.validation.ts`; class, status, snapshot và command input type nằm trong `encounter.types.ts`.
- Với `Consent`, aggregate `consent.ts` giữ grant/revoke và authorization behavior; period/revocation/status/category guard nằm trong `consent.validation.ts`; status, category, snapshot và command input type nằm trong `consent.types.ts`.
- Với `Patient`, aggregate `patient.ts` giữ registration, demographic update và merge behavior; identifier, FHIR birth date, merge state và timeline guard nằm trong `patient.validation.ts`; gender/identifier/status/snapshot/input type nằm trong `patient.types.ts`.
- Với `RecordTransfer`, aggregate `record-transfer.ts` giữ lifecycle behavior; normalization và snapshot invariant guard nằm trong `record-transfer.validation.ts`; status, snapshot và command input type nằm trong `record-transfer.types.ts`.
- Với `ProviderDirectory`, aggregate `provider-directory.ts` giữ assembly behavior; normalization, reference guard và snapshot cloning nằm trong `provider-directory.validation.ts`; snapshot/code set/input type nằm trong `provider-directory.types.ts`.
- Với `AuditEvent`, aggregate `audit-event.ts` giữ record/seal/report behavior; canonical hashing, normalization và seal metadata guard nằm trong `audit-event.validation.ts`; action/resource/snapshot/integrity report type nằm trong `audit-event.types.ts`.
- Với FHIR type, `fhir-types.ts` và `fhir-clinical.types.ts` chỉ là barrel tương thích; resource declaration nằm trong các module `fhir-*.types.ts` theo nhóm shared/provider/document/privacy/audit/clinical/medication/careflow/diagnostics/patient/operation/capability/bundle.
- Test tối thiểu cho invariant và mapping liên thông.
