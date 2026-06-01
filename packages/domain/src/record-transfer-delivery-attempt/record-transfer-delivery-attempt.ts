import { DomainError } from "../shared/domain-error.js";
import {
  assertCompletedAtIsNotBeforeQueuedAt,
  normalizeAttemptNumber,
  normalizeBundleType,
  normalizeEndpointAddress,
  normalizeHttpStatus,
  normalizeOptional,
  normalizeRequired,
  normalizeResponseBodyPreview,
  normalizeStatus,
  parseDate,
  validatePersistenceTimeline,
  validateTerminalState
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
    const queuedAt = input.queuedAt
      ? parseDate(input.queuedAt, "Thời điểm xếp hàng gửi hồ sơ không hợp lệ.")
      : new Date();

    return new RecordTransferDeliveryAttempt({
      id: normalizeRequired(input.id, "Mã lần gửi hồ sơ không được để trống."),
      recordTransferId: normalizeRequired(
        input.recordTransferId,
        "Lần gửi phải gắn với một yêu cầu chuyển hồ sơ."
      ),
      patientId: normalizeRequired(input.patientId, "Lần gửi phải gắn với một bệnh nhân."),
      targetEndpointId: normalizeRequired(
        input.targetEndpointId,
        "Lần gửi phải có endpoint đích."
      ),
      targetEndpointAddress: normalizeEndpointAddress(input.targetEndpointAddress),
      bundleId: normalizeRequired(input.bundleId, "Lần gửi phải có mã FHIR Bundle."),
      bundleType: normalizeBundleType(input.bundleType),
      idempotencyKey: normalizeRequired(
        input.idempotencyKey,
        "Lần gửi phải có idempotency key."
      ),
      attemptNumber: normalizeAttemptNumber(input.attemptNumber),
      status: "queued",
      queuedAt: queuedAt.toISOString(),
      createdAt: queuedAt.toISOString(),
      updatedAt: queuedAt.toISOString()
    });
  }

  static rehydrate(
    snapshot: RecordTransferDeliveryAttemptSnapshot
  ): RecordTransferDeliveryAttempt {
    const status = normalizeStatus(snapshot.status);
    const queuedAt = parseDate(
      snapshot.queuedAt,
      "Thời điểm xếp hàng gửi hồ sơ không hợp lệ."
    );
    const completedAt = snapshot.completedAt
      ? parseDate(snapshot.completedAt, "Thời điểm hoàn tất gửi hồ sơ không hợp lệ.")
      : undefined;
    const httpStatus =
      snapshot.httpStatus === undefined ? undefined : normalizeHttpStatus(snapshot.httpStatus);
    const responseBodyPreview = normalizeResponseBodyPreview(snapshot.responseBodyPreview);
    const errorMessage = normalizeOptional(snapshot.errorMessage);
    const createdAt = parseDate(snapshot.createdAt, "Thời điểm tạo lần gửi không hợp lệ.");
    const updatedAt = parseDate(
      snapshot.updatedAt,
      "Thời điểm cập nhật lần gửi không hợp lệ."
    );

    validateTerminalState({
      status,
      queuedAt,
      completedAt,
      httpStatus,
      responseBodyPreview,
      errorMessage
    });
    validatePersistenceTimeline({ queuedAt, createdAt, updatedAt });

    return new RecordTransferDeliveryAttempt({
      ...snapshot,
      id: normalizeRequired(snapshot.id, "Mã lần gửi hồ sơ không được để trống."),
      recordTransferId: normalizeRequired(
        snapshot.recordTransferId,
        "Lần gửi phải gắn với một yêu cầu chuyển hồ sơ."
      ),
      patientId: normalizeRequired(snapshot.patientId, "Lần gửi phải gắn với một bệnh nhân."),
      targetEndpointId: normalizeRequired(
        snapshot.targetEndpointId,
        "Lần gửi phải có endpoint đích."
      ),
      targetEndpointAddress: normalizeEndpointAddress(snapshot.targetEndpointAddress),
      bundleId: normalizeRequired(snapshot.bundleId, "Lần gửi phải có mã FHIR Bundle."),
      bundleType: normalizeBundleType(snapshot.bundleType),
      idempotencyKey: normalizeRequired(
        snapshot.idempotencyKey,
        "Lần gửi phải có idempotency key."
      ),
      attemptNumber: normalizeAttemptNumber(snapshot.attemptNumber),
      status,
      queuedAt: queuedAt.toISOString(),
      completedAt: completedAt?.toISOString(),
      httpStatus,
      responseBodyPreview,
      errorMessage,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString()
    });
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
