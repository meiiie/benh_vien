import { DomainError } from "../shared/domain-error.js";
import {
  buildQueuedDeliveryAttemptSnapshot,
  buildRehydratedDeliveryAttemptSnapshot
} from "./record-transfer-delivery-attempt.factory.js";
import {
  assertCompletedAtIsNotBeforeQueuedAt,
  normalizeHttpStatus,
  normalizeRequired,
  normalizeResponseBodyPreview,
  parseDate
} from "./record-transfer-delivery-attempt.validation.js";
import type {
  MarkRecordTransferDeliveryAttemptFailedInput,
  MarkRecordTransferDeliveryAttemptSucceededInput,
  QueueRecordTransferDeliveryAttemptInput,
  RecordTransferDeliveryAttemptBundleType,
  RecordTransferDeliveryAttemptSnapshot,
  RecordTransferDeliveryAttemptStatus
} from "./record-transfer-delivery-attempt.types.js";

export type {
  MarkRecordTransferDeliveryAttemptFailedInput,
  MarkRecordTransferDeliveryAttemptSucceededInput,
  QueueRecordTransferDeliveryAttemptInput,
  RecordTransferDeliveryAttemptBundleType,
  RecordTransferDeliveryAttemptSnapshot,
  RecordTransferDeliveryAttemptStatus
} from "./record-transfer-delivery-attempt.types.js";

export class RecordTransferDeliveryAttempt {
  private constructor(private props: RecordTransferDeliveryAttemptSnapshot) {}

  static queue(input: QueueRecordTransferDeliveryAttemptInput): RecordTransferDeliveryAttempt {
    return new RecordTransferDeliveryAttempt(buildQueuedDeliveryAttemptSnapshot(input));
  }

  static rehydrate(
    snapshot: RecordTransferDeliveryAttemptSnapshot
  ): RecordTransferDeliveryAttempt {
    return new RecordTransferDeliveryAttempt(
      buildRehydratedDeliveryAttemptSnapshot(snapshot)
    );
  }

  get id(): string {
    return this.props.id;
  }

  get recordTransferId(): string {
    return this.props.recordTransferId;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  markSucceeded(input: MarkRecordTransferDeliveryAttemptSucceededInput): void {
    this.assertQueued();

    const completedAt = input.completedAt
      ? parseDate(input.completedAt, "Thời điểm hoàn tất gửi hồ sơ không hợp lệ.")
      : new Date();
    const httpStatus = normalizeHttpStatus(input.httpStatus);
    assertCompletedAtIsNotBeforeQueuedAt(completedAt, this.props.queuedAt);

    if (httpStatus < 200 || httpStatus > 299) {
      throw new DomainError("Lần gửi thành công phải có HTTP status 2xx.");
    }

    this.props = {
      ...this.props,
      status: "succeeded",
      completedAt: completedAt.toISOString(),
      httpStatus,
      responseBodyPreview: normalizeResponseBodyPreview(input.responseBodyPreview),
      errorMessage: undefined,
      updatedAt: completedAt.toISOString()
    };
  }

  markFailed(input: MarkRecordTransferDeliveryAttemptFailedInput): void {
    this.assertQueued();

    const completedAt = input.completedAt
      ? parseDate(input.completedAt, "Thời điểm hoàn tất gửi hồ sơ không hợp lệ.")
      : new Date();
    assertCompletedAtIsNotBeforeQueuedAt(completedAt, this.props.queuedAt);

    this.props = {
      ...this.props,
      status: "failed",
      completedAt: completedAt.toISOString(),
      httpStatus:
        input.httpStatus === undefined ? undefined : normalizeHttpStatus(input.httpStatus),
      responseBodyPreview: normalizeResponseBodyPreview(input.responseBodyPreview),
      errorMessage: normalizeRequired(input.errorMessage, "Cần có lý do lỗi gửi hồ sơ."),
      updatedAt: completedAt.toISOString()
    };
  }

  toSnapshot(): RecordTransferDeliveryAttemptSnapshot {
    return {
      ...this.props
    };
  }

  private assertQueued(): void {
    if (this.props.status !== "queued") {
      throw new DomainError("Chỉ có thể cập nhật lần gửi hồ sơ đang ở trạng thái chờ gửi.");
    }
  }
}
