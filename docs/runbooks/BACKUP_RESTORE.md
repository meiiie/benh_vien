# Runbook backup và phục hồi

Tài liệu này định nghĩa quy trình sao lưu/phục hồi tối thiểu cho WiiiCare Nexus trong môi trường Docker Compose. Đây là runbook vận hành cho prototype nghiêm túc, chưa thay thế chính sách sao lưu được phê duyệt cho bệnh viện thật.

## Phạm vi dữ liệu

- PostgreSQL là nguồn dữ liệu nghiệp vụ chính: bệnh nhân, lượt khám, tài liệu lâm sàng, consent, gói chuyển hồ sơ, delivery attempt, Provider Directory, audit trail và bảng `schema_migrations`.
- MinIO/Object Storage là nơi dành cho tệp đính kèm hoặc tài liệu nhị phân khi luồng upload thật được bật.
- Valkey chỉ là kho phụ trợ ngắn hạn cho rate limit/session-like state; không coi là nguồn dữ liệu bệnh án cần phục hồi đầy đủ.
- Orthanc/PACS nằm trong profile thử nghiệm hình ảnh; dữ liệu ảnh y khoa thật phải có chiến lược backup riêng theo PACS/DICOM, không gộp vào dump PostgreSQL.

## Mục tiêu vận hành mẫu

- RPO mẫu cho môi trường demo/product-prototype: mất tối đa 24 giờ dữ liệu nếu sự cố nghiêm trọng xảy ra.
- RTO mẫu cho môi trường demo/product-prototype: khôi phục dịch vụ lõi trong tối đa 4 giờ sau khi có hạ tầng thay thế.
- Lưu giữ (retention) mẫu: daily 14 ngày, weekly 8 tuần, monthly 12 tháng.
- Mọi bản backup chứa dữ liệu bệnh án phải được mã hóa, lưu offsite, giới hạn người truy cập và không đưa vào Git, issue, chat hoặc log công khai.
- Diễn tập phục hồi tối thiểu mỗi quý hoặc trước mỗi mốc release lớn.

Các con số trên là mốc khởi đầu để demo có trách nhiệm. Khi triển khai bệnh viện thật, RPO/RTO và retention phải do đơn vị vận hành, pháp chế, an toàn thông tin và chủ quản dữ liệu phê duyệt.

## Backup PostgreSQL

Tạo thư mục backup trên máy vận hành:

```bash
backup_dir=".backups/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$backup_dir"
```

Dump PostgreSQL bằng định dạng custom để phục hồi linh hoạt bằng `pg_restore`:

```bash
docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres \
  sh -lc 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner --no-acl' \
  > "$backup_dir/postgres.dump"
```

Lưu manifest migration và checksum để đối chiếu sau khi phục hồi:

```bash
docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres \
  sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "select version || '"'"' '"'"' || checksum_sha256 from schema_migrations order by version"' \
  > "$backup_dir/schema_migrations.txt"
```

Tạo checksum cho file backup ở phía máy vận hành:

```bash
sha256sum "$backup_dir/postgres.dump" > "$backup_dir/postgres.dump.sha256"
test -s "$backup_dir/postgres.dump"
```

## Backup object storage

Khi MinIO đã có bucket chứa tài liệu bệnh án, dùng `mc mirror` để sao lưu sang một bucket backup độc lập đã bật mã hóa và versioning:

```bash
mc alias set wiiicare-prod "$OBJECT_STORAGE_ENDPOINT" "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"
mc alias set wiiicare-backup "$BACKUP_OBJECT_STORAGE_ENDPOINT" "$BACKUP_OBJECT_STORAGE_ACCESS_KEY" "$BACKUP_OBJECT_STORAGE_SECRET_KEY"
mc mirror --overwrite --remove wiiicare-prod/wiiicare-documents "wiiicare-backup/wiiicare-documents/$backup_dir"
```

Không mirror object storage về thư mục local không mã hóa nếu dữ liệu chứa thông tin bệnh nhân.

## Phục hồi PostgreSQL vào môi trường sạch

Dừng các service ghi dữ liệu trước khi restore:

```bash
docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml stop api web migrate
```

Khởi động PostgreSQL trên volume sạch hoặc môi trường thay thế, sau đó phục hồi dump:

```bash
sha256sum -c "$backup_dir/postgres.dump.sha256"

cat "$backup_dir/postgres.dump" | docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres \
  sh -lc 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-acl --single-transaction'
```

Đối chiếu migration đã phục hồi:

```bash
docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres \
  sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "select version || '"'"' '"'"' || checksum_sha256 from schema_migrations order by version"' \
  > /tmp/restored_schema_migrations.txt

diff -u "$backup_dir/schema_migrations.txt" /tmp/restored_schema_migrations.txt
```

Chạy lại migration để bảo đảm schema đang ở trạng thái mong muốn, rồi bật API/web:

```bash
docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml up -d --wait migrate api web
curl -fsS http://localhost:8080/health
docker compose --env-file .env.prod.local -f docker-compose.yml -f docker-compose.prod.yml exec -T api wget -qO- http://127.0.0.1:7310/ready > /tmp/wiiicare-restored-ready.json
curl -fsS http://localhost:8080/api/v1/fhir/metadata > /tmp/wiiicare-restored-fhir-metadata.json
```

## Diễn tập phục hồi

Mỗi lần diễn tập phải ghi lại:

- Thời điểm backup, người thực hiện, môi trường nguồn và môi trường phục hồi.
- Checksum của `postgres.dump` và kết quả đối chiếu `schema_migrations`.
- Kết quả `/health`, `/ready`, đăng nhập kiểm soát, truy xuất một hồ sơ bệnh nhân mẫu, xuất FHIR `Bundle` và kiểm tra audit integrity.
- Thời gian phục hồi thực tế để so sánh với RTO.
- Dữ liệu mất tối đa theo thời điểm backup gần nhất để so sánh với RPO.
- Sự cố phát hiện được và hành động khắc phục.

Không đánh dấu một bản backup là “đạt” nếu chưa từng phục hồi thử vào môi trường sạch.

## Các điểm chưa đạt production thật

- Chưa có job tự động hóa backup theo lịch, mã hóa, ký manifest và đẩy offsite.
- Chưa có chính sách WORM/append-only cho audit trail và bản backup.
- Chưa có runbook riêng cho PACS/Orthanc khi lưu ảnh y khoa thật.
- Chưa có quy trình pháp lý cho xóa dữ liệu, lưu giữ bắt buộc và yêu cầu cung cấp bản sao hồ sơ.
