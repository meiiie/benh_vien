# CLAUDE.md

Claude Code và các agent khác cần đọc `AGENTS.md` trước. File này giữ vai trò tương thích với quy ước Claude Code trong repo lớn: root context gọn, các quy ước chi tiết nằm trong tài liệu chuyên trách.

## Load Order

1. `AGENTS.md`
2. `docs/ARCHITECTURE.md`
3. `docs/STANDARDS.md`
4. File `AGENTS.md` cục bộ trong thư mục đang sửa, nếu có

## Working Style

- Tìm bằng `rg` trước khi mở nhiều file.
- Ưu tiên thay đổi nhỏ, có kiểm chứng.
- Sau khi sửa code, chạy lệnh hẹp nhất trước; trước khi ship, chạy `pnpm run ci`.
- Với thay đổi Docker/GitHub Actions, luôn chạy `pnpm compose:config` hoặc workflow-equivalent.
- Với nghiệp vụ y tế, không phỏng đoán chuẩn; nếu thiếu căn cứ, kiểm tra nguồn chính thức rồi ghi lại trong docs.

## Harness Notes

Theo best practices cho codebase lớn, harness quan trọng ngang mô hình: context file chỉ mô tả quy tắc, còn kiểm chứng phải nằm ở lệnh deterministic. Repo này dùng `pnpm run ci` làm cổng local chính.
