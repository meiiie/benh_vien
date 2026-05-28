import { DomainError } from "../shared/domain-error.js";

export type RecordTransferStatus =
  | "draft"
  | "requested"
  | "ready"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "failed"
  | "dead-lettered";

export type RecordTransferPriority = "routine" | "urgent" | "asap" | "stat";
export type RecordTransferBundleType = "collection" | "document";

export type RecordTransferSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly status: RecordTransferStatus;
  readonly priority: RecordTransferPriority;
  readonly bundleType: RecordTransferBundleType;
  readonly bundleId: string;
  readonly sourceOrganizationId: string;
  readonly recipientOrganizationId: string;
  readonly consentReference: string;
  readonly requestedByActorId: string;
  readonly reason: string;
  readonly requestedAt: string;
  readonly sentAt?: string;
  readonly receivedAt?: string;
  readonly receivedByActorId?: string;
  readonly acknowledgementReference?: string;
  readonly failedAt?: string;
  readonly failureReason?: string;
  readonly nextRetryAt?: string;
  readonly retryCount: number;
  readonly deadLetteredAt?: string;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateRecordTransferInput = Omit<
  RecordTransferSnapshot,
  | "status"
  | "priority"
  | "requestedAt"
  | "sentAt"
  | "receivedAt"
  | "receivedByActorId"
  | "acknowledgementReference"
  | "failedAt"
  | "failureReason"
  | "nextRetryAt"
  | "retryCount"
  | "deadLetteredAt"
  | "createdAt"
  | "updatedAt"
> & {
  readonly status?: RecordTransferStatus;
  readonly priority?: RecordTransferPriority;
  readonly requestedAt?: string;
  readonly sentAt?: string;
  readonly receivedAt?: string;
  readonly receivedByActorId?: string;
  readonly acknowledgementReference?: string;
  readonly failedAt?: string;
  readonly failureReason?: string;
  readonly nextRetryAt?: string;
  readonly retryCount?: number;
  readonly deadLetteredAt?: string;
};

export type MarkRecordTransferSentInput = {
  readonly sentAt?: string;
  readonly note?: string;
};

export type MarkRecordTransferReceivedInput = {
  readonly receivedAt?: string;
  readonly receivedByActorId?: string;
  readonly acknowledgementReference?: string;
  readonly note?: string;
};

export type MarkRecordTransferFailedInput = {
  readonly failedAt?: string;
  readonly failureReason: string;
  readonly nextRetryAt?: string;
  readonly note?: string;
};

export type RetryRecordTransferInput = {
  readonly retryAt?: string;
  readonly note?: string;
};

export type MarkRecordTransferDeadLetteredInput = {
  readonly deadLetteredAt?: string;
  readonly note?: string;
};

export class RecordTransfer {
  private constructor(private props: RecordTransferSnapshot) {}

  static create(input: CreateRecordTransferInput): RecordTransfer {
    const now = new Date();
    const requestedAt = input.requestedAt
      ? parseDate(input.requestedAt, "Thời điểm yêu cầu chuyển hồ sơ không hợp lệ.")
      : now;
    const sentAt = input.sentAt
      ? parseDate(input.sentAt, "Thời điểm gửi hồ sơ không hợp lệ.")
      : undefined;
    const receivedAt = input.receivedAt
      ? parseDate(input.receivedAt, "Thời điểm tiếp nhận hồ sơ không hợp lệ.")
      : undefined;
    const failedAt = input.failedAt
      ? parseDate(input.failedAt, "Thời điểm lỗi chuyển hồ sơ không hợp lệ.")
      : undefined;
    const nextRetryAt = input.nextRetryAt
      ? parseDate(input.nextRetryAt, "Thời điểm thử gửi lại hồ sơ không hợp lệ.")
      : undefined;
    const deadLetteredAt = input.deadLetteredAt
      ? parseDate(input.deadLetteredAt, "Thời điểm đưa hồ sơ vào hàng lỗi cuối không hợp lệ.")
      : undefined;
    const retryCount = normalizeRetryCount(input.retryCount ?? 0);
    const receivedByActorId = normalizeOptional(input.receivedByActorId);
    const acknowledgementReference = normalizeOptional(input.acknowledgementReference);

    const sourceOrganizationId = normalizeRequired(
      input.sourceOrganizationId,
      "Cần có cơ sở y tế gửi hồ sơ."
    );
    const recipientOrganizationId = normalizeRequired(
      input.recipientOrganizationId,
      "Cần có cơ sở y tế nhận hồ sơ."
    );

    if (sourceOrganizationId === recipientOrganizationId) {
      throw new DomainError("Cơ sở gửi và cơ sở nhận hồ sơ phải khác nhau.");
    }

    if (sentAt && sentAt < requestedAt) {
      throw new DomainError("Thời điểm gửi hồ sơ không được trước thời điểm yêu cầu.");
    }

    if (receivedAt && !sentAt) {
      throw new DomainError("Hồ sơ chỉ được ghi nhận tiếp nhận sau khi đã có thời điểm gửi.");
    }

    if (sentAt && receivedAt && receivedAt < sentAt) {
      throw new DomainError("Thời điểm tiếp nhận hồ sơ không được trước thời điểm gửi.");
    }

    if ((receivedByActorId || acknowledgementReference) && !receivedAt) {
      throw new DomainError(
        "Thông tin xác nhận nhận hồ sơ chỉ hợp lệ sau khi có thời điểm tiếp nhận."
      );
    }

    if (failedAt && failedAt < requestedAt) {
      throw new DomainError("Thời điểm lỗi chuyển hồ sơ không được trước thời điểm yêu cầu.");
    }

    if (sentAt && failedAt && failedAt < sentAt) {
      throw new DomainError("Thời điểm lỗi chuyển hồ sơ không được trước thời điểm gửi.");
    }

    if (nextRetryAt && !failedAt) {
      throw new DomainError("Chỉ được hẹn thử gửi lại sau khi đã ghi nhận lỗi chuyển hồ sơ.");
    }

    if (failedAt && nextRetryAt && nextRetryAt < failedAt) {
      throw new DomainError("Thời điểm thử gửi lại không được trước thời điểm lỗi chuyển hồ sơ.");
    }

    if (deadLetteredAt && !failedAt) {
      throw new DomainError("Chỉ được đưa hồ sơ vào hàng lỗi cuối sau khi đã ghi nhận lỗi chuyển hồ sơ.");
    }

    if (failedAt && deadLetteredAt && deadLetteredAt < failedAt) {
      throw new DomainError("Thời điểm đưa hồ sơ vào hàng lỗi cuối không được trước thời điểm lỗi chuyển hồ sơ.");
    }

    const failureReason = normalizeOptional(input.failureReason);

    if (input.status === "failed" && (!failedAt || !failureReason)) {
      throw new DomainError("Hồ sơ lỗi cần có thời điểm lỗi và lý do lỗi.");
    }

    if (input.status === "dead-lettered" && (!failedAt || !failureReason || !deadLetteredAt)) {
      throw new DomainError("Hồ sơ đưa vào hàng lỗi cuối cần có thời điểm lỗi, lý do lỗi và thời điểm kết thúc retry.");
    }

    if (input.status === "dead-lettered" && nextRetryAt) {
      throw new DomainError("Hồ sơ đã vào hàng lỗi cuối không được giữ lịch thử gửi lại.");
    }

    if (deadLetteredAt && input.status !== "dead-lettered") {
      throw new DomainError("Thời điểm đưa vào hàng lỗi cuối chỉ hợp lệ với hồ sơ ở trạng thái dead-lettered.");
    }

    return new RecordTransfer({
      id: normalizeRequired(input.id, "Mã chuyển hồ sơ không được để trống."),
      patientId: normalizeRequired(input.patientId, "Chuyển hồ sơ phải gắn với một bệnh nhân."),
      status: input.status ?? "requested",
      priority: input.priority ?? "routine",
      bundleType: input.bundleType,
      bundleId: normalizeRequired(input.bundleId, "Cần có mã FHIR Bundle dùng để chuyển hồ sơ."),
      sourceOrganizationId,
      recipientOrganizationId,
      consentReference: normalizeRequired(
        input.consentReference,
        "Chuyển hồ sơ liên viện phải gắn với consent hợp lệ."
      ),
      requestedByActorId: normalizeRequired(
        input.requestedByActorId,
        "Cần có người hoặc cơ chế tạo yêu cầu chuyển hồ sơ."
      ),
      reason: normalizeRequired(input.reason, "Cần có lý do chuyển hồ sơ."),
      requestedAt: requestedAt.toISOString(),
      sentAt: sentAt?.toISOString(),
      receivedAt: receivedAt?.toISOString(),
      receivedByActorId,
      acknowledgementReference,
      failedAt: failedAt?.toISOString(),
      failureReason,
      nextRetryAt: nextRetryAt?.toISOString(),
      retryCount,
      deadLetteredAt: deadLetteredAt?.toISOString(),
      note: normalizeOptional(input.note),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: RecordTransferSnapshot): RecordTransfer {
    return new RecordTransfer({
      ...snapshot,
      requestedAt: parseDate(
        snapshot.requestedAt,
        "Thời điểm yêu cầu chuyển hồ sơ không hợp lệ."
      ).toISOString(),
      sentAt: snapshot.sentAt
        ? parseDate(snapshot.sentAt, "Thời điểm gửi hồ sơ không hợp lệ.").toISOString()
        : undefined,
      receivedAt: snapshot.receivedAt
        ? parseDate(snapshot.receivedAt, "Thời điểm tiếp nhận hồ sơ không hợp lệ.").toISOString()
        : undefined,
      receivedByActorId: normalizeOptional(snapshot.receivedByActorId),
      acknowledgementReference: normalizeOptional(snapshot.acknowledgementReference),
      failedAt: snapshot.failedAt
        ? parseDate(snapshot.failedAt, "Thời điểm lỗi chuyển hồ sơ không hợp lệ.").toISOString()
        : undefined,
      failureReason: normalizeOptional(snapshot.failureReason),
      nextRetryAt: snapshot.nextRetryAt
        ? parseDate(snapshot.nextRetryAt, "Thời điểm thử gửi lại hồ sơ không hợp lệ.").toISOString()
        : undefined,
      retryCount: normalizeRetryCount(snapshot.retryCount),
      deadLetteredAt: snapshot.deadLetteredAt
        ? parseDate(snapshot.deadLetteredAt, "Thời điểm đưa hồ sơ vào hàng lỗi cuối không hợp lệ.").toISOString()
        : undefined,
      note: normalizeOptional(snapshot.note)
    });
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
      throw new DomainError("Không thể gửi hồ sơ khi yêu cầu đã hủy, thất bại hoặc đã vào hàng lỗi cuối.");
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
      throw new DomainError("Không thể tiếp nhận hồ sơ khi yêu cầu đã hủy, thất bại hoặc đã vào hàng lỗi cuối.");
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
      throw new DomainError("Chỉ có thể thử gửi lại khi yêu cầu chuyển hồ sơ đang ở trạng thái lỗi.");
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
      throw new DomainError("Chỉ có thể đưa vào hàng lỗi cuối khi yêu cầu chuyển hồ sơ đang ở trạng thái lỗi.");
    }

    if (!this.props.failedAt || !this.props.failureReason) {
      throw new DomainError("Hồ sơ vào hàng lỗi cuối cần có thời điểm lỗi và lý do lỗi trước đó.");
    }

    const deadLetteredAt = input.deadLetteredAt
      ? parseDate(input.deadLetteredAt, "Thời điểm đưa hồ sơ vào hàng lỗi cuối không hợp lệ.")
      : new Date();
    const failedAt = parseDate(this.props.failedAt, "Thời điểm lỗi chuyển hồ sơ không hợp lệ.");

    if (deadLetteredAt < failedAt) {
      throw new DomainError("Thời điểm đưa hồ sơ vào hàng lỗi cuối không được trước thời điểm lỗi chuyển hồ sơ.");
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

function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}

function normalizeRetryCount(value: number): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new DomainError("Số lần thử gửi lại hồ sơ không hợp lệ.");
  }

  return value;
}
