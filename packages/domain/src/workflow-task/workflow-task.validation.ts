import { DomainError } from "../shared/domain-error.js";
import {
  workflowTaskIntents,
  workflowTaskPriorities,
  workflowTaskReferenceResourceTypes,
  workflowTaskStatuses
} from "./workflow-task.types.js";
import type {
  WorkflowTaskBusinessStatus,
  WorkflowTaskCode,
  WorkflowTaskExecutionPeriod,
  WorkflowTaskIntent,
  WorkflowTaskPriority,
  WorkflowTaskReference,
  WorkflowTaskReferenceResourceType,
  WorkflowTaskStatus
} from "./workflow-task.types.js";

export function normalizeCode(code: WorkflowTaskCode): WorkflowTaskCode {
  return {
    system: normalizeRequired(code.system, "Hệ mã công việc không được để trống."),
    code: normalizeRequired(code.code, "Mã công việc không được để trống."),
    display: normalizeRequired(code.display, "Tên công việc không được để trống.")
  };
}

export function normalizeBusinessStatus(
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

export function normalizeExecutionPeriod(
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

export function normalizeReferences(
  references: readonly WorkflowTaskReference[] | undefined
): readonly WorkflowTaskReference[] {
  const normalized = new Map<string, WorkflowTaskReference>();

  for (const reference of references ?? []) {
    const resourceType = normalizeReferenceResourceType(reference.resourceType);
    const id = normalizeRequired(reference.id, "Tham chiếu công việc không được để trống.");
    normalized.set(`${resourceType}/${id}`, {
      resourceType,
      id,
      label: normalizeOptional(reference.label)
    });
  }

  return [...normalized.values()];
}

export function validateTimeline(input: {
  readonly authoredOn: Date;
  readonly lastModified: Date;
  readonly executionPeriod?: WorkflowTaskExecutionPeriod;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}): void {
  if (input.lastModified < input.authoredOn) {
    throw new DomainError("Thời điểm cập nhật công việc không được trước thời điểm tạo công việc.");
  }

  if (input.executionPeriod?.start && new Date(input.executionPeriod.start) < input.authoredOn) {
    throw new DomainError("Thời điểm bắt đầu công việc không được trước thời điểm tạo công việc.");
  }

  if (input.updatedAt < input.createdAt) {
    throw new DomainError("Thời điểm cập nhật bản ghi công việc không được trước thời điểm tạo bản ghi.");
  }
}

export function assertCompletedTaskHasOutputReferences(
  status: WorkflowTaskStatus,
  outputReferences: readonly WorkflowTaskReference[]
): void {
  if (status === "completed" && outputReferences.length === 0) {
    throw new DomainError(
      "Công việc đã hoàn tất cần gắn tối thiểu một kết quả đầu ra để truy vết y lệnh."
    );
  }
}

export function normalizeStatus(value: WorkflowTaskStatus): WorkflowTaskStatus {
  if (!workflowTaskStatuses.has(value)) {
    throw new DomainError("Trạng thái công việc không hợp lệ.");
  }

  return value;
}

export function normalizeIntent(value: WorkflowTaskIntent): WorkflowTaskIntent {
  if (!workflowTaskIntents.has(value)) {
    throw new DomainError("Mục đích công việc không hợp lệ.");
  }

  return value;
}

export function normalizePriority(value: WorkflowTaskPriority): WorkflowTaskPriority {
  if (!workflowTaskPriorities.has(value)) {
    throw new DomainError("Mức ưu tiên công việc không hợp lệ.");
  }

  return value;
}

export function normalizeRequired(value: string, message: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw new DomainError(message);
  }

  return normalized;
}

export function normalizeOptional(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}

export function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}

function normalizeReferenceResourceType(resourceType: WorkflowTaskReferenceResourceType): WorkflowTaskReferenceResourceType {
  if (!workflowTaskReferenceResourceTypes.has(resourceType)) {
    throw new DomainError("Loại tài nguyên tham chiếu công việc không hợp lệ.");
  }

  return resourceType;
}
