# Harness kiểm chứng

## PostgreSQL persistence composition

```bash
pnpm run harness:api-postgres-composition
```

Harness này khóa boundary persistence cho luồng chuyển hồ sơ bệnh án, hồ sơ bệnh nhân, WorkflowTask, Procedure, MedicationRequest, MedicationDispense, MedicationAdministration, ServiceRequest, DiagnosticReport, ImagingStudy, AllergyIntolerance và AuditEvent: repository chỉ điều phối truy vấn và transaction, SQL nằm trong module SQL, mapper chỉ chuyển row/tham số, còn command persistence chỉ ghép queryable với SQL/mapper. Với AuditEvent, repository vẫn được giữ vai trò điều phối domain sealing và integrity chain, nhưng không sở hữu SQL dài hoặc JSON mapping. Mục tiêu là giữ lớp hạ tầng có thể mở rộng theo DDD mà không để logic domain, SQL dài và transaction bị trộn lẫn trong một file lớn.

Harness là lớp kiểm chứng quanh mô hình và runtime, không phụ thuộc vào trí nhớ của agent. Mục tiêu là biến các giả định quan trọng thành lệnh có thể chạy lại.

## Lệnh chính

```bash
pnpm run ci
```

Lệnh này chạy:

- TypeScript check cho toàn monorepo.
- Unit test hiện có.
- Build API, web và packages.
- Smoke test ánh xạ Patient Record sang FHIR `CapabilityStatement`, `Patient`, `Organization`, `Practitioner`, `PractitionerRole`, `Endpoint`, `Consent`, `Encounter`, `AllergyIntolerance`, `Condition`, `ServiceRequest`, `Task`, `Procedure`, `Observation`, `DiagnosticReport`, `ImagingStudy`, `MedicationRequest`, `MedicationDispense`, `MedicationAdministration`, `DocumentReference`, `Composition`, `Bundle`, `AuditEvent` và `Task` điều phối chuyển hồ sơ, kèm RBAC, thu hồi consent, audit tối thiểu và kiểm tra toàn vẹn chuỗi audit.
- Kiểm tra biên kiến trúc domain: `RecordTransfer`, `RecordTransferDeliveryAttempt`, `ProviderDirectory`, `AuditEvent`, `AccessControl`, `Patient`, `WorkflowTask`, `Procedure`, `ServiceRequest`, `ImagingStudy`, `ClinicalDocument`, `DiagnosticReport`, `Observation`, `Condition`, `AllergyIntolerance`, `Encounter`, `Consent` và miền thuốc giữ behavior tách khỏi type, snapshot factory, snapshot invariant, command input/code set, provider normalization/primitive/reference/snapshot-clone guard, workflow task code-reference-timeline guard, procedure coding-performer-report-lifecycle guard, imaging DICOM UID-series-count-timeline guard, medication code/dosage/quantity/lifecycle guard, delivery validation/terminal-state guard, class/status/timeline guard, consent period/revocation guard, observation quantity/value guard, service request code-status-timeline guard, condition/allergy code-status-timeline guard, validation/reference/content guard, FHIR date/unsignedInt guard, canonical hashing, snapshot cloning, role-purpose-permission type và role-permission catalog.
- Kiểm tra biên FHIR type: `fhir-types.ts`, `fhir-clinical.types.ts`, `fhir-clinical-core.types.ts`, `fhir-medication.types.ts`, `fhir-careflow.types.ts` và `fhir-diagnostics.types.ts` chỉ là barrel tương thích; các resource type phải nằm trong module `fhir-*.types.ts` theo nhóm để không quay lại God file; mapper FHIR `AuditEvent` phải tách public mapper/bundle orchestration khỏi entity detail, action/outcome/purpose coding và actor/entity reference mapping.
- Kiểm tra biên kiến trúc API: HTTP API composition root, route hệ thống, route ProviderDirectory, route xác thực, route AuditEvent, route Consent, route chuyển hồ sơ, route Encounter, route Observation, route Condition, route AllergyIntolerance, route bệnh nhân, route ClinicalDocument, route MedicationRequest, route MedicationDispense, route MedicationAdministration, route ServiceRequest, route WorkflowTask, route Procedure, route DiagnosticReport và route ImagingStudy không phình lại thành God route; các nhánh system health/readiness/runtime, domain wiring, provider-directory query/FHIR, login/session/audit, audit query/integrity/FHIR, consent query/create/revoke/FHIR, registry/query/command/FHIR resource/FHIR Bundle/callback access-policy/audit/send-receive-failure command phải nằm trong module chuyên biệt, và helper runtime diagnostics/command/audit/reference validation/transfer context/consent guard không được gom ngược vào route chính.
- Kiểm tra biên worker API: worker gửi hồ sơ liên thông và worker retry hồ sơ phải tách public API barrel, contract type, queue/due processor, HTTP FHIR sender khi có, outcome/audit persistence, scheduler interval, defaults/normalization và format lỗi/preview để không quay lại worker God file.
- Kiểm tra biên security API: chữ ký HMAC callback chuyển hồ sơ phải tách public API barrel, constants/types, header normalization, canonical JSON, HMAC builder, secret/key-id lookup, secret JSON validation và verifier policy để không gom env parsing, timestamp, HMAC và compare vào một file; access control phải tách public API barrel, đọc actor từ Bearer token, chuẩn hóa header/media, dựng `ActorContext`, RBAC permission gate, response lỗi quyền, ABAC hồ sơ bệnh nhân và response lỗi hồ sơ bệnh nhân; login rate limiter phải tách public API barrel, type contract, env config, hashed key, memory store, Valkey atomic counter và factory chọn store; denied access audit phải tách điều phối ghi audit, type contract, policy resource/status, audit riêng cho `x-purpose-of-use`, đọc payload response và parser JSON/FHIR `OperationOutcome`.
- Kiểm tra biên test API: test login/token, runtime/readiness/security envelope, startup/production config, patient registry/merge, ABAC theo phạm vi bệnh nhân, audit/AuditEvent, FHIR interoperability, clinical resources, consent và record-transfer nằm trong file riêng, test helper auth dùng chung không phình thành nơi chứa scenario, và suite auth/RBAC cũ `server.auth.test.ts` không được tạo lại.
- Kiểm tra biên kiến trúc frontend: `App.tsx` không phình to, HTTP đi qua API client, cấu hình demo tách theo miền thay vì God defaults file, formatter không bị gom lẫn miền, type lâm sàng phải import từ module nghiệp vụ chuyên biệt thay vì barrel tương thích `types/clinical.ts`, UI chuyển hồ sơ tách list/metadata/actions/form/delivery-attempt/tóm tắt vận hành thay vì gom vào panel chính, renderer hồ sơ lâm sàng tách hợp đồng type khỏi phần lắp JSX, API adapter hồ sơ lâm sàng tách theo encounter/clinical entry/thuốc/care workflow/diagnostics thay vì God module, state hồ sơ lâm sàng tách collection/form/status thay vì God hook, command builder thuốc tách theo kê đơn/cấp phát/dùng thuốc, command builder care workflow/diagnostics tách theo từng resource, form cấp phát thuốc tách context/supply/dosage, form ghi nhận dùng thuốc tách context/performer/dosage, và panel tài liệu bệnh án/dị ứng an toàn/chẩn đoán/chỉ số/y lệnh dịch vụ/thuốc/care workflow/LIS/RIS/PACS không gom form command nhiều trường vào panel hiển thị.
- Kiểm tra Docker Compose dev/prod parse hợp lệ.

## Smoke test FHIR

```bash
pnpm build
pnpm harness:smoke
```

Smoke test này xác nhận các domain lâm sàng nội bộ có thể chuyển thành các resource FHIR cốt lõi, bao gồm `CapabilityStatement` để công bố năng lực facade, Provider Directory để giải nghĩa `Organization`/`Practitioner`/`Endpoint`, FHIR `Consent` để giải nghĩa căn cứ chia sẻ, `Task` để theo dõi thực thi y lệnh, `Procedure` để ghi nhận hành động y tế đã thực hiện, `ImagingStudy` cho metadata PACS/DICOM, document Bundle có `Composition` ở entry đầu tiên, `RecordTransfer` xuất thành FHIR `Task` trỏ tới Bundle chuyển viện, consent bị thu hồi không còn được dùng để chia sẻ hồ sơ, audit trail có hash integrity `verified` và audit có thể xuất thành FHIR `AuditEvent`; đây là đường sống của hướng liên thông.

## Nguyên tắc mở rộng harness

- Mỗi luồng nghiệp vụ quan trọng cần có ít nhất một smoke test.
- Không để harness phụ thuộc vào service đang chạy nếu có thể kiểm tra thuần domain.
- Với Docker smoke, chỉ bật khi cần vì stack y tế có nhiều thành phần nặng như FHIR server và PACS.
