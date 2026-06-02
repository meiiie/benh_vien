import type { FormEvent } from "react";
import { formatDemoRole } from "../auth/demoLogin.js";
import { Info, PageHeader } from "../components/AppShell.js";
import { formatRecordTransferStatus } from "../features/record-transfers/recordTransferFormatters.js";
import { formatDateTime } from "../lib/clinicalFormatters.js";
import type { AuthSession } from "../types/appRuntime.js";
import type {
  GatewayAcknowledgementForm,
  RecordTransfer
} from "../types/recordTransfers.js";

type GatewayAcknowledgementPageProps = {
  readonly apiBaseUrl: string;
  readonly authSession?: AuthSession;
  readonly form: GatewayAcknowledgementForm;
  readonly isSubmitting: boolean;
  readonly onFormChange: (form: GatewayAcknowledgementForm) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  readonly result?: RecordTransfer;
};

const gatewayBriefItems = [
  {
    label: "Gateway nhận",
    note: "Tài khoản tích hợp chỉ xác nhận biên nhận kỹ thuật; không chỉnh sửa hồ sơ lâm sàng hoặc dữ liệu điều trị."
  },
  {
    label: "HMAC và idempotency",
    note: "Chữ ký HMAC phải tạo ở máy chủ gateway; idempotency key giúp chống ghi nhận trùng callback."
  },
  {
    label: "Audit vận hành",
    note: "Callback hợp lệ ghi nhật ký kiểm toán, lưu mã biên nhận và đóng trạng thái gói chuyển hồ sơ."
  }
] as const;

export function GatewayAcknowledgementPage({
  apiBaseUrl,
  authSession,
  form,
  isSubmitting,
  onFormChange,
  onSubmit,
  result
}: GatewayAcknowledgementPageProps) {
  function updateField<Key extends keyof GatewayAcknowledgementForm>(
    key: Key,
    value: GatewayAcknowledgementForm[Key]
  ) {
    onFormChange({
      ...form,
      [key]: value
    });
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Cổng liên thông"
        title="Xác nhận tiếp nhận hồ sơ liên viện"
        description="Trang này mô phỏng callback tiếp nhận từ gateway của bệnh viện nhận. Trong triển khai thật, chữ ký HMAC phải được tạo ở máy chủ gateway; giao diện này chỉ dùng cho demo vận hành có kiểm soát."
      />

      <section className="gateway-brief" aria-label="Phạm vi vận hành của gateway liên thông">
        {gatewayBriefItems.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <p>{item.note}</p>
          </article>
        ))}
      </section>

      <section className="settings-grid">
        <article className="panel">
          <p className="eyebrow">Ngữ cảnh gateway</p>
          <h2>Phiên xác thực vận hành</h2>
          <div className="detail-grid compact">
            <Info label="Tác nhân (actor)" value={authSession?.actor.actorId ?? "Chưa xác thực"} />
            <Info label="Vai trò" value={formatDemoRole(authSession?.actor.role ?? "integration")} />
            <Info label="Mục đích sử dụng (PurposeOfUse)" value="OPERATIONS" />
            <Info label="API" value={apiBaseUrl} />
          </div>
          <p className="empty-state">
            Luồng demo chuẩn: bác sĩ gửi gói hồ sơ trước, sau đó tài khoản gateway của bệnh viện nhận xác nhận đã tiếp nhận. Callback hợp lệ sẽ ghi audit <code>record-transfer.acknowledgement-callback</code> và chuyển gói sang trạng thái <code>completed</code>.
          </p>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Biên nhận kỹ thuật</p>
              <h2>Gửi callback xác nhận</h2>
            </div>
            <span className="pill cyan">OPERATIONS</span>
          </div>

          <form className="medication-form" onSubmit={onSubmit}>
            <label>
              Mã gói chuyển
              <input
                value={form.recordTransferId}
                onChange={(event) => updateField("recordTransferId", event.target.value)}
              />
            </label>
            <label>
              Cơ sở nhận
              <input
                value={form.recipientOrganizationId}
                onChange={(event) => updateField("recipientOrganizationId", event.target.value)}
              />
            </label>
            <label>
              Mã biên nhận
              <input
                value={form.acknowledgementReference}
                onChange={(event) => updateField("acknowledgementReference", event.target.value)}
              />
            </label>
            <label>
              Thời điểm nhận
              <input
                type="datetime-local"
                value={form.receivedAt}
                onChange={(event) => updateField("receivedAt", event.target.value)}
              />
            </label>
            <label>
              Tác nhân xác nhận (actor)
              <input
                value={form.receivedByActorId}
                onChange={(event) => updateField("receivedByActorId", event.target.value)}
              />
            </label>
            <label>
              Endpoint nhận
              <input
                value={form.targetEndpointId}
                onChange={(event) => updateField("targetEndpointId", event.target.value)}
              />
            </label>
            <label className="wide-field">
              Khóa chống gửi trùng (idempotency key)
              <input
                value={form.deliveryIdempotencyKey}
                onChange={(event) => updateField("deliveryIdempotencyKey", event.target.value)}
              />
            </label>
            <label className="wide-field">
              Ghi chú callback tiếp nhận
              <textarea
                value={form.note}
                onChange={(event) => updateField("note", event.target.value)}
              />
            </label>
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi xác nhận..." : "Gửi callback tiếp nhận"}
            </button>
          </form>
        </article>

        {result ? (
          <article className="panel">
            <p className="eyebrow">Kết quả tiếp nhận</p>
            <h2>Gói đã được xác nhận</h2>
            <div className="detail-grid compact">
              <Info label="Mã gói" value={result.id} />
              <Info label="Trạng thái" value={formatRecordTransferStatus(result.status)} />
              <Info label="Thời điểm nhận" value={result.receivedAt ? formatDateTime(result.receivedAt) : "Chưa có"} />
              <Info label="Người xác nhận" value={result.receivedByActorId ?? "Chưa có"} />
              <Info label="Biên nhận" value={result.acknowledgementReference ?? "Chưa có"} />
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
