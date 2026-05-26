# Ghi chú quan sát OpenEMR

Ngày quan sát: 2026-05-27

Mục tiêu: chạy một EMR mã nguồn mở đủ trưởng thành để nhìn bằng mắt thường xem một hệ thống bệnh án điện tử thực tế được tổ chức ra sao, từ đó hiệu chỉnh hướng phát triển WiiiCare.

## Kết luận nhanh về WiiiCare hiện tại

Nếu đứng ở vai trò hội đồng kỹ thuật, WiiiCare hiện chấp nhận được như một nguyên mẫu kiến trúc: đã có frontend, backend, cơ sở dữ liệu, tài liệu lâm sàng, ánh xạ FHIR DocumentReference, audit trail và RBAC tối thiểu.

Nếu đứng ở vai trò người dùng bệnh viện, WiiiCare chưa chấp nhận được như sản phẩm sử dụng hằng ngày. Lý do chính là trang hiện tại chưa tạo cảm giác "bàn làm việc y tế"; còn thiếu luồng bệnh nhân, lịch khám, lượt khám, hồ sơ theo vấn đề lâm sàng, tài liệu theo danh mục, bảo hiểm/viện phí, nhắc việc, báo cáo và điều hướng theo vai trò.

## OpenEMR cho thấy EMR thật trông như thế nào

Sau đăng nhập, OpenEMR mở vào một workbench vận hành, không phải landing page. Màn hình đầu có lịch khám, tìm bệnh nhân, message center và menu nghiệp vụ.

Menu nghiệp vụ chính gồm các vùng:

- `Calendar`: lịch làm việc, lịch khám.
- `Finder`: tìm bệnh nhân.
- `Flow`: luồng bệnh nhân trong phòng khám.
- `Recalls`: nhắc tái khám/nhắc việc.
- `Messages`: trao đổi nội bộ.
- `Patient`: tạo/tìm hồ sơ, dashboard, lượt khám, lịch sử, yêu cầu hồ sơ.
- `Fees`: phí, thanh toán, billing manager, EDI.
- `Procedures`: xét nghiệm/thủ thuật, lab report, electronic report, lab documents.
- `Admin`: cấu hình cơ sở, người dùng, phân quyền, danh mục, audit log, API clients.
- `Reports`: báo cáo lâm sàng, báo cáo vận hành, báo cáo tài chính.

Màn hình hồ sơ bệnh nhân (`Medical Record Dashboard`) không chỉ là nơi lưu tệp. Nó là một dashboard theo bệnh nhân, gồm:

- Dị ứng, vấn đề y khoa, thuốc, đơn thuốc.
- Đội chăm sóc.
- Tùy chọn điều trị và trải nghiệm chăm sóc.
- Nhân khẩu học, billing, bảo hiểm.
- Messages, patient reminders, disclosures, amendments.
- Labs, vitals, clinical reminders, recalls, appointments.
- Patient Portal / API Access.

Màn hình tài liệu (`Documents`) dùng cây danh mục thay vì một danh sách tệp phẳng. Các danh mục đáng chú ý:

- Advance Directive.
- CCD, CCDA, CCR.
- FHIR Export Document.
- Lab Report.
- Medical Record.
- Patient Information.
- Patient ID card, Patient Photograph.
- Nhóm Eye Module với nhiều loại ảnh/tài liệu chuyên khoa.

Điều này xác nhận: đề tài "bệnh án điện tử và liên thông" không nên hiểu đơn giản là upload file rồi chuyển file. Trọng tâm đúng hơn là số hóa hồ sơ bệnh nhân thành các tài nguyên có cấu trúc, gắn với định danh bệnh nhân, lượt khám, tài liệu, kết quả cận lâm sàng, quyền truy cập, nhật ký và chuẩn trao đổi như HL7 FHIR.

## Bài học thiết kế cho WiiiCare

Ưu tiên kế tiếp không phải làm giao diện đẹp hơn, mà là làm đúng xương sống nghiệp vụ:

- Tạo `Patient Workspace`: tìm/tạo bệnh nhân, xem hồ sơ, trạng thái hồ sơ, liên kết tài liệu và lịch sử lượt khám.
- Thêm `Patient Chart`: dị ứng, chẩn đoán/vấn đề y khoa, thuốc, sinh hiệu, xét nghiệm, tài liệu, nhắc việc.
- Thêm `Encounter Timeline`: mỗi lần khám là một mốc nghiệp vụ có lý do khám, chẩn đoán, xử trí, tài liệu và người ký.
- Chuẩn hóa `Document Center`: phân loại tài liệu như lab report, medical record, discharge summary, consent, imaging report, FHIR export.
- Giữ `Audit Trail` và `RBAC` là nền bắt buộc, nhưng đưa vào UI theo vai trò thay vì chỉ để demo API.
- Thiết kế màn hình theo công việc hằng ngày của nhân viên y tế: tiếp nhận, khám, nhập tài liệu, xem lịch sử, chuyển tuyến/liên thông, kiểm tra nhật ký.

## Hướng xây tiếp

Thứ tự nên làm để tiến gần product-grade:

1. Xây màn hình danh sách/tìm kiếm bệnh nhân và hồ sơ bệnh nhân mẫu.
2. Tách trang chính thành workbench nghiệp vụ thay vì dashboard tổng quan chung.
3. Bổ sung mô hình encounter trong domain và API.
4. Gắn tài liệu hiện có vào bệnh nhân và encounter.
5. Tạo document taxonomy có trạng thái: nháp, chờ xác thực, đã ký, đã gửi liên thông, lỗi gửi.
6. Bổ sung mock flow "chuyển hồ sơ sang bệnh viện khác" bằng FHIR Bundle/DocumentReference trước khi tích hợp HAPI FHIR thật.
7. Sau khi luồng đúng, mới tinh chỉnh UX/UI theo phong cách riêng của HoLiLiHu / The Wiii Lab.

## Tệp ảnh tham khảo

- `screenshots/openemr-patient-dashboard.png`
- `screenshots/openemr-documents.png`
