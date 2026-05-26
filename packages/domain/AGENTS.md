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
- Test tối thiểu cho invariant và mapping liên thông.

