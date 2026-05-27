import { DomainError } from "../shared/domain-error.js";

export type WorkflowTaskStatus =
  | "draft"
  | "requested"
  | "received"
  | "accepted"
  | "rejected"
  | "ready"
  | "cancelled"
  | "in-progress"
  | "on-hold"
  | "failed"
  | "completed"
  | "entered-in-error";

export type WorkflowTaskIntent =
  | "unknown"
  | "proposal"
  | "plan"
  | "order"
  | "original-order"
  | "reflex-order"
  | "filler-order"
  | "instance-order"
  | "option";

export type WorkflowTaskPriority = "routine" | "urgent" | "asap" | "stat";

export type WorkflowTaskCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type WorkflowTaskBusinessStatus = {
  readonly code: string;
  readonly display: string;
};

export type WorkflowTaskReferenceResourceType =
  | "ServiceRequest"
  | "Observation"
  | "DiagnosticReport"
  | "ImagingStudy"
  | "DocumentReference";

export type WorkflowTaskReference = {
  readonly resourceType: WorkflowTaskReferenceResourceType;
  readonly id: string;
  readonly label?: string;
};

export type WorkflowTaskExecutionPeriod = {
  readonly start?: string;
  readonly end?: string;
};

export type WorkflowTaskSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
  readonly status: WorkflowTaskStatus;
  readonly intent: WorkflowTaskIntent;
  readonly priority: WorkflowTaskPriority;
  readonly code: WorkflowTaskCode;
  readonly description?: string;
  readonly businessStatus?: WorkflowTaskBusinessStatus;
  readonly requesterPractitionerId?: string;
  readonly ownerOrganizationId?: string;
  readonly ownerPractitionerId?: string;
  readonly authoredOn: string;
  readonly lastModified: string;
  readonly executionPeriod?: WorkflowTaskExecutionPeriod;
  readonly inputReferences: readonly WorkflowTaskReference[];
  readonly outputReferences: readonly WorkflowTaskReference[];
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateWorkflowTaskInput = Omit<
  WorkflowTaskSnapshot,
  "intent" | "priority" | "authoredOn" | "lastModified" | "createdAt" | "updatedAt"
> & {
  readonly intent?: WorkflowTaskIntent;
  readonly priority?: WorkflowTaskPriority;
  readonly authoredOn?: string;
  readonly lastModified?: string;
};

export class WorkflowTask {
  private constructor(private readonly props: WorkflowTaskSnapshot) {}

  static create(input: CreateWorkflowTaskInput): WorkflowTask {
    const now = new Date();
    const authoredOn = input.authoredOn
      ? parseDate(input.authoredOn, "Thời điểm tạo công việc không hợp lệ.")
      : now;
    const lastModified = input.lastModified
      ? parseDate(input.lastModified, "Thời điểm cập nhật công việc không hợp lệ.")
      : now;
    const executionPeriod = normalizeExecutionPeriod(input.executionPeriod);
    const outputReferences = normalizeReferences(input.outputReferences);

    if (input.status === "completed" && outputReferences.length === 0) {
      throw new DomainError(
        "Công việc đã hoàn tất cần gắn tối thiểu một kết quả đầu ra để truy vết y lệnh."
      );
    }

    return new WorkflowTask({
      id: normalizeRequired(input.id, "Mã công việc không được để trống."),
      patientId: normalizeRequired(input.patientId, "Công việc phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      basedOnServiceRequestId: normalizeOptional(input.basedOnServiceRequestId),
      status: input.status,
      intent: input.intent ?? "order",
      priority: input.priority ?? "routine",
      code: normalizeCode(input.code),
      description: normalizeOptional(input.description),
      businessStatus: normalizeBusinessStatus(input.businessStatus),
      requesterPractitionerId: normalizeOptional(input.requesterPractitionerId),
      ownerOrganizationId: normalizeOptional(input.ownerOrganizationId),
      ownerPractitionerId: normalizeOptional(input.ownerPractitionerId),
      authoredOn: authoredOn.toISOString(),
      lastModified: lastModified.toISOString(),
      executionPeriod,
      inputReferences: normalizeReferences(input.inputReferences),
      outputReferences,
      note: normalizeOptional(input.note),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: WorkflowTaskSnapshot): WorkflowTask {
    return new WorkflowTask({
      ...snapshot,
      encounterId: normalizeOptional(snapshot.encounterId),
      basedOnServiceRequestId: normalizeOptional(snapshot.basedOnServiceRequestId),
      code: normalizeCode(snapshot.code),
      description: normalizeOptional(snapshot.description),
      businessStatus: normalizeBusinessStatus(snapshot.businessStatus),
      requesterPractitionerId: normalizeOptional(snapshot.requesterPractitionerId),
      ownerOrganizationId: normalizeOptional(snapshot.ownerOrganizationId),
      ownerPractitionerId: normalizeOptional(snapshot.ownerPractitionerId),
      authoredOn: parseDate(snapshot.authoredOn, "Thời điểm tạo công việc không hợp lệ.").toISOString(),
      lastModified: parseDate(
        snapshot.lastModified,
        "Thời điểm cập nhật công việc không hợp lệ."
      ).toISOString(),
      executionPeriod: normalizeExecutionPeriod(snapshot.executionPeriod),
      inputReferences: normalizeReferences(snapshot.inputReferences),
      outputReferences: normalizeReferences(snapshot.outputReferences),
      note: normalizeOptional(snapshot.note)
    });
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  toSnapshot(): WorkflowTaskSnapshot {
    return {
      ...this.props,
      code: { ...this.props.code },
      businessStatus: this.props.businessStatus ? { ...this.props.businessStatus } : undefined,
      executionPeriod: this.props.executionPeriod ? { ...this.props.executionPeriod } : undefined,
      inputReferences: this.props.inputReferences.map((reference) => ({ ...reference })),
      outputReferences: this.props.outputReferences.map((reference) => ({ ...reference }))
    };
  }
}

function normalizeCode(code: WorkflowTaskCode): WorkflowTaskCode {
  return {
    system: normalizeRequired(code.system, "Hệ mã công việc không được để trống."),
    code: normalizeRequired(code.code, "Mã công việc không được để trống."),
    display: normalizeRequired(code.display, "Tên công việc không được để trống.")
  };
}

function normalizeBusinessStatus(
  businessStatus: WorkflowTaskBusinessStatus | undefined
): WorkflowTaskBusinessStatus | undefined {
  if (!businessStatus) {
    return undefined;
  }

  return {
    code: normalizeRequired(businessStatus.code, "Mã trạng thái nghiệp vụ không được để trống."),
    display: normalizeRequired(
      businessStatus.display,
      "Tên trạng thái nghiệp vụ không được để trống."
    )
  };
}

function normalizeExecutionPeriod(
  period: WorkflowTaskExecutionPeriod | undefined
): WorkflowTaskExecutionPeriod | undefined {
  if (!period?.start && !period?.end) {
    return undefined;
  }

  const start = period.start
    ? parseDate(period.start, "Thời điểm bắt đầu công việc không hợp lệ.").toISOString()
    : undefined;
  const end = period.end
    ? parseDate(period.end, "Thời điểm kết thúc công việc không hợp lệ.").toISOString()
    : undefined;

  if (start && end && new Date(end).getTime() < new Date(start).getTime()) {
    throw new DomainError("Thời điểm kết thúc công việc không được trước thời điểm bắt đầu.");
  }

  return { start, end };
}

function normalizeReferences(
  references: readonly WorkflowTaskReference[] | undefined
): readonly WorkflowTaskReference[] {
  const normalized = new Map<string, WorkflowTaskReference>();

  for (const reference of references ?? []) {
    const resourceType = reference.resourceType;
    const id = normalizeRequired(reference.id, "Tham chiếu công việc không được để trống.");
    normalized.set(`${resourceType}/${id}`, {
      resourceType,
      id,
      label: normalizeOptional(reference.label)
    });
  }

  return [...normalized.values()];
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
