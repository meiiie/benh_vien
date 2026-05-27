import type { WorkflowTask } from "./workflow-task.js";

export interface WorkflowTaskRepository {
  findByPatientId(patientId: string): Promise<WorkflowTask[]>;
  findById(id: string): Promise<WorkflowTask | undefined>;
  save(task: WorkflowTask): Promise<void>;
}
