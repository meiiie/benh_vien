import {
  assertCompletedTaskHasOutputReferences,
  normalizeBusinessStatus,
  normalizeCode,
  normalizeExecutionPeriod,
  normalizeIntent,
  normalizeOptional,
  normalizePriority,
  normalizeReferences,
  normalizeRequired,
  normalizeStatus,
  parseDate,
  validateTimeline
} from "./workflow-task.validation.js";
import type {
  CreateWorkflowTaskInput,
  WorkflowTaskSnapshot
} from "./workflow-task.types.js";

export type {
  CreateWorkflowTaskInput,
  WorkflowTaskBusinessStatus,
  WorkflowTaskCode,
  WorkflowTaskExecutionPeriod,
  WorkflowTaskIntent,
  WorkflowTaskPriority,
  WorkflowTaskReference,
  WorkflowTaskReferenceResourceType,
  WorkflowTaskSnapshot,
  WorkflowTaskStatus
} from "./workflow-task.types.js";

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
    validateTimeline({
      authoredOn,
      lastModified,
      executionPeriod,
      createdAt: now,
      updatedAt: now
    });

    assertCompletedTaskHasOutputReferences(input.status, outputReferences);

    return new WorkflowTask({
      id: normalizeRequired(input.id, "Mã công việc không được để trống."),
      patientId: normalizeRequired(input.patientId, "Công việc phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      basedOnServiceRequestId: normalizeOptional(input.basedOnServiceRequestId),
      status: normalizeStatus(input.status),
      intent: normalizeIntent(input.intent ?? "order"),
      priority: normalizePriority(input.priority ?? "routine"),
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
    const authoredOn = parseDate(
      snapshot.authoredOn,
      "Thời điểm tạo công việc không hợp lệ."
    );
    const lastModified = parseDate(
      snapshot.lastModified,
      "Thời điểm cập nhật công việc không hợp lệ."
    );
    const createdAt = parseDate(
      snapshot.createdAt,
      "Thời điểm tạo bản ghi công việc không hợp lệ."
    );
    const updatedAt = parseDate(
      snapshot.updatedAt,
      "Thời điểm cập nhật bản ghi công việc không hợp lệ."
    );
    const executionPeriod = normalizeExecutionPeriod(snapshot.executionPeriod);
    const outputReferences = normalizeReferences(snapshot.outputReferences);

    validateTimeline({ authoredOn, lastModified, executionPeriod, createdAt, updatedAt });

    assertCompletedTaskHasOutputReferences(snapshot.status, outputReferences);

    return new WorkflowTask({
      ...snapshot,
      encounterId: normalizeOptional(snapshot.encounterId),
      basedOnServiceRequestId: normalizeOptional(snapshot.basedOnServiceRequestId),
      status: normalizeStatus(snapshot.status),
      intent: normalizeIntent(snapshot.intent),
      priority: normalizePriority(snapshot.priority),
      code: normalizeCode(snapshot.code),
      description: normalizeOptional(snapshot.description),
      businessStatus: normalizeBusinessStatus(snapshot.businessStatus),
      requesterPractitionerId: normalizeOptional(snapshot.requesterPractitionerId),
      ownerOrganizationId: normalizeOptional(snapshot.ownerOrganizationId),
      ownerPractitionerId: normalizeOptional(snapshot.ownerPractitionerId),
      authoredOn: authoredOn.toISOString(),
      lastModified: lastModified.toISOString(),
      executionPeriod,
      inputReferences: normalizeReferences(snapshot.inputReferences),
      outputReferences,
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
