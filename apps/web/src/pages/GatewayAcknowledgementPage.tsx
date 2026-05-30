import type { FormEvent } from "react";
import { formatDemoRole } from "../auth/demoLogin.js";
import { Info, PageHeader } from "../components/AppShell.js";
import { formatDateTime, formatRecordTransferStatus } from "../lib/clinicalFormatters.js";
import type {
  AuthSession,
  GatewayAcknowledgementForm,
  RecordTransfer
} from "../types/clinical.js";

type GatewayAcknowledgementPageProps = {
  readonly apiBaseUrl: string;
  readonly authSession?: AuthSession;
  readonly form: GatewayAcknowledgementForm;
  readonly isSubmitting: boolean;
  readonly onFormChange: (form: GatewayAcknowledgementForm) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  readonly result?: RecordTransfer;
};

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
        eyebrow="Integration Gateway"
        title="Callback tiếp nhận hồ sơ liên viện"
        description="Màn này dành riêng cho tài khoản gateway của bệnh viện nhận. Nó chỉ gửi biên nhận kỹ thuật với mục đích OPERATIONS, không mở workspace lâm sàng của bác sĩ."
      />

      <section className="settings-grid">
        <article className="panel">
          <p className="eyebrow">Gateway context</p>
          <h2>Phiên vận hành</h2>
          <div className="detail-grid compact">
            <Info label="Actor" value={authSession?.actor.actorId ?? "Chưa xác thực"} />
            <Info label="Vai trò" value={formatDemoRole(authSession?.actor.role ?? "integration")} />
            <Info label="PurposeOfUse" value="OPERATIONS" />
            <Info label="API" value={apiBaseUrl} />
          </div>
          <p className="empty-state">
            Luồng demo chuẩn: bác sĩ gửi gói chuyển hồ sơ trước, sau đó đăng nhập bằng gateway để xác nhận bệnh viện nhận đã tiếp nhận. Callback hợp lệ sẽ ghi audit `record-transfer.acknowledgement-callback` và đưa gói sang `completed`.
          </p>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Acknowledgement callback</p>
              <h2>Gửi biên nhận tiếp nhận</h2>
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
              Actor xác nhận
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
              Idempotency key lần gửi
              <input
                value={form.deliveryIdempotencyKey}
                onChange={(event) => updateField("deliveryIdempotencyKey", event.target.value)}
              />
            </label>
            <label className="wide-field">
              Ghi chú callback
              <textarea
                value={form.note}
                onChange={(event) => updateField("note", event.target.value)}
              />
            </label>
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi callback..." : "Gửi callback tiếp nhận"}
            </button>
          </form>
        </article>

        {result ? (
          <article className="panel">
            <p className="eyebrow">Callback result</p>
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
