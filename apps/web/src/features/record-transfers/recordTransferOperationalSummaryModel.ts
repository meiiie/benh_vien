import { buildRecordTransferOperationalSummaryContext } from "./recordTransferOperationalSummaryMetrics.js";
import { buildRecordTransferStatusSummary } from "./recordTransferOperationalSummaryStateModel.js";
import type {
  RecordTransferDeliveryAttemptLike,
  RecordTransferLike,
  RecordTransferOperationalSummaryLike
} from "./recordTransferOperationalSummaryTypes.js";

export function buildRecordTransferOperationalSummary(
  recordTransfer: RecordTransferLike,
  attempts: readonly RecordTransferDeliveryAttemptLike[]
): RecordTransferOperationalSummaryLike {
  return buildRecordTransferStatusSummary(
    recordTransfer,
    buildRecordTransferOperationalSummaryContext(recordTransfer, attempts)
  );
}
