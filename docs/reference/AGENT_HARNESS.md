# Agent harness và quy ước làm việc với codebase lớn

Tài liệu này ghi lại cách dự án áp dụng hướng dẫn từ bài viết của Anthropic về Claude Code trong codebase lớn: context file phải gọn và phân lớp; harness, hooks, skills, plugins, MCP/LSP và subagents là các lớp hỗ trợ khác nhau; không nên nhồi toàn bộ tri thức vào một file.

Nguồn tham khảo: [How Claude Code works in large codebases: Best practices and where to start](https://claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start)

## Áp dụng trong repo này

- `AGENTS.md`: ngữ cảnh root cho Codex và các agent.
- `CLAUDE.md`: tương thích Claude Code, trỏ về context root và source of truth.
- `apps/api/AGENTS.md`, `packages/domain/AGENTS.md`, `docs/AGENTS.md`: context cục bộ theo thư mục.
- `.claude/settings.json`: loại trừ generated files và thư mục nhiễu.
- `docs/testing/SMOKE_TEST.md` và `scripts/harness/*`: kiểm chứng deterministic, không dựa vào trí nhớ agent.
- `scripts/harness/compose-api-env.mjs`: kiểm tra compose service `api` thật sự truyền các biến runtime quan trọng như API docs, body limit và record-transfer worker vào container, bảo đảm prod-like compose không publish trực tiếp API port ra host, đồng thời chặn image runtime dạng `latest` hoặc thiếu tag.
- `.github/workflows/ci.yml`: chạy cùng các gate quan trọng trên GitHub.
- `.coderabbit.yaml`: review bằng tiếng Việt, bám kiến trúc và tránh comment cosmetic.

## Nguyên tắc giữ context sạch

- Root context chỉ chứa quy tắc thật sự dùng thường xuyên.
- Kiến thức chuyên sâu nằm trong docs hoặc skill chuyên biệt, không nhồi vào `AGENTS.md`.
- Mỗi thay đổi runtime cần cập nhật command kiểm chứng tương ứng.
- Generated files, `dist`, `node_modules`, coverage và dữ liệu local phải bị loại khỏi context.
