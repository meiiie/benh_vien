import { DomainError } from "../shared/domain-error.js";

export type ServiceRequestStatus =
  | "draft"
  | "active"
  | "on-hold"
  | "revoked"
  | "completed"
  | "entered-in-error"
  | "unknown";

export type ServiceRequestIntent =
  | "proposal"
  | "plan"
  | "directive"
  | "order"
  | "original-order"
  | "reflex-order"
  | "filler-order"
  | "instance-order"
  | "option";

export type ServiceRequestCategory =
  | "laboratory"
  | "imaging"
  | "procedure"
  | "consultation"
  | "therapy";

export type ServiceRequestPriority = "routine" | "urgent" | "asap" | "stat";

const serviceRequestStatuses = new Set<ServiceRequestStatus>([
  "draft",
  "active",
  "on-hold",
  "revoked",
  "completed",
  "entered-in-error",
  "unknown"
]);
const serviceRequestIntents = new Set<ServiceRequestIntent>([
  "proposal",
  "plan",
  "directive",
  "order",
  "original-order",
  "reflex-order",
  "filler-order",
  "instance-order",
  "option"
]);
const serviceRequestCategories = new Set<ServiceRequestCategory>([
  "laboratory",
  "imaging",
  "procedure",
  "consultation",
  "therapy"
]);
const serviceRequestPriorities = new Set<ServiceRequestPriority>([
  "routine",
  "urgent",
  "asap",
  "stat"
]);

export type ServiceRequestCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type ServiceRequestSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly reasonConditionId?: string;
  readonly status: ServiceRequestStatus;
  readonly intent: ServiceRequestIntent;
  readonly category: ServiceRequestCategory;
  readonly priority: ServiceRequestPriority;
  readonly code: ServiceRequestCode;
  readonly occurrenceAt?: string;
  readonly authoredOn: string;
  readonly requesterPractitionerId: string;
  readonly performerOrganizationId?: string;
  readonly patientInstruction?: string;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateServiceRequestInput = Omit<
  ServiceRequestSnapshot,
  "status" | "intent" | "priority" | "authoredOn" | "createdAt" | "updatedAt"
> & {
  readonly status?: ServiceRequestStatus;
  readonly intent?: ServiceRequestIntent;
  readonly priority?: ServiceRequestPriority;
  readonly authoredOn?: string;
};

export class ServiceRequest {
  private constructor(private readonly props: ServiceRequestSnapshot) {}

  static order(input: CreateServiceRequestInput): ServiceRequest {
    const now = new Date();
    const authoredOn = input.authoredOn
      ? parseDate(input.authoredOn, "Thời điểm chỉ định dịch vụ không hợp lệ.")
      : now;
    const occurrenceAt = input.occurrenceAt
      ? parseDate(input.occurrenceAt, "Thời điểm dự kiến thực hiện không hợp lệ.")
      : undefined;
    validateTimeline({
      authoredOn,
      occurrenceAt,
      createdAt: now,
      updatedAt: now
    });

    return new ServiceRequest({
      id: normalizeRequired(input.id, "Mã chỉ định dịch vụ không được để trống."),
      patientId: normalizeRequired(input.patientId, "Chỉ định dịch vụ phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      reasonConditionId: normalizeOptional(input.reasonConditionId),
      status: normalizeStatus(input.status ?? "active"),
      intent: normalizeIntent(input.intent ?? "order"),
      category: normalizeCategory(input.category),
      priority: normalizePriority(input.priority ?? "routine"),
      code: normalizeCode(input.code),
      occurrenceAt: occurrenceAt?.toISOString(),
      authoredOn: authoredOn.toISOString(),
      requesterPractitionerId: normalizeRequired(
        input.requesterPractitionerId,
        "Nhân sự chỉ định dịch vụ không được để trống."
      ),
      performerOrganizationId: normalizeOptional(input.performerOrganizationId),
      patientInstruction: normalizeOptional(input.patientInstruction),
      note: normalizeOptional(input.note),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: ServiceRequestSnapshot): ServiceRequest {
    const occurrenceAt = snapshot.occurrenceAt
      ? parseDate(snapshot.occurrenceAt, "Thời điểm dự kiến thực hiện không hợp lệ.")
      : undefined;
    const authoredOn = parseDate(
      snapshot.authoredOn,
      "Thời điểm chỉ định dịch vụ không hợp lệ."
    );
    const createdAt = parseDate(
      snapshot.createdAt,
      "Thời điểm tạo chỉ định dịch vụ không hợp lệ."
    );
    const updatedAt = parseDate(
      snapshot.updatedAt,
      "Thời điểm cập nhật chỉ định dịch vụ không hợp lệ."
    );
    validateTimeline({ authoredOn, occurrenceAt, createdAt, updatedAt });

    return new ServiceRequest({
      ...snapshot,
      id: normalizeRequired(snapshot.id, "Mã chỉ định dịch vụ không được để trống."),
      patientId: normalizeRequired(snapshot.patientId, "Chỉ định dịch vụ phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(snapshot.encounterId),
      reasonConditionId: normalizeOptional(snapshot.reasonConditionId),
      status: normalizeStatus(snapshot.status),
      intent: normalizeIntent(snapshot.intent),
      category: normalizeCategory(snapshot.category),
      priority: normalizePriority(snapshot.priority),
      code: normalizeCode(snapshot.code),
      occurrenceAt: occurrenceAt?.toISOString(),
      authoredOn: authoredOn.toISOString(),
      requesterPractitionerId: normalizeRequired(
        snapshot.requesterPractitionerId,
        "Nhân sự chỉ định dịch vụ không được để trống."
      ),
      performerOrganizationId: normalizeOptional(snapshot.performerOrganizationId),
      patientInstruction: normalizeOptional(snapshot.patientInstruction),
      note: normalizeOptional(snapshot.note),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString()
    });
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  toSnapshot(): ServiceRequestSnapshot {
    return {
      ...this.props,
      code: { ...this.props.code }
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

function normalizeCode(value: ServiceRequestCode): ServiceRequestCode {
  return {
    system: normalizeRequired(value.system, "Hệ mã dịch vụ không được để trống."),
    code: normalizeRequired(value.code, "Mã dịch vụ không được để trống."),
    display: normalizeRequired(value.display, "Tên dịch vụ không được để trống.")
  };
}

function normalizeStatus(value: ServiceRequestStatus): ServiceRequestStatus {
  if (!serviceRequestStatuses.has(value)) {
    throw new DomainError("Trạng thái chỉ định dịch vụ không hợp lệ.");
  }

  return value;
}

function normalizeIntent(value: ServiceRequestIntent): ServiceRequestIntent {
  if (!serviceRequestIntents.has(value)) {
    throw new DomainError("Mục đích chỉ định dịch vụ không hợp lệ.");
  }

  return value;
}

function normalizeCategory(value: ServiceRequestCategory): ServiceRequestCategory {
  if (!serviceRequestCategories.has(value)) {
    throw new DomainError("Nhóm chỉ định dịch vụ không hợp lệ.");
  }

  return value;
}

function normalizePriority(value: ServiceRequestPriority): ServiceRequestPriority {
  if (!serviceRequestPriorities.has(value)) {
    throw new DomainError("Mức ưu tiên chỉ định dịch vụ không hợp lệ.");
  }

  return value;
}

function validateTimeline(input: {
  readonly authoredOn: Date;
  readonly occurrenceAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}): void {
  if (input.occurrenceAt && input.occurrenceAt < input.authoredOn) {
    throw new DomainError("Thời điểm dự kiến thực hiện không được trước thời điểm chỉ định dịch vụ.");
  }

  if (input.updatedAt < input.createdAt) {
    throw new DomainError("Thời điểm cập nhật chỉ định dịch vụ không được trước thời điểm tạo chỉ định.");
  }
}

function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}
