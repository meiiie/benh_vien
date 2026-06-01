import { DomainError } from "../shared/domain-error.js";
import {
  buildRecordTransferSnapshot,
  normalizePersistedRecordTransferSnapshot
} from "./record-transfer.factory.js";
import {
  normalizeOptional,
  normalizeRequired,
  parseDate
} from "./record-transfer.validation.js";
import type {
  CreateRecordTransferInput,
  MarkRecordTransferDeadLetteredInput,
  MarkRecordTransferFailedInput,
  MarkRecordTransferReceivedInput,
  MarkRecordTransferSentInput,
  RecordTransferSnapshot,
  RetryRecordTransferInput
} from "./record-transfer.types.js";

export type {
  CreateRecordTransferInput,
  MarkRecordTransferDeadLetteredInput,
  MarkRecordTransferFailedInput,
  MarkRecordTransferReceivedInput,
  MarkRecordTransferSentInput,
  RecordTransferBundleType,
  RecordTransferPriority,
  RecordTransferSnapshot,
  RecordTransferStatus,
  RetryRecordTransferInput
} from "./record-transfer.types.js";

export class RecordTransfer {
  private constructor(private props: RecordTransferSnapshot) {}

  static create(input: CreateRecordTransferInput): RecordTransfer {
    return new RecordTransfer(buildRecordTransferSnapshot(input));
  }

  static rehydrate(snapshot: RecordTransferSnapshot): RecordTransfer {
    return new RecordTransfer(normalizePersistedRecordTransferSnapshot(snapshot));
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  markSent(input: MarkRecordTransferSentInput = {}): void {
    if (this.props.status === "completed") {
      throw new DomainError("Hồ sơ đã được tiếp nhận, không thể gửi lại.");
    }

    if (
      this.props.status === "cancelled" ||
      this.props.status === "failed" ||
      this.props.status === "dead-lettered"
    ) {
      throw new DomainError(
        "Không thể gửi hồ sơ khi yêu cầu đã hủy, thất bại hoặc đã vào hàng lỗi cuối."
      );
    }

    if (this.props.sentAt) {
      throw new DomainError("Hồ sơ đã có thời điểm gửi.");
    }

    const sentAt = input.sentAt
      ? parseDate(input.sentAt, "Thời điểm gửi hồ sơ không hợp lệ.")
      : new Date();
    const requestedAt = parseDate(
      this.props.requestedAt,
      "Thời điểm yêu cầu chuyển hồ sơ không hợp lệ."
    );

    if (sentAt < requestedAt) {
      throw new DomainError("Thời điểm gửi hồ sơ không được trước thời điểm yêu cầu.");
    }

    this.props = {
      ...this.props,
      status: "in-progress",
      sentAt: sentAt.toISOString(),
      note: normalizeOptional(input.note) ?? this.props.note,
      updatedAt: sentAt.toISOString()
    };
  }

  markReceived(input: MarkRecordTransferReceivedInput = {}): void {
    if (this.props.status === "completed") {
      throw new DomainError("Hồ sơ đã được ghi nhận tiếp nhận.");
    }

    if (
      this.props.status === "cancelled" ||
      this.props.status === "failed" ||
      this.props.status === "dead-lettered"
    ) {
      throw new DomainError(
        "Không thể tiếp nhận hồ sơ khi yêu cầu đã hủy, thất bại hoặc đã vào hàng lỗi cuối."
      );
    }

    if (!this.props.sentAt) {
      throw new DomainError("Hồ sơ chỉ được tiếp nhận sau khi đã có thời điểm gửi.");
    }

    const receivedAt = input.receivedAt
      ? parseDate(input.receivedAt, "Thời điểm tiếp nhận hồ sơ không hợp lệ.")
      : new Date();
    const sentAt = parseDate(this.props.sentAt, "Thời điểm gửi hồ sơ không hợp lệ.");

    if (receivedAt < sentAt) {
      throw new DomainError("Thời điểm tiếp nhận hồ sơ không được trước thời điểm gửi.");
    }

    this.props = {
      ...this.props,
      status: "completed",
      receivedAt: receivedAt.toISOString(),
      receivedByActorId: normalizeOptional(input.receivedByActorId) ?? this.props.receivedByActorId,
      acknowledgementReference:
        normalizeOptional(input.acknowledgementReference) ?? this.props.acknowledgementReference,
      note: normalizeOptional(input.note) ?? this.props.note,
      updatedAt: receivedAt.toISOString()
    };
  }

  markFailed(input: MarkRecordTransferFailedInput): void {
    if (this.props.status === "completed") {
      throw new DomainError("Hồ sơ đã được tiếp nhận, không thể đánh dấu lỗi gửi.");
    }

    if (this.props.status === "cancelled") {
      throw new DomainError("Không thể đánh dấu lỗi cho yêu cầu chuyển hồ sơ đã hủy.");
    }

    if (this.props.status === "dead-lettered") {
      throw new DomainError("Không thể đánh dấu lỗi cho hồ sơ đã vào hàng lỗi cuối.");
    }

    const failedAt = input.failedAt
      ? parseDate(input.failedAt, "Thời điểm lỗi chuyển hồ sơ không hợp lệ.")
      : new Date();
    const requestedAt = parseDate(
      this.props.requestedAt,
      "Thời điểm yêu cầu chuyển hồ sơ không hợp lệ."
    );

    if (failedAt < requestedAt) {
      throw new DomainError("Thời điểm lỗi chuyển hồ sơ không được trước thời điểm yêu cầu.");
    }

    if (this.props.sentAt) {
      const sentAt = parseDate(this.props.sentAt, "Thời điểm gửi hồ sơ không hợp lệ.");

      if (failedAt < sentAt) {
        throw new DomainError("Thời điểm lỗi chuyển hồ sơ không được trước thời điểm gửi.");
      }
    }

    const nextRetryAt = input.nextRetryAt
      ? parseDate(input.nextRetryAt, "Thời điểm thử gửi lại hồ sơ không hợp lệ.")
      : undefined;

    if (nextRetryAt && nextRetryAt < failedAt) {
      throw new DomainError("Thời điểm thử gửi lại không được trước thời điểm lỗi chuyển hồ sơ.");
    }

    this.props = {
      ...this.props,
      status: "failed",
      failedAt: failedAt.toISOString(),
      failureReason: normalizeRequired(input.failureReason, "Cần có lý do lỗi chuyển hồ sơ."),
      nextRetryAt: nextRetryAt?.toISOString(),
      note: normalizeOptional(input.note) ?? this.props.note,
      updatedAt: failedAt.toISOString()
    };
  }

  retry(input: RetryRecordTransferInput = {}): void {
    if (this.props.status !== "failed") {
      throw new DomainError(
        "Chỉ có thể thử gửi lại khi yêu cầu chuyển hồ sơ đang ở trạng thái lỗi."
      );
    }

    const retryAt = input.retryAt
      ? parseDate(input.retryAt, "Thời điểm thử gửi lại hồ sơ không hợp lệ.")
      : new Date();

    if (this.props.failedAt) {
      const failedAt = parseDate(this.props.failedAt, "Thời điểm lỗi chuyển hồ sơ không hợp lệ.");

      if (retryAt < failedAt) {
        throw new DomainError("Thời điểm thử gửi lại không được trước thời điểm lỗi chuyển hồ sơ.");
      }
    }

    this.props = {
      ...this.props,
      status: "ready",
      sentAt: undefined,
      receivedAt: undefined,
      receivedByActorId: undefined,
      acknowledgementReference: undefined,
      failedAt: undefined,
      failureReason: undefined,
      nextRetryAt: undefined,
      retryCount: this.props.retryCount + 1,
      note: normalizeOptional(input.note) ?? this.props.note,
      updatedAt: retryAt.toISOString()
    };
  }

  markDeadLettered(input: MarkRecordTransferDeadLetteredInput = {}): void {
    if (this.props.status !== "failed") {
      throw new DomainError(
        "Chỉ có thể đưa vào hàng lỗi cuối khi yêu cầu chuyển hồ sơ đang ở trạng thái lỗi."
      );
    }

    if (!this.props.failedAt || !this.props.failureReason) {
      throw new DomainError("Hồ sơ vào hàng lỗi cuối cần có thời điểm lỗi và lý do lỗi trước đó.");
    }

    const deadLetteredAt = input.deadLetteredAt
      ? parseDate(input.deadLetteredAt, "Thời điểm đưa hồ sơ vào hàng lỗi cuối không hợp lệ.")
      : new Date();
    const failedAt = parseDate(this.props.failedAt, "Thời điểm lỗi chuyển hồ sơ không hợp lệ.");

    if (deadLetteredAt < failedAt) {
      throw new DomainError(
        "Thời điểm đưa hồ sơ vào hàng lỗi cuối không được trước thời điểm lỗi chuyển hồ sơ."
      );
    }

    this.props = {
      ...this.props,
      status: "dead-lettered",
      nextRetryAt: undefined,
      deadLetteredAt: deadLetteredAt.toISOString(),
      note: normalizeOptional(input.note) ?? this.props.note,
      updatedAt: deadLetteredAt.toISOString()
    };
  }

  toSnapshot(): RecordTransferSnapshot {
    return {
      ...this.props
    };
  }
}
