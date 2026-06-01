# Web Agent Notes

## Scope

`apps/web` là client demo cho WiiiCare Nexus. Web được phép điều phối trải nghiệm người dùng, nhưng không được trở thành nơi quyết định nghiệp vụ lâm sàng, phân quyền, consent, audit hoặc mapping FHIR.

## Architecture Rules

- `src/App.tsx` là composition root mỏng: khởi tạo state cấp ứng dụng, tạo API client, nối các composition function, dựng auth gate và chuyển context cho route renderer.
- `src/application` chứa application composition của frontend: loader wiring, command/handler wiring, runtime effect, derived context, shell state và panel context.
- `src/pages` chỉ chứa route/page renderer và layout hiển thị. Không đặt HTTP route, FHIR mapper, consent/audit orchestration hoặc handler matrix ở đây.
- `src/features` sở hữu UI panel, API adapter, selector, command builder và helper của từng feature.
- Formatter, selector hoặc helper chỉ phục vụ một feature phải nằm trong feature đó; không đưa ngược vào `src/lib/clinicalFormatters.ts` chỉ vì tiện import.
- Các formatter của hồ sơ lâm sàng thuộc `src/features/clinical-records`: lượt khám nằm trong `encounterFormatters.ts`; dị ứng nằm trong `allergyFormatters.ts`; chẩn đoán/vấn đề sức khỏe nằm trong `conditionFormatters.ts`; y lệnh/tác vụ/thủ thuật nằm trong `careWorkflowFormatters.ts`; xét nghiệm/chẩn đoán hình ảnh nằm trong `diagnosticResultFormatters.ts`; thuốc nằm trong `medicationFormatters.ts`.
- Formatter của bệnh nhân, tài liệu lâm sàng, đồng ý chia sẻ và danh bạ nhà cung cấp phải nằm trong feature tương ứng; `src/lib/clinicalFormatters.ts` chỉ giữ helper dùng chung thật sự như thời gian và runtime display.
- Type runtime/auth/app shell nằm trong `src/types/appRuntime.ts`. Type của bệnh nhân, lượt khám, dị ứng, chẩn đoán/vấn đề sức khỏe, quan sát/kết quả đo, thuốc, y lệnh/tác vụ/thủ thuật, xét nghiệm/chẩn đoán hình ảnh, tài liệu lâm sàng, danh bạ nhà cung cấp, chuyển hồ sơ, đồng ý chia sẻ và audit nằm trong module type tương ứng dưới `src/types`; code mới không import từ `src/types/clinical.ts`, file này chỉ là compatibility barrel để giữ tương thích ngoài boundary cũ.
- Mọi HTTP request phải đi qua `src/api/clinicalApi.ts` rồi qua feature/platform/auth API module phù hợp; không gọi `fetch` trực tiếp trong component hoặc application module.
- CSS nền tảng như token, reset, typography, shared panel/button primitives nằm trong `src/styles/base.css`; `src/styles.css` chỉ nên compose các layer còn lại và dần tách theo shell/feature khi đủ rõ boundary.

## Verification

```bash
pnpm --filter @benh-vien-so/web check
node scripts/harness/web-app-composition.mjs
```

Khi thay đổi boundary lớn, chạy `pnpm run ci` ở root trước khi push.
