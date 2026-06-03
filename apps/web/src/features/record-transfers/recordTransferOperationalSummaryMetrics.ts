import { formatDateTime } from "../../lib/clinicalFormatters.js";
import { formatRecordTransferDeliveryAttemptStatus } from "./recordTransferLabelFormatters.js";
import type {
  RecordTransferDeliveryAttemptLike,
  RecordTransferLike,
  RecordTransferOperationalSummaryContext
} from "./recordTransferOperationalSummaryTypes.js";

export function buildRecordTransferOperationalSummaryContext(
  recordTransfer: RecordTransferLike,
  attempts: readonly RecordTransferDeliveryAttemptLike[]
): RecordTransferOperationalSummaryContext {
  const latestAttempt = getLatestRecordTransferAttempt(attempts);
  const failedAttemptCount = attempts.filter((attempt) => attempt.status === "failed").length;
  const lastHttpStatus = latestAttempt?.httpStatus
    ? `HTTP ${latestAttempt.httpStatus}`
    : "Chưa có";
  const nextRetry = recordTransfer.nextRetryAt
    ? formatDateTime(recordTransfer.nextRetryAt)
    : "Chưa hẹn";
  const technicalSignal = latestAttempt
    ? `Lần #${latestAttempt.attemptNumber}: ${formatRecordTransferDeliveryAttemptStatus(latestAttempt.status)}`
    : "Chưa có delivery attempt";

  return {
    baseMetrics: {
      attemptCount: attempts.length,
      failedAttemptCount,
      lastHttpStatus,
      nextRetry,
      technicalSignal
    },
    latestAttempt
  };
}

function getLatestRecordTransferAttempt(
  attempts: readonly RecordTransferDeliveryAttemptLike[]
): RecordTransferDeliveryAttemptLike | undefined {
  return attempts.reduce<RecordTransferDeliveryAttemptLike | undefined>((latest, attempt) => {
    if (!latest) {
      return attempt;
    }

    if (attempt.attemptNumber !== latest.attemptNumber) {
      return attempt.attemptNumber > latest.attemptNumber ? attempt : latest;
    }

    return Date.parse(attempt.updatedAt) > Date.parse(latest.updatedAt) ? attempt : latest;
  }, undefined);
}
