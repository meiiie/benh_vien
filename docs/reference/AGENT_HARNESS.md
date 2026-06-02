# Agent harness và quy ước làm việc với codebase lớn

Tài liệu này ghi lại cách dự án áp dụng hướng dẫn từ bài viết của Anthropic về Claude Code trong codebase lớn: context file phải gọn và phân lớp; harness, hooks, skills, plugins, MCP/LSP và subagents là các lớp hỗ trợ khác nhau; không nên nhồi toàn bộ tri thức vào một file.

Nguồn tham khảo: [How Claude Code works in large codebases: Best practices and where to start](https://claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start)

## Áp dụng trong repo này

- `AGENTS.md`: ngữ cảnh root cho Codex và các agent.
- `CLAUDE.md`: tương thích Claude Code, trỏ về context root và source of truth.
- `apps/api/AGENTS.md`, `packages/domain/AGENTS.md`, `docs/AGENTS.md`: context cục bộ theo thư mục.
- `.claude/settings.json`: loại trừ generated files và thư mục nhiễu.
- `docs/testing/SMOKE_TEST.md` và `scripts/harness/*`: kiểm chứng deterministic, không dựa vào trí nhớ agent.
- `scripts/harness/migration-files.mjs`: kiểm tra migration SQL có tên `NNN_snake_case.sql`, đánh số liên tục từ `001` và không rỗng trước khi chạy các gate nặng hơn.
- `scripts/harness/backup-restore-runbook.mjs`: kiểm tra runbook backup/restore có đủ lệnh `pg_dump`/`pg_restore`, đối chiếu `schema_migrations`, backup object storage, RPO/RTO, retention, mã hóa offsite, restore drill và giới hạn chưa production thật.
- `scripts/harness/secret-hygiene.mjs`: kiểm tra `.gitignore` vẫn chặn file `.env` thật, chỉ cho track env example và quét token/private key phổ biến trong file text tracked.
- `scripts/harness/repo-governance.mjs`: kiểm tra CODEOWNERS bao phủ vùng lâm sàng/vận hành nhạy cảm, PR template vẫn yêu cầu CI/tác động y tế-bảo mật và issue templates nhắc không đưa dữ liệu bệnh nhân thật, secret hoặc dữ liệu chưa ẩn danh lên GitHub.
- `scripts/harness/compose-api-env.mjs`: kiểm tra compose service `api` thật sự truyền các biến runtime quan trọng như API docs, body limit và record-transfer worker vào container, bảo đảm prod-like compose không publish trực tiếp API port ra host, kiểm tra web runtime dùng Nginx unprivileged trên cổng container `8080`, đồng thời chặn compose image runtime dạng `latest`/thiếu tag và Dockerfile base image thiếu digest `sha256`.
- `scripts/harness/release-workflow.mjs`: kiểm tra workflow release chạy full CI gate trước khi đăng nhập GHCR, chỉ publish GHCR image theo semantic version, không publish tag `latest`, giữ quyền workflow tối thiểu, đồng thời bật provenance/SBOM attestation và OCI labels truy vết cho image API và web.
- `scripts/harness/dependabot-config.mjs`: kiểm tra Dependabot vẫn bao phủ npm workspace, GitHub Actions và Dockerfile API/web, đồng thời kiểm tra `security:audit` vẫn nằm trong CI để dependency/base image được cập nhật và kiểm soát có hệ thống.
- `security:audit`: chạy `pnpm audit --audit-level high` để chặn dependency có lỗ hổng đã biết mức cao hoặc nghiêm trọng.
- `.github/workflows/ci.yml`: chạy cùng các gate quan trọng trên GitHub.
- `.coderabbit.yaml`: review bằng tiếng Việt, bám kiến trúc và tránh comment cosmetic.

## Nguyên tắc giữ context sạch

- Root context chỉ chứa quy tắc thật sự dùng thường xuyên.
- Kiến thức chuyên sâu nằm trong docs hoặc skill chuyên biệt, không nhồi vào `AGENTS.md`.
- Mỗi thay đổi runtime cần cập nhật command kiểm chứng tương ứng.
- Generated files, `dist`, `node_modules`, coverage và dữ liệu local phải bị loại khỏi context.
