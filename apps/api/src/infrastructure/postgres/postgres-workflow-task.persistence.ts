import type pg from "pg";
import type { WorkflowTask } from "@benh-vien-so/domain";
import { workflowTaskToUpsertValues } from "./postgres-workflow-task.mapper.js";
import { upsertWorkflowTaskSql } from "./postgres-workflow-task.sql.js";

export async function upsertWorkflowTask(
  queryable: Pick<pg.Pool | pg.PoolClient, "query">,
  task: WorkflowTask
): Promise<void> {
  await queryable.query(upsertWorkflowTaskSql, workflowTaskToUpsertValues(task));
}
