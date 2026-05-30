import { DomainError } from "../shared/domain-error.js";

export type RecordTransferDeliveryAttemptStatus = "queued" | "succeeded" | "failed";

export type RecordTransferDeliveryAttemptSnapshot = {
  readonly id: string;
  readonly recordTransferId: string;
  readonly patientId: string;
  readonly targetEndpointId: string;
  readonly targetEndpointAddress: string;
  readonly bundleId: string;
  readonly bundleType: "collection" | "document";
  readonly idempotencyKey: string;
  readonly attemptNumber: number;
  readonly status: RecordTransferDeliveryAttemptStatus;
  readonly queuedAt: string;
  readonly completedAt?: string;
  readonly httpStatus?: number;
  readonly responseBodyPreview?: string;
  readonly errorMessage?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type QueueRecordTransferDeliveryAttemptInput = Omit<
  RecordTransferDeliveryAttemptSnapshot,
  | "status"
  | "queuedAt"
  | "completedAt"
  | "httpStatus"
  | "responseBodyPreview"
  | "errorMessage"
  | "createdAt"
  | "updatedAt"
> & {
  readonly queuedAt?: string;
};

export type MarkRecordTransferDeliveryAttemptSucceededInput = {
  readonly completedAt?: string;
  readonly httpStatus: number;
  readonly responseBodyPreview?: string;
};

export type MarkRecordTransferDeliveryAttemptFailedInput = {
  readonly completedAt?: string;
  readonly httpStatus?: number;
  readonly responseBodyPreview?: string;
  readonly errorMessage: string;
};

export class RecordTransferDeliveryAttempt {
  private constructor(private props: RecordTransferDeliveryAttemptSnapshot) {}

  static queue(input: QueueRecordTransferDeliveryAttemptInput): RecordTransferDeliveryAttempt {
    const now = new Date();
    const queuedAt = input.queuedAt
      ? parseDate(input.queuedAt, "Thời điểm xếp hàng gửi hồ sơ không hợp lệ.")
      : now;

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
      bundleType: input.bundleType,
      idempotencyKey: normalizeRequired(
        input.idempotencyKey,
        "Lần gửi phải có idempotency key."
      ),
      attemptNumber: normalizeAttemptNumber(input.attemptNumber),
      status: "queued",
      queuedAt: queuedAt.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  static rehydrate(
    snapshot: RecordTransferDeliveryAttemptSnapshot
  ): RecordTransferDeliveryAttempt {
    const status = normalizeStatus(snapshot.status);
    const completedAt = snapshot.completedAt
      ? parseDate(snapshot.completedAt, "Thời điểm hoàn tất gửi hồ sơ không hợp lệ.").toISOString()
      : undefined;
    const httpStatus = snapshot.httpStatus
      ? normalizeHttpStatus(snapshot.httpStatus)
      : undefined;
    const errorMessage = normalizeOptional(snapshot.errorMessage);

    validateTerminalState({
      status,
      completedAt,
      httpStatus,
      errorMessage
    });

    return new RecordTransferDeliveryAttempt({
      ...snapshot,
      targetEndpointAddress: normalizeEndpointAddress(snapshot.targetEndpointAddress),
      attemptNumber: normalizeAttemptNumber(snapshot.attemptNumber),
      status,
      queuedAt: parseDate(
        snapshot.queuedAt,
        "Thời điểm xếp hàng gửi hồ sơ không hợp lệ."
      ).toISOString(),
      completedAt,
      httpStatus,
      responseBodyPreview: normalizeOptional(snapshot.responseBodyPreview),
      errorMessage,
      createdAt: parseDate(snapshot.createdAt, "Thời điểm tạo lần gửi không hợp lệ.").toISOString(),
      updatedAt: parseDate(
        snapshot.updatedAt,
        "Thời điểm cập nhật lần gửi không hợp lệ."
      ).toISOString()
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

    if (httpStatus < 200 || httpStatus > 299) {
      throw new DomainError("Lần gửi thành công phải có HTTP status 2xx.");
    }

    this.props = {
      ...this.props,
      status: "succeeded",
      completedAt: completedAt.toISOString(),
      httpStatus,
      responseBodyPreview: normalizeOptional(input.responseBodyPreview),
      errorMessage: undefined,
      updatedAt: completedAt.toISOString()
    };
  }

  markFailed(input: MarkRecordTransferDeliveryAttemptFailedInput): void {
    this.assertQueued();

    const completedAt = input.completedAt
      ? parseDate(input.completedAt, "Thời điểm hoàn tất gửi hồ sơ không hợp lệ.")
      : new Date();

    this.props = {
      ...this.props,
      status: "failed",
      completedAt: completedAt.toISOString(),
      httpStatus: input.httpStatus ? normalizeHttpStatus(input.httpStatus) : undefined,
      responseBodyPreview: normalizeOptional(input.responseBodyPreview),
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

function normalizeRequired(value: string, message: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw new DomainError(message);
  }

  return normalized;
}

function normalizeOptional(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}

function normalizeEndpointAddress(value: string): string {
  const normalized = normalizeRequired(value, "Địa chỉ endpoint đích không được để trống.");

  try {
    const url = new URL(normalized);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new DomainError("Endpoint FHIR đích phải dùng HTTP hoặc HTTPS.");
    }

    return normalized;
  } catch (error) {
    if (error instanceof DomainError) {
      throw error;
    }

    throw new DomainError("Địa chỉ endpoint FHIR đích không hợp lệ.");
  }
}

function normalizeAttemptNumber(value: number): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new DomainError("Số thứ tự lần gửi hồ sơ không hợp lệ.");
  }

  return value;
}

function normalizeStatus(value: RecordTransferDeliveryAttemptStatus): RecordTransferDeliveryAttemptStatus {
  if (!["queued", "succeeded", "failed"].includes(value)) {
    throw new DomainError("Trạng thái lần gửi hồ sơ không hợp lệ.");
  }

  return value;
}

function normalizeHttpStatus(value: number): number {
  if (!Number.isInteger(value) || value < 100 || value > 599) {
    throw new DomainError("HTTP status của lần gửi hồ sơ không hợp lệ.");
  }

  return value;
}

function validateTerminalState(input: {
  readonly status: RecordTransferDeliveryAttemptStatus;
  readonly completedAt?: string;
  readonly httpStatus?: number;
  readonly errorMessage?: string;
}): void {
  if (input.status === "queued" && input.completedAt) {
    throw new DomainError("Lần gửi đang chờ không được có thời điểm hoàn tất.");
  }

  if (input.status !== "queued" && !input.completedAt) {
    throw new DomainError("Lần gửi đã kết thúc phải có thời điểm hoàn tất.");
  }

  if (input.status === "succeeded" && !input.httpStatus) {
    throw new DomainError("Lần gửi thành công phải có HTTP status.");
  }

  if (input.status === "failed" && !input.errorMessage) {
    throw new DomainError("Lần gửi lỗi phải có thông điệp lỗi.");
  }
}

function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}
