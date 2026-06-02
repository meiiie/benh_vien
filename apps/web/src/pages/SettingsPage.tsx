import { formatDemoRole, type LoginForm } from "../auth/demoLogin.js";
import { Info, PageBrief, PageHeader } from "../components/AppShell.js";
import { formatDateTime, formatRuntimeFlag } from "../lib/clinicalFormatters.js";
import type { ApiRuntimeInfo, AuthSession } from "../types/appRuntime.js";

type SettingsPageProps = {
  readonly apiBaseUrl: string;
  readonly apiRuntimeInfo?: ApiRuntimeInfo;
  readonly apiRuntimeWarning?: string;
  readonly authSession?: AuthSession;
  readonly canViewRuntimeInfo: boolean;
  readonly loginForm: LoginForm;
  readonly onReloadRuntimeInfo: () => void;
};

const settingsBriefItems = [
  {
    label: "Phiên demo có kiểm soát",
    note: "Hiển thị actor, vai trò, thời hạn phiên và mục đích sử dụng để tránh nhầm với IAM/SSO thật."
  },
  {
    label: "Backend vận hành",
    note: "Kiểm tra phiên bản API, kho dữ liệu, worker chuyển hồ sơ và trạng thái tài liệu API theo quyền kiểm toán/quản trị."
  },
  {
    label: "Đường nâng cấp production",
    note: "Ghi rõ các hạng mục cần có trước triển khai thật: SSO/MFA, role matrix, mTLS/JWS, retention và cấu hình cơ sở y tế."
  }
] as const;

const productionReadinessMilestones = [
  "Thêm IAM/SSO thật thay cho đăng nhập demo.",
  "Bổ sung role matrix chi tiết theo bác sĩ, điều dưỡng, văn thư, kiểm toán, quản trị và gateway liên thông.",
  "Nâng biên nhận kỹ thuật thành chữ ký số/mTLS/JWS gateway theo yêu cầu triển khai thật.",
  "Tách cấu hình cơ sở y tế, khoa/phòng, mã định danh, danh mục tài liệu và chính sách retention."
] as const;

export function SettingsPage({
  apiBaseUrl,
  apiRuntimeInfo,
  apiRuntimeWarning,
  authSession,
  canViewRuntimeInfo,
  loginForm,
  onReloadRuntimeInfo
}: SettingsPageProps) {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Cấu hình vận hành"
        title="Cấu hình demo và đường nâng cấp"
        description="Trang này cố ý ghi rõ phần nào là demo, phần nào cần triển khai thật để tránh nhầm với hệ thống bệnh viện hoàn chỉnh."
      />

      <PageBrief
        ariaLabel="Phạm vi cấu hình và đường nâng cấp sản phẩm"
        className="settings-brief"
        items={settingsBriefItems}
      />

      <section className="settings-grid">
        <article className="panel">
          <p className="eyebrow">Phiên truy cập</p>
          <h2>Phiên hiện tại</h2>
          <div className="detail-grid compact">
            <Info label="Người dùng" value={authSession?.actor.displayName ?? loginForm.username} />
            <Info label="Mã actor" value={authSession?.actor.actorId ?? "Chưa xác thực"} />
            <Info label="Vai trò demo" value={formatDemoRole(authSession?.actor.role ?? loginForm.role)} />
            <Info label="API" value={apiBaseUrl} />
            <Info label="Phiên hết hạn" value={authSession ? formatDateTime(authSession.expiresAt) : "Chưa có"} />
            <Info label="Mục đích" value="Bearer token + mục đích sử dụng (PurposeOfUse)" />
          </div>
        </article>

        {canViewRuntimeInfo ? (
          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Môi trường backend</p>
                <h2>Backend đang kết nối</h2>
              </div>
              <button
                className="ghost-button compact-button"
                type="button"
                onClick={onReloadRuntimeInfo}
              >
                Kiểm tra lại
              </button>
            </div>
            {apiRuntimeWarning ? (
              <p className="transfer-alert">{apiRuntimeWarning}</p>
            ) : null}
            <div className="detail-grid compact">
              <Info label="Sản phẩm" value={apiRuntimeInfo?.product ?? "Chưa xác định"} />
              <Info label="Dịch vụ" value={apiRuntimeInfo?.service ?? "Chưa xác định"} />
              <Info label="Phiên bản API" value={apiRuntimeInfo?.version ?? "Chưa xác định"} />
              <Info
                label="Chẩn đoán vận hành"
                value={
                  apiRuntimeInfo?.operationalDiagnostics.available
                    ? "Đã xác thực vận hành"
                    : apiRuntimeInfo?.operationalDiagnostics.reason ?? "Chưa xác định"
                }
              />
              <Info
                label="Kho dữ liệu"
                value={
                  apiRuntimeInfo
                    ? apiRuntimeInfo.repository ?? "Chỉ dành cho vận hành"
                    : "Chưa xác định"
                }
              />
              <Info
                label="Môi trường"
                value={
                  apiRuntimeInfo
                    ? apiRuntimeInfo.nodeEnv ?? "Chỉ dành cho vận hành"
                    : "Chưa xác định"
                }
              />
              <Info label="API công khai" value={apiRuntimeInfo?.publicApiBaseUrl ?? apiBaseUrl} />
              <Info
                label="Giới hạn body"
                value={
                  apiRuntimeInfo?.httpBodyLimitBytes
                    ? `${apiRuntimeInfo.httpBodyLimitBytes.toLocaleString("vi-VN")} byte`
                    : apiRuntimeInfo
                      ? "Chỉ dành cho vận hành"
                      : "Chưa xác định"
                }
              />
              <Info
                label="Tài liệu API"
                value={formatRuntimeFlag(
                  apiRuntimeInfo?.features.apiDocsEnabled,
                  "Đang bật",
                  "Đang tắt"
                )}
              />
              <Info
                label="Lịch sử gửi gói"
                value={
                  apiRuntimeInfo?.features.recordTransferDeliveryAttempts
                    ? "Có route outbox"
                    : "Chưa xác định"
                }
              />
              <Info
                label="Worker gửi gói"
                value={formatRuntimeFlag(
                  apiRuntimeInfo?.features.recordTransferDeliveryWorkerEnabled,
                  "Đang bật",
                  "Đang tắt"
                )}
              />
              <Info
                label="Worker thử lại"
                value={formatRuntimeFlag(
                  apiRuntimeInfo?.features.recordTransferRetryWorkerEnabled,
                  "Đang bật",
                  "Đang tắt"
                )}
              />
              <Info
                label="Kiểm tra lúc"
                value={
                  apiRuntimeInfo?.checkedAt
                    ? formatDateTime(apiRuntimeInfo.checkedAt)
                    : "Chưa có"
                }
              />
            </div>
          </article>
        ) : null}

        <article className="panel">
          <p className="eyebrow">Đường nâng cấp</p>
          <h2>Cần nâng cấp trước sản xuất</h2>
          <ul className="milestone-list">
            {productionReadinessMilestones.map((milestone) => (
              <li key={milestone}>{milestone}</li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
