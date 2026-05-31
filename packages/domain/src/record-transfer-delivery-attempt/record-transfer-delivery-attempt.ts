import { DomainError } from "../shared/domain-error.js";

export type RecordTransferDeliveryAttemptStatus = "queued" | "succeeded" | "failed";

type RecordTransferDeliveryAttemptBundleType =
  RecordTransferDeliveryAttemptSnapshot["bundleType"];

const deliveryAttemptStatuses = new Set<RecordTransferDeliveryAttemptStatus>([
  "queued",
  "succeeded",
  "failed"
]);
const deliveryAttemptBundleTypes = new Set<RecordTransferDeliveryAttemptBundleType>([
  "collection",
  "document"
]);

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
      bundleType: normalizeBundleType(input.bundleType),
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
    const queuedAt = parseDate(
      snapshot.queuedAt,
      "Thời điểm xếp hàng gửi hồ sơ không hợp lệ."
    );
    const completedAt = snapshot.completedAt
      ? parseDate(snapshot.completedAt, "Thời điểm hoàn tất gửi hồ sơ không hợp lệ.")
      : undefined;
    const httpStatus =
      snapshot.httpStatus === undefined ? undefined : normalizeHttpStatus(snapshot.httpStatus);
    const responseBodyPreview = normalizeOptional(snapshot.responseBodyPreview);
    const errorMessage = normalizeOptional(snapshot.errorMessage);

    validateTerminalState({
      status,
      queuedAt,
      completedAt,
      httpStatus,
      responseBodyPreview,
      errorMessage
    });

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
    assertCompletedAtIsNotBeforeQueuedAt(completedAt, this.props.queuedAt);

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
    assertCompletedAtIsNotBeforeQueuedAt(completedAt, this.props.queuedAt);

    this.props = {
      ...this.props,
      status: "failed",
      completedAt: completedAt.toISOString(),
      httpStatus:
        input.httpStatus === undefined ? undefined : normalizeHttpStatus(input.httpStatus),
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
  if (!deliveryAttemptStatuses.has(value)) {
    throw new DomainError("Trạng thái lần gửi hồ sơ không hợp lệ.");
  }

  return value;
}

function normalizeBundleType(
  value: RecordTransferDeliveryAttemptBundleType
): RecordTransferDeliveryAttemptBundleType {
  if (!deliveryAttemptBundleTypes.has(value)) {
    throw new DomainError("Loại FHIR Bundle của lần gửi hồ sơ không hợp lệ.");
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
  readonly queuedAt: Date;
  readonly completedAt?: Date;
  readonly httpStatus?: number;
  readonly responseBodyPreview?: string;
  readonly errorMessage?: string;
}): void {
  if (
    input.status === "queued" &&
    (input.completedAt || input.httpStatus || input.responseBodyPreview || input.errorMessage)
  ) {
    throw new DomainError("Lần gửi đang chờ không được có metadata hoàn tất.");
  }

  if (input.status !== "queued" && !input.completedAt) {
    throw new DomainError("Lần gửi đã kết thúc phải có thời điểm hoàn tất.");
  }

  if (input.completedAt) {
    assertCompletedAtIsNotBeforeQueuedAt(input.completedAt, input.queuedAt);
  }

  if (
    input.status === "succeeded" &&
    (input.httpStatus === undefined || input.httpStatus < 200 || input.httpStatus > 299)
  ) {
    throw new DomainError("Lần gửi thành công phải có HTTP status 2xx.");
  }

  if (input.status === "succeeded" && input.errorMessage) {
    throw new DomainError("Lần gửi thành công không được có thông điệp lỗi.");
  }

  if (input.status === "failed" && !input.errorMessage) {
    throw new DomainError("Lần gửi lỗi phải có thông điệp lỗi.");
  }

  if (input.status === "failed" && input.httpStatus !== undefined && input.httpStatus >= 200 && input.httpStatus <= 299) {
    throw new DomainError("Lần gửi lỗi không được có HTTP status 2xx.");
  }
}

function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}

function assertCompletedAtIsNotBeforeQueuedAt(completedAt: Date, queuedAt: string | Date): void {
  const normalizedQueuedAt =
    queuedAt instanceof Date
      ? queuedAt
      : parseDate(queuedAt, "Thời điểm xếp hàng gửi hồ sơ không hợp lệ.");

  if (completedAt < normalizedQueuedAt) {
    throw new DomainError("Thời điểm hoàn tất gửi hồ sơ không được trước thời điểm xếp hàng.");
  }
}
