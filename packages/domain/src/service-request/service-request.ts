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
      ? parseDate(input.occurrenceAt, "Thời điểm dự kiến thực hiện không hợp lệ.").toISOString()
      : undefined;

    return new ServiceRequest({
      id: normalizeRequired(input.id, "Mã chỉ định dịch vụ không được để trống."),
      patientId: normalizeRequired(input.patientId, "Chỉ định dịch vụ phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      reasonConditionId: normalizeOptional(input.reasonConditionId),
      status: input.status ?? "active",
      intent: input.intent ?? "order",
      category: input.category,
      priority: input.priority ?? "routine",
      code: {
        system: normalizeRequired(input.code.system, "Hệ mã dịch vụ không được để trống."),
        code: normalizeRequired(input.code.code, "Mã dịch vụ không được để trống."),
        display: normalizeRequired(input.code.display, "Tên dịch vụ không được để trống.")
      },
      occurrenceAt,
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
    return new ServiceRequest({
      ...snapshot,
      encounterId: normalizeOptional(snapshot.encounterId),
      reasonConditionId: normalizeOptional(snapshot.reasonConditionId),
      code: {
        system: normalizeRequired(snapshot.code.system, "Hệ mã dịch vụ không được để trống."),
        code: normalizeRequired(snapshot.code.code, "Mã dịch vụ không được để trống."),
        display: normalizeRequired(snapshot.code.display, "Tên dịch vụ không được để trống.")
      },
      occurrenceAt: snapshot.occurrenceAt
        ? parseDate(snapshot.occurrenceAt, "Thời điểm dự kiến thực hiện không hợp lệ.").toISOString()
        : undefined,
      authoredOn: parseDate(
        snapshot.authoredOn,
        "Thời điểm chỉ định dịch vụ không hợp lệ."
      ).toISOString(),
      performerOrganizationId: normalizeOptional(snapshot.performerOrganizationId),
      patientInstruction: normalizeOptional(snapshot.patientInstruction),
      note: normalizeOptional(snapshot.note)
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

function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}
