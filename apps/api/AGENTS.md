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
- Với Patient FHIR Bundle/document Bundle, phần gom collection hồ sơ và metadata audit phải nằm trong `modules/patients/patient-route-helpers.ts` để hai endpoint liên thông không lệch nhau.
- Test helper dùng chung cho auth/RBAC boundary nên nằm trong `server.auth.test-support.ts`; file `server.auth.test.ts` ưu tiên giữ scenario và assertion.
- Lỗi validate trả `400`; lỗi nghiệp vụ trả `422`; không lộ stack trace cho client.
