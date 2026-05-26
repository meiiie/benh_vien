# Versioning và release

Dự án dùng **Semantic Versioning**: `MAJOR.MINOR.PATCH`.

- `MAJOR`: thay đổi phá vỡ API, dữ liệu hoặc quy trình vận hành.
- `MINOR`: thêm năng lực mới tương thích ngược.
- `PATCH`: sửa lỗi, tài liệu, hardening hoặc cải thiện nhỏ tương thích ngược.

## Commit

Theo Conventional Commits:

```text
feat(api): add patient registry endpoint
fix(domain): reject empty patient identifier
docs(standards): add IHE MHD reference
ci(github): add docker smoke job
```

## Changesets

Khi thay đổi có ảnh hưởng release:

```bash
pnpm changeset
pnpm version:bump
```

Repo hiện chưa publish package npm công khai. Changesets được dùng để quản lý changelog và version nội bộ.

## Tag release

Khi đã sẵn sàng phát hành image:

```bash
git tag v0.2.0
git push origin v0.2.0
```

Workflow `Release Images` sẽ build và push:

- `ghcr.io/meiiie/benh_vien/api:<version>`
- `ghcr.io/meiiie/benh_vien/web:<version>`

