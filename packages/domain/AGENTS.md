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
- Với `WorkflowTask`, aggregate `workflow-task.ts` giữ lifecycle/reference normalization behavior; status, intent, priority, reference, snapshot và input type nằm trong `workflow-task.types.ts`.
- Với `Procedure`, aggregate `procedure.ts` giữ lifecycle/performer/report-reference behavior; status, category, performer, report reference, snapshot và input type nằm trong `procedure.types.ts`.
- Test tối thiểu cho invariant và mapping liên thông.
