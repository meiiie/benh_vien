import { DomainError } from "../shared/domain-error.js";

export type RecordTransferStatus =
  | "draft"
  | "requested"
  | "ready"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "failed";

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
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateRecordTransferInput = Omit<
  RecordTransferSnapshot,
  "status" | "priority" | "requestedAt" | "sentAt" | "receivedAt" | "createdAt" | "updatedAt"
> & {
  readonly status?: RecordTransferStatus;
  readonly priority?: RecordTransferPriority;
  readonly requestedAt?: string;
  readonly sentAt?: string;
  readonly receivedAt?: string;
};

export class RecordTransfer {
  private constructor(private readonly props: RecordTransferSnapshot) {}

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
      note: normalizeOptional(snapshot.note)
    });
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
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
