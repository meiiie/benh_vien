# API Agent Notes

## Scope

`apps/api` chứa HTTP adapter, route registration, Swagger và orchestration mỏng. Business rule dài hạn phải nằm trong `packages/domain` hoặc application service riêng.

## Local Commands

```bash
pnpm --filter @benh-vien-so/api run check
pnpm --filter @benh-vien-so/api run build
pnpm dev:api
```

## Rules

- API public phải nằm dưới `/api/v1`.
- `/health` giữ không version để kiểm tra process/liveness đơn giản; `/ready` dùng cho readiness vì có kiểm tra repository nền tảng.
- Route handler không trả domain object nếu về sau có dữ liệu nhạy cảm; dùng response DTO rõ ràng.
- Với luồng liên thông hồ sơ, phần lặp “load record transfer + kiểm quyền truy cập bệnh nhân” phải nằm trong `modules/record-transfers/record-transfer-route-access.ts`; route handler chỉ nên giữ orchestration nghiệp vụ, audit và response.
- Route chuyển hồ sơ phải giữ boundary theo module: `record-transfer-routes.ts` chỉ làm composition root; query/read model nằm trong `record-transfer-query-routes.ts`; tạo yêu cầu nằm trong `record-transfer-creation-routes.ts`; `send/receive/fail/retry` nằm trong `record-transfer-command-routes.ts`; callback xác nhận nằm trong `record-transfer-acknowledgement-routes.ts`; FHIR Task export nằm trong `record-transfer-fhir-routes.ts`; helper queue delivery attempt nằm trong `record-transfer-delivery-attempt-route-helpers.ts`. Chạy `pnpm run harness:api-route-composition` khi đổi các file này.
- Route bệnh nhân phải giữ boundary theo module: `patient-routes.ts` chỉ làm composition root; danh sách/tạo hồ sơ nằm trong `patient-registry-routes.ts`; merge/đối soát hồ sơ nằm trong `patient-merge-routes.ts`; đọc hồ sơ nằm trong `patient-query-routes.ts`; `patient-fhir-routes.ts` chỉ nối các route FHIR; xuất FHIR Patient nằm trong `patient-fhir-resource-routes.ts`; xuất Bundle/document Bundle nằm trong `patient-record-bundle-routes.ts`. Chạy `pnpm run harness:api-route-composition` khi đổi các file này.
- Với Patient FHIR Bundle/document Bundle, phần gom collection hồ sơ và metadata audit phải nằm trong `modules/patients/patient-route-helpers.ts` để hai endpoint liên thông không lệch nhau.
- Test helper dùng chung cho auth/RBAC boundary nên nằm trong `server.auth.test-support.ts`; test login/token nằm trong `server.auth.login.test.ts`; test readiness/runtime/security header/error envelope nằm trong `server.runtime.test.ts`; test startup/production config nằm trong `server.startup-config.test.ts`; test đăng ký, chống trùng định danh và merge hồ sơ bệnh nhân nằm trong `server.patient-registry.test.ts`; test ABAC theo phạm vi bệnh nhân nằm trong `server.patient-access.test.ts`; test audit access, AuditEvent FHIR export và integrity report nằm trong `server.audit-boundary.test.ts`; test FHIR Bundle, DocumentReference, Provenance, OperationOutcome và validation biên nằm trong `server.fhir-boundary.test.ts`; test Provider Directory và resource lâm sàng nằm trong `server.clinical-resources.test.ts`; test consent nằm trong `server.consent-boundary.test.ts`; test record-transfer nằm trong `server.record-transfer-boundary.test.ts`. Không tạo lại `server.auth.test.ts`; file này đã được nghỉ hưu để tránh God suite. Chạy `pnpm run harness:api-test-composition` khi đổi các file test auth boundary.
- Lỗi validate trả `400`; lỗi nghiệp vụ trả `422`; không lộ stack trace cho client.
