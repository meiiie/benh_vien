import { DomainError } from "../shared/domain-error.js";
import {
  workflowTaskIntents,
  workflowTaskPriorities,
  workflowTaskReferenceResourceTypes,
  workflowTaskStatuses
} from "./workflow-task.types.js";
import type {
  WorkflowTaskIntent,
  WorkflowTaskPriority,
  WorkflowTaskReferenceResourceType,
  WorkflowTaskStatus
} from "./workflow-task.types.js";

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

export function normalizeReferenceResourceType(
  resourceType: WorkflowTaskReferenceResourceType
): WorkflowTaskReferenceResourceType {
  if (!workflowTaskReferenceResourceTypes.has(resourceType)) {
    throw new DomainError("Loại tài nguyên tham chiếu công việc không hợp lệ.");
  }

  return resourceType;
}
