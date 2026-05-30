import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  buildRecordTransferOperationalSummary,
  formatDateTime,
  formatRecordTransferBundleType,
  formatRecordTransferDeliveryAttemptStatus,
  formatRecordTransferPriority,
  formatRecordTransferRetryCount,
  formatRecordTransferStatus
} from "../../lib/clinicalFormatters.js";
import type {
  NewRecordTransferForm,
  RecordTransfer,
  RecordTransferBundleType,
  RecordTransferDeliveryAttempt,
  RecordTransferPriority
} from "../../types/clinical.js";

type RecordTransferInteropPanelProps = {
  readonly deliveryAttemptWarning?: string;
  readonly deliveryAttempts: readonly RecordTransferDeliveryAttempt[];
  readonly form: NewRecordTransferForm;
  readonly isLoadingDeliveryAttempts: boolean;
  readonly isLoadingRecordTransfers: boolean;
  readonly isPatientMerged: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly recordTransfers: readonly RecordTransfer[];
  readonly selectedRecordTransfer?: RecordTransfer;
  readonly selectedRecordTransferId?: string;
  readonly transitioningRecordTransferId?: string;
  readonly onCreateRecordTransfer: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFailRecordTransfer: (recordTransfer: RecordTransfer) => Promise<void> | void;
  readonly onFormChange: (form: NewRecordTransferForm) => void;
  readonly onReceiveRecordTransfer: (recordTransfer: RecordTransfer) => Promise<void> | void;
  readonly onRetryRecordTransfer: (recordTransfer: RecordTransfer) => Promise<void> | void;
  readonly onSelectRecordTransfer: (recordTransferId: string) => void;
  readonly onSendRecordTransfer: (recordTransfer: RecordTransfer) => Promise<void> | void;
};

export function RecordTransferInteropPanel({
  deliveryAttemptWarning,
  deliveryAttempts,
  form,
  isLoadingDeliveryAttempts,
  isLoadingRecordTransfers,
  isPatientMerged,
  isSubmitting,
  isWriteDisabled,
  recordTransfers,
  selectedRecordTransfer,
  selectedRecordTransferId,
  transitioningRecordTransferId,
  onCreateRecordTransfer,
  onFailRecordTransfer,
  onFormChange,
  onReceiveRecordTransfer,
  onRetryRecordTransfer,
  onSelectRecordTransfer,
  onSendRecordTransfer
}: RecordTransferInteropPanelProps) {
  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Chuyển hồ sơ liên viện</p>
          <h2>Gói chuyển hồ sơ</h2>
        </div>
        <span className="pill cyan">
          {isLoadingRecordTransfers ? "đang tải" : `${recordTransfers.length} gói`}
        </span>
      </div>

      <div className="document-layout">
        <div className="medication-cards">
          {recordTransfers.map((recordTransfer) => (
            <button
              className={
                recordTransfer.id === selectedRecordTransferId
                  ? "medication-card selected"
                  : "medication-card"
              }
              key={recordTransfer.id}
              type="button"
              onClick={() => onSelectRecordTransfer(recordTransfer.id)}
            >
              <span>{formatRecordTransferStatus(recordTransfer.status)}</span>
              <strong>{formatRecordTransferBundleType(recordTransfer.bundleType)}</strong>
              <small>
                {recordTransfer.recipientOrganizationId} · {formatDateTime(recordTransfer.requestedAt)}
              </small>
            </button>
          ))}
          {recordTransfers.length === 0 ? (
            <p className="empty-state">
              Chưa có gói chuyển hồ sơ. API sẽ kiểm consent trước khi cho tạo yêu
              cầu chuyển.
            </p>
          ) : null}
        </div>

        <div className="medication-summary">
          {selectedRecordTransfer ? (
            <>
              <RecordTransferOperationalSummary
                attempts={deliveryAttempts}
                recordTransfer={selectedRecordTransfer}
              />
              <div className="document-meta">
                <Info label="Trạng thái" value={formatRecordTransferStatus(selectedRecordTransfer.status)} />
                <Info label="Độ ưu tiên" value={formatRecordTransferPriority(selectedRecordTransfer.priority)} />
                <Info label="Bundle" value={selectedRecordTransfer.bundleId} />
                <Info label="Loại gói" value={formatRecordTransferBundleType(selectedRecordTransfer.bundleType)} />
                <Info label="Cơ sở gửi" value={selectedRecordTransfer.sourceOrganizationId} />
                <Info label="Cơ sở nhận" value={selectedRecordTransfer.recipientOrganizationId} />
                <Info label="Consent" value={selectedRecordTransfer.consentReference} />
                <Info label="Người tạo" value={selectedRecordTransfer.requestedByActorId} />
                <Info
                  label="Thời điểm gửi"
                  value={selectedRecordTransfer.sentAt ? formatDateTime(selectedRecordTransfer.sentAt) : "Chưa gửi"}
                />
                <Info
                  label="Thời điểm nhận"
                  value={selectedRecordTransfer.receivedAt ? formatDateTime(selectedRecordTransfer.receivedAt) : "Chưa xác nhận"}
                />
                <Info label="Người xác nhận nhận" value={selectedRecordTransfer.receivedByActorId ?? "Chưa xác nhận"} />
                <Info label="Biên nhận tiếp nhận" value={selectedRecordTransfer.acknowledgementReference ?? "Chưa phát sinh"} />
                <Info label="Lỗi gửi" value={selectedRecordTransfer.failureReason ?? "Chưa ghi nhận"} />
                <Info label="Thử lại" value={formatRecordTransferRetryCount(selectedRecordTransfer.retryCount)} />
                <Info
                  label="Hẹn gửi lại"
                  value={selectedRecordTransfer.nextRetryAt ? formatDateTime(selectedRecordTransfer.nextRetryAt) : "Chưa hẹn"}
                />
                <Info
                  label="Hàng lỗi cuối"
                  value={selectedRecordTransfer.deadLetteredAt ? formatDateTime(selectedRecordTransfer.deadLetteredAt) : "Chưa đưa vào"}
                />
              </div>
              <div className="panel-actions">
                <button
                  className="ghost-button compact-button"
                  type="button"
                  disabled={
                    isPatientMerged ||
                    Boolean(selectedRecordTransfer.sentAt) ||
                    ["completed", "cancelled", "failed", "dead-lettered"].includes(selectedRecordTransfer.status) ||
                    transitioningRecordTransferId === selectedRecordTransfer.id
                  }
                  onClick={() => void onSendRecordTransfer(selectedRecordTransfer)}
                >
                  {transitioningRecordTransferId === selectedRecordTransfer.id
                    ? "Đang cập nhật..."
                    : "Đánh dấu đã gửi"}
                </button>
                <button
                  className="ghost-button compact-button"
                  type="button"
                  disabled={
                    isPatientMerged ||
                    !selectedRecordTransfer.sentAt ||
                    selectedRecordTransfer.status !== "in-progress" ||
                    transitioningRecordTransferId === selectedRecordTransfer.id
                  }
                  onClick={() => void onReceiveRecordTransfer(selectedRecordTransfer)}
                >
                  {transitioningRecordTransferId === selectedRecordTransfer.id
                    ? "Đang cập nhật..."
                    : "Xác nhận đã nhận"}
                </button>
                <button
                  className="ghost-button compact-button"
                  type="button"
                  disabled={
                    isPatientMerged ||
                    selectedRecordTransfer.status === "completed" ||
                    selectedRecordTransfer.status === "cancelled" ||
                    selectedRecordTransfer.status === "failed" ||
                    selectedRecordTransfer.status === "dead-lettered" ||
                    transitioningRecordTransferId === selectedRecordTransfer.id
                  }
                  onClick={() => void onFailRecordTransfer(selectedRecordTransfer)}
                >
                  {transitioningRecordTransferId === selectedRecordTransfer.id
                    ? "Đang cập nhật..."
                    : "Ghi nhận lỗi gửi"}
                </button>
                <button
                  className="ghost-button compact-button"
                  type="button"
                  disabled={
                    isPatientMerged ||
                    selectedRecordTransfer.status !== "failed" ||
                    transitioningRecordTransferId === selectedRecordTransfer.id
                  }
                  onClick={() => void onRetryRecordTransfer(selectedRecordTransfer)}
                >
                  {transitioningRecordTransferId === selectedRecordTransfer.id
                    ? "Đang cập nhật..."
                    : "Đưa vào hàng đợi gửi lại"}
                </button>
              </div>
              <p className="empty-state">
                RecordTransfer là lớp điều phối nội bộ: sản phẩm dùng nó để theo
                dõi gửi/nhận, còn khi liên thông chuẩn sẽ xuất thành FHIR Task trỏ
                tới Bundle và consent tương ứng.
              </p>
              {selectedRecordTransfer.status === "dead-lettered" ? (
                <p className="transfer-alert">
                  Gói này đã vượt quá số lần thử gửi tự động. Cần kiểm tra endpoint
                  FHIR, consent, mạng hoặc cấu hình bên nhận trước khi tạo luồng xử
                  lý tiếp theo.
                </p>
              ) : null}
              <RecordTransferDeliveryAttemptList
                attempts={deliveryAttempts}
                isLoading={isLoadingDeliveryAttempts}
                warning={deliveryAttemptWarning}
              />
            </>
          ) : (
            <p className="empty-state">Chọn một gói chuyển để xem siêu dữ liệu và xuất FHIR Task.</p>
          )}
        </div>
      </div>

      <form className="medication-form" onSubmit={(event) => void onCreateRecordTransfer(event)}>
        <label>
          Độ ưu tiên
          <select
            value={form.priority}
            onChange={(event) =>
              onFormChange({
                ...form,
                priority: event.target.value as RecordTransferPriority
              })
            }
          >
            <option value="routine">Thường quy</option>
            <option value="urgent">Khẩn</option>
            <option value="asap">Càng sớm càng tốt</option>
            <option value="stat">Cấp cứu</option>
          </select>
        </label>
        <label>
          Loại Bundle
          <select
            value={form.bundleType}
            onChange={(event) =>
              onFormChange({
                ...form,
                bundleType: event.target.value as RecordTransferBundleType
              })
            }
          >
            <option value="document">Document Bundle</option>
            <option value="collection">Collection Bundle</option>
          </select>
        </label>
        <label>
          Cơ sở gửi
          <input
            value={form.sourceOrganizationId}
            onChange={(event) =>
              onFormChange({
                ...form,
                sourceOrganizationId: event.target.value
              })
            }
          />
        </label>
        <label>
          Cơ sở nhận
          <input
            value={form.recipientOrganizationId}
            onChange={(event) =>
              onFormChange({
                ...form,
                recipientOrganizationId: event.target.value
              })
            }
          />
        </label>
        <label>
          Consent
          <input
            value={form.consentReference}
            onChange={(event) =>
              onFormChange({
                ...form,
                consentReference: event.target.value
              })
            }
          />
        </label>
        <label className="wide-field">
          Lý do chuyển hồ sơ
          <input
            value={form.reason}
            onChange={(event) =>
              onFormChange({
                ...form,
                reason: event.target.value
              })
            }
          />
        </label>
        <label className="wide-field">
          Ghi chú vận hành
          <input
            value={form.note}
            onChange={(event) =>
              onFormChange({
                ...form,
                note: event.target.value
              })
            }
          />
        </label>
        <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
          {isSubmitting ? "Đang tạo..." : "Tạo gói chuyển hồ sơ"}
        </button>
      </form>
    </article>
  );
}

type RecordTransferDeliveryAttemptListProps = {
  readonly attempts: readonly RecordTransferDeliveryAttempt[];
  readonly isLoading: boolean;
  readonly warning?: string;
};

function RecordTransferDeliveryAttemptList({
  attempts,
  isLoading,
  warning
}: RecordTransferDeliveryAttemptListProps) {
  return (
    <div className="delivery-attempts">
      <div className="subsection-heading">
        <div>
          <strong>Lịch sử gửi qua endpoint</strong>
          <span>
            Outbox vận hành cho biết hệ thống đã xếp hàng, gửi thành công hay lỗi
            từng lần.
          </span>
        </div>
        <span className="pill cyan">
          {isLoading ? "đang tải" : `${attempts.length} lần`}
        </span>
      </div>

      {warning ? <p className="transfer-alert">{warning}</p> : null}

      {attempts.map((attempt) => (
        <div
          className={`delivery-attempt delivery-attempt--${attempt.status}`}
          key={attempt.id}
        >
          <div>
            <span>Lần gửi</span>
            <strong>#{attempt.attemptNumber}</strong>
          </div>
          <div>
            <span>Trạng thái</span>
            <strong>{formatRecordTransferDeliveryAttemptStatus(attempt.status)}</strong>
          </div>
          <div>
            <span>HTTP</span>
            <strong>{attempt.httpStatus ? `HTTP ${attempt.httpStatus}` : "Chưa có"}</strong>
          </div>
          <div>
            <span>Xếp hàng</span>
            <strong>{formatDateTime(attempt.queuedAt)}</strong>
          </div>
          <div>
            <span>Hoàn tất</span>
            <strong>{attempt.completedAt ? formatDateTime(attempt.completedAt) : "Đang chờ"}</strong>
          </div>
          <div className="delivery-attempt-wide">
            <span>Endpoint đích</span>
            <strong>{attempt.targetEndpointAddress}</strong>
          </div>
          <div className="delivery-attempt-wide">
            <span>Idempotency key</span>
            <strong className="hash-text">{attempt.idempotencyKey}</strong>
          </div>
          {attempt.errorMessage || attempt.responseBodyPreview ? (
            <div className="delivery-attempt-wide">
              <span>{attempt.errorMessage ? "Lỗi" : "Phản hồi"}</span>
              <strong>{attempt.errorMessage ?? attempt.responseBodyPreview}</strong>
            </div>
          ) : null}
        </div>
      ))}

      {!isLoading && attempts.length === 0 ? (
        <p className="empty-state">
          Chưa có lần gửi nào. Khi bấm gửi, API sẽ tạo delivery attempt kèm
          endpoint, Bundle và idempotency key để worker xử lý.
        </p>
      ) : null}
    </div>
  );
}

type RecordTransferOperationalSummaryProps = {
  readonly attempts: readonly RecordTransferDeliveryAttempt[];
  readonly recordTransfer: RecordTransfer;
};

function RecordTransferOperationalSummary({
  attempts,
  recordTransfer
}: RecordTransferOperationalSummaryProps) {
  const summary = buildRecordTransferOperationalSummary(recordTransfer, attempts);

  return (
    <div className={`transfer-ops-summary transfer-ops-summary--${summary.severity}`}>
      <div className="transfer-ops-headline">
        <span>Tình trạng vận hành</span>
        <strong>{summary.title}</strong>
        <p>{summary.description}</p>
      </div>
      <div className="transfer-ops-grid">
        <Info label="Tín hiệu kỹ thuật" value={summary.technicalSignal} />
        <Info label="Số lần gửi" value={`${summary.attemptCount}`} />
        <Info label="Lần lỗi" value={`${summary.failedAttemptCount}`} />
        <Info label="HTTP gần nhất" value={summary.lastHttpStatus} />
        <Info label="Lịch retry" value={summary.nextRetry} />
      </div>
      <div className="transfer-ops-action">
        <span>Việc cần làm tiếp</span>
        <strong>{summary.nextAction}</strong>
      </div>
    </div>
  );
}
