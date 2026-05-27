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
- Lỗi validate trả `400`; lỗi nghiệp vụ trả `422`; không lộ stack trace cho client.
