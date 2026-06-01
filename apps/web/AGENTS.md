# Web Agent Notes

## Scope

`apps/web` là client demo cho WiiiCare Nexus. Web được phép điều phối trải nghiệm người dùng, nhưng không được trở thành nơi quyết định nghiệp vụ lâm sàng, phân quyền, consent, audit hoặc mapping FHIR.

## Architecture Rules

- `src/App.tsx` là composition root mỏng: khởi tạo state cấp ứng dụng, tạo API client, nối các composition function, dựng auth gate và chuyển context cho route renderer.
- `src/application` chứa application composition của frontend: loader wiring, command/handler wiring, runtime effect, derived context, shell state và panel context.
- `src/pages` chỉ chứa route/page renderer và layout hiển thị. Không đặt HTTP route, FHIR mapper, consent/audit orchestration hoặc handler matrix ở đây.
- `src/features` sở hữu UI panel, API adapter, selector, command builder và helper của từng feature.
- Với feature chuyển hồ sơ, `RecordTransferInteropPanel.tsx` chỉ giữ layout chính, metadata và form command; lịch sử delivery attempt nằm trong `RecordTransferDeliveryAttemptList.tsx`; tóm tắt vận hành nằm trong `RecordTransferOperationalSummary.tsx`. Chạy `pnpm run harness:web-app-composition` khi đổi các file này.
- Với tài liệu bệnh án, `ClinicalDocumentPanel.tsx` giữ danh sách, tóm tắt và thao tác ký; form tạo `DocumentReference` nằm trong `ClinicalDocumentForm.tsx` để metadata tệp đính kèm không trộn vào panel hiển thị.
- Với feature hồ sơ lâm sàng, `clinicalRecordPanelRenderers.tsx` chỉ lắp JSX cho các panel; hợp đồng type của collections/forms/handlers/selections nằm trong `clinicalRecordPanelRendererTypes.ts` để không biến renderer thành God module.
- Với AllergyIntolerance, `AllergyIntolerancePanel.tsx` giữ danh sách, tóm tắt cảnh báo an toàn và composition; form ghi nhận dị ứng/không dung nạp nằm trong `AllergyIntoleranceForm.tsx` để dữ liệu safety-critical không trộn vào panel hiển thị.
- Với MedicationDispense, `MedicationDispensePanel.tsx` giữ danh sách, tóm tắt và composition; form cấp phát nhiều trường nằm trong `MedicationDispenseForm.tsx` để không trộn form command vào panel hiển thị.
- Với MedicationAdministration, `MedicationAdministrationPanel.tsx` giữ danh sách, tóm tắt và composition; form dùng thuốc thực tế nằm trong `MedicationAdministrationForm.tsx` để giữ ranh giới kê đơn/cấp phát/dùng thuốc rõ ràng.
- Với MedicationRequest, `MedicationRequestPanel.tsx` giữ danh sách, tóm tắt và composition; form chỉ định/kê đơn nằm trong `MedicationRequestForm.tsx` để medication workflow giữ rõ ba bước kê đơn, cấp phát và dùng thuốc.
- Với ServiceRequest, `ServiceRequestPanel.tsx` giữ danh sách, tóm tắt y lệnh dịch vụ và composition; form chỉ định xét nghiệm/hình ảnh/dịch vụ nằm trong `ServiceRequestForm.tsx` để đường LIS/RIS/PACS bắt đầu từ y lệnh có cấu trúc.
- Với Procedure, `ProcedurePanel.tsx` giữ danh sách, tóm tắt và composition; form ghi nhận thủ thuật/hoạt động y tế nằm trong `ProcedureForm.tsx` để care workflow dễ mở rộng performer, report và body site.
- Với DiagnosticReport, `DiagnosticReportPanel.tsx` giữ danh sách, tóm tắt LIS/RIS và composition; form gom Observation, y lệnh gốc và tệp kết quả nằm trong `DiagnosticReportForm.tsx` để đường xét nghiệm/chẩn đoán hình ảnh không trộn vào panel hiển thị.
- Với ImagingStudy, `ImagingStudyPanel.tsx` giữ danh sách, tóm tắt PACS/DICOM và composition; form DICOM metadata nằm trong `ImagingStudyForm.tsx` để đường tích hợp PACS/DICOMweb không trộn vào panel hiển thị.
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
