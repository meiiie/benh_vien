import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { RecordTransferDeliveryAttempt } from "../../types/recordTransfers.js";
import { formatRecordTransferDeliveryAttemptStatus } from "./recordTransferFormatters.js";

type RecordTransferDeliveryAttemptListProps = {
  readonly attempts: readonly RecordTransferDeliveryAttempt[];
  readonly isLoading: boolean;
  readonly warning?: string;
};

export function RecordTransferDeliveryAttemptList({
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
