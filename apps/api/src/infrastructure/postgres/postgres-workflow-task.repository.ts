import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type { WorkflowTask, WorkflowTaskRepository } from "@benh-vien-so/domain";
import { rowToWorkflowTask } from "./postgres-workflow-task.mapper.js";
import { upsertWorkflowTask } from "./postgres-workflow-task.persistence.js";
import { selectWorkflowTaskSql } from "./postgres-workflow-task.sql.js";
import type { WorkflowTaskRow } from "./postgres-workflow-task.types.js";

export class PostgresWorkflowTaskRepository implements WorkflowTaskRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<WorkflowTask[]> {
    const result = await this.pool.query<WorkflowTaskRow>(
      `${selectWorkflowTaskSql}
      WHERE patient_id = $1
      ORDER BY last_modified DESC`,
      [patientId]
    );

    return result.rows.map(rowToWorkflowTask);
  }

  async findById(id: string): Promise<WorkflowTask | undefined> {
    const result = await this.pool.query<WorkflowTaskRow>(
      `${selectWorkflowTaskSql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToWorkflowTask(row) : undefined;
  }

  async save(task: WorkflowTask): Promise<void> {
    await upsertWorkflowTask(this.pool, task);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedWorkflowTasksIfEmpty(
  repository: WorkflowTaskRepository,
  seedTasks: readonly WorkflowTask[]
): Promise<void> {
  const firstPatientId = seedTasks[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const tasks = await repository.findByPatientId(firstPatientId);

  if (tasks.length > 0) {
    return;
  }

  for (const task of seedTasks) {
    await repository.save(task);
  }
}
