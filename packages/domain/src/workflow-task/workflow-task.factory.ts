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

export type WorkflowTaskProps = WorkflowTaskSnapshot;

export function buildWorkflowTaskSnapshot(
  input: CreateWorkflowTaskInput,
  now = new Date()
): WorkflowTaskProps {
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

  return {
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
  };
}

export function normalizePersistedWorkflowTaskSnapshot(
  snapshot: WorkflowTaskSnapshot
): WorkflowTaskProps {
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

  return {
    ...snapshot,
    id: normalizeRequired(snapshot.id, "Mã công việc không được để trống."),
    patientId: normalizeRequired(snapshot.patientId, "Công việc phải gắn với bệnh nhân."),
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
  };
}
