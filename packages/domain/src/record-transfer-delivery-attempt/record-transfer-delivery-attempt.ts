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

export class RecordTransferDeliveryAttempt {
  private constructor(private readonly props: RecordTransferDeliveryAttemptSnapshot) {}

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
    return new RecordTransferDeliveryAttempt({
      ...snapshot,
      targetEndpointAddress: normalizeEndpointAddress(snapshot.targetEndpointAddress),
      attemptNumber: normalizeAttemptNumber(snapshot.attemptNumber),
      queuedAt: parseDate(
        snapshot.queuedAt,
        "Thời điểm xếp hàng gửi hồ sơ không hợp lệ."
      ).toISOString(),
      completedAt: snapshot.completedAt
        ? parseDate(snapshot.completedAt, "Thời điểm hoàn tất gửi hồ sơ không hợp lệ.").toISOString()
        : undefined,
      httpStatus: snapshot.httpStatus
        ? normalizeHttpStatus(snapshot.httpStatus)
        : undefined,
      responseBodyPreview: normalizeOptional(snapshot.responseBodyPreview),
      errorMessage: normalizeOptional(snapshot.errorMessage),
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

  toSnapshot(): RecordTransferDeliveryAttemptSnapshot {
    return {
      ...this.props
    };
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

function normalizeHttpStatus(value: number): number {
  if (!Number.isInteger(value) || value < 100 || value > 599) {
    throw new DomainError("HTTP status của lần gửi hồ sơ không hợp lệ.");
  }

  return value;
}

function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}
