# Hướng dẫn đóng góp

## Quy trình nhánh

- `main`: nhánh tích hợp chính.
- `feature/*`: tính năng mới.
- `fix/*`: sửa lỗi.
- `docs/*`: tài liệu.
- `chore/*`: cấu hình, CI, refactor không đổi hành vi.

Không push trực tiếp vào `main` khi branch protection đã bật. Mọi thay đổi nên đi qua Pull Request.

## Kiểm tra tối thiểu

Trước khi mở PR:

```bash
pnpm run ci
```

Nếu thay đổi Docker:

```bash
pnpm compose:config
docker compose --env-file .env.prod.example -f docker-compose.yml -f docker-compose.prod.yml build api web
```

## Quy tắc tài liệu

Cập nhật tài liệu khi thay đổi:

- API route hoặc contract.
- Domain rule.
- Docker/CI/deploy.
- Chuẩn y tế hoặc thuật ngữ.
- Luồng dữ liệu bệnh án, định danh, FHIR, DICOM, audit hoặc phân quyền.

## Bảo mật

Không commit `.env`, secret, dữ liệu bệnh nhân thật, file ảnh y khoa thật hoặc bản dump database chứa dữ liệu nhạy cảm.
