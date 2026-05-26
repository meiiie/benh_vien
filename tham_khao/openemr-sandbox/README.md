# OpenEMR Sandbox

Sandbox này dùng để quan sát OpenEMR như một hệ thống EMR mã nguồn mở tham khảo, chỉ phục vụ nghiên cứu và thiết kế WiiiCare. Không đưa dữ liệu bệnh nhân thật vào môi trường này.

## Chạy sandbox

```bash
docker compose -p openemr_sandbox -f tham_khao/openemr-sandbox/docker-compose.yml up -d
```

URL tham khảo:

- HTTP: http://localhost:8088/
- HTTPS: https://localhost:9444/

Lưu ý: HTTPS dùng chứng chỉ tự ký nên trình duyệt có thể cảnh báo. Khi cần xem nhanh trong môi trường local, dùng HTTP.

Tài khoản demo theo compose:

- User: `admin`
- Password: `pass`

## Dữ liệu mẫu

Trong lần quan sát ngày 2026-05-27, sandbox có một bệnh nhân giả:

- PID: `1`
- Mã hồ sơ: `DEMO-0001`
- Tên: `Minh Demo`
- Ngày sinh: `1990-01-02`

Dữ liệu này chỉ để xem màn hình hồ sơ, tài liệu và luồng bệnh án.

## Dừng sandbox

```bash
docker compose -p openemr_sandbox -f tham_khao/openemr-sandbox/docker-compose.yml down
```

## Ảnh tham khảo

- `screenshots/openemr-patient-dashboard.png`: màn hình hồ sơ bệnh nhân.
- `screenshots/openemr-documents.png`: màn hình quản lý tài liệu bệnh nhân.
