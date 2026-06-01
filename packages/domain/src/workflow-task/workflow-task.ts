import {
  buildWorkflowTaskSnapshot,
  normalizePersistedWorkflowTaskSnapshot
} from "./workflow-task.factory.js";
import type { WorkflowTaskProps } from "./workflow-task.factory.js";
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
  private constructor(private readonly props: WorkflowTaskProps) {}

  static create(input: CreateWorkflowTaskInput): WorkflowTask {
    return new WorkflowTask(buildWorkflowTaskSnapshot(input));
  }

  static rehydrate(snapshot: WorkflowTaskSnapshot): WorkflowTask {
    return new WorkflowTask(normalizePersistedWorkflowTaskSnapshot(snapshot));
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
