import { Info } from "../../components/AppShell.js";
import type {
  RecordTransfer,
  RecordTransferDeliveryAttempt
} from "../../types/recordTransfers.js";
import { buildRecordTransferOperationalSummary } from "./recordTransferFormatters.js";

type RecordTransferOperationalSummaryProps = {
  readonly attempts: readonly RecordTransferDeliveryAttempt[];
  readonly recordTransfer: RecordTransfer;
};

export function RecordTransferOperationalSummary({
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
