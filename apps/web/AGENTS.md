# Web Agent Notes

## Scope

`apps/web` là client demo cho WiiiCare Nexus. Web được phép điều phối trải nghiệm người dùng, nhưng không được trở thành nơi quyết định nghiệp vụ lâm sàng, phân quyền, consent, audit hoặc mapping FHIR.

## Architecture Rules

- `src/App.tsx` là composition root mỏng: khởi tạo state cấp ứng dụng, tạo API client, nối các composition function, dựng auth gate và chuyển context cho route renderer.
- `src/application` chứa application composition của frontend: loader wiring, command/handler wiring, runtime effect, derived context, shell state và panel context.
- `src/pages` chỉ chứa route/page renderer và layout hiển thị. Không đặt HTTP route, FHIR mapper, consent/audit orchestration hoặc handler matrix ở đây.
- `src/features` sở hữu UI panel, API adapter, selector, command builder và helper của từng feature.
- Formatter, selector hoặc helper chỉ phục vụ một feature phải nằm trong feature đó; không đưa ngược vào `src/lib/clinicalFormatters.ts` chỉ vì tiện import.
- Các formatter của hồ sơ lâm sàng thuộc `src/features/clinical-records`: y lệnh/tác vụ/thủ thuật nằm trong `careWorkflowFormatters.ts`; xét nghiệm/chẩn đoán hình ảnh nằm trong `diagnosticResultFormatters.ts`; thuốc nằm trong `medicationFormatters.ts`.
- Mọi HTTP request phải đi qua `src/api/clinicalApi.ts` rồi qua feature/platform/auth API module phù hợp; không gọi `fetch` trực tiếp trong component hoặc application module.

## Verification

```bash
pnpm --filter @benh-vien-so/web check
node scripts/harness/web-app-composition.mjs
```

Khi thay đổi boundary lớn, chạy `pnpm run ci` ở root trước khi push.
