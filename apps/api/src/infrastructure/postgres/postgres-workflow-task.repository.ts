import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import { WorkflowTask } from "@benh-vien-so/domain";
import type {
  WorkflowTaskBusinessStatus,
  WorkflowTaskCode,
  WorkflowTaskExecutionPeriod,
  WorkflowTaskIntent,
  WorkflowTaskPriority,
  WorkflowTaskReference,
  WorkflowTaskRepository,
  WorkflowTaskSnapshot,
  WorkflowTaskStatus
} from "@benh-vien-so/domain";

type WorkflowTaskRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  based_on_service_request_id: string | null;
  status: WorkflowTaskStatus;
  intent: WorkflowTaskIntent;
  priority: WorkflowTaskPriority;
  code: WorkflowTaskCode | string;
  description: string | null;
  business_status: WorkflowTaskBusinessStatus | string | null;
  requester_practitioner_id: string | null;
  owner_organization_id: string | null;
  owner_practitioner_id: string | null;
  authored_on: Date | string;
  last_modified: Date | string;
  execution_period: WorkflowTaskExecutionPeriod | string | null;
  input_references: WorkflowTaskReference[] | string;
  output_references: WorkflowTaskReference[] | string;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresWorkflowTaskRepository implements WorkflowTaskRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<WorkflowTask[]> {
    const result = await this.pool.query<WorkflowTaskRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        based_on_service_request_id,
        status,
        intent,
        priority,
        code,
        description,
        business_status,
        requester_practitioner_id,
        owner_organization_id,
        owner_practitioner_id,
        authored_on,
        last_modified,
        execution_period,
        input_references,
        output_references,
        note,
        created_at,
        updated_at
      FROM workflow_tasks
      WHERE patient_id = $1
      ORDER BY last_modified DESC`,
      [patientId]
    );

    return result.rows.map(rowToWorkflowTask);
  }

  async findById(id: string): Promise<WorkflowTask | undefined> {
    const result = await this.pool.query<WorkflowTaskRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        based_on_service_request_id,
        status,
        intent,
        priority,
        code,
        description,
        business_status,
        requester_practitioner_id,
        owner_organization_id,
        owner_practitioner_id,
        authored_on,
        last_modified,
        execution_period,
        input_references,
        output_references,
        note,
        created_at,
        updated_at
      FROM workflow_tasks
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToWorkflowTask(row) : undefined;
  }

  async save(task: WorkflowTask): Promise<void> {
    const snapshot = task.toSnapshot();

    await this.pool.query(
      `INSERT INTO workflow_tasks (
        id,
        patient_id,
        encounter_id,
        based_on_service_request_id,
        status,
        intent,
        priority,
        code,
        description,
        business_status,
        requester_practitioner_id,
        owner_organization_id,
        owner_practitioner_id,
        authored_on,
        last_modified,
        execution_period,
        input_references,
        output_references,
        note,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10::jsonb, $11, $12, $13, $14, $15, $16::jsonb, $17::jsonb, $18::jsonb, $19, $20, $21)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        encounter_id = EXCLUDED.encounter_id,
        based_on_service_request_id = EXCLUDED.based_on_service_request_id,
        status = EXCLUDED.status,
        intent = EXCLUDED.intent,
        priority = EXCLUDED.priority,
        code = EXCLUDED.code,
        description = EXCLUDED.description,
        business_status = EXCLUDED.business_status,
        requester_practitioner_id = EXCLUDED.requester_practitioner_id,
        owner_organization_id = EXCLUDED.owner_organization_id,
        owner_practitioner_id = EXCLUDED.owner_practitioner_id,
        authored_on = EXCLUDED.authored_on,
        last_modified = EXCLUDED.last_modified,
        execution_period = EXCLUDED.execution_period,
        input_references = EXCLUDED.input_references,
        output_references = EXCLUDED.output_references,
        note = EXCLUDED.note,
        updated_at = EXCLUDED.updated_at`,
      [
        snapshot.id,
        snapshot.patientId,
        snapshot.encounterId ?? null,
        snapshot.basedOnServiceRequestId ?? null,
        snapshot.status,
        snapshot.intent,
        snapshot.priority,
        JSON.stringify(snapshot.code),
        snapshot.description ?? null,
        snapshot.businessStatus ? JSON.stringify(snapshot.businessStatus) : null,
        snapshot.requesterPractitionerId ?? null,
        snapshot.ownerOrganizationId ?? null,
        snapshot.ownerPractitionerId ?? null,
        snapshot.authoredOn,
        snapshot.lastModified,
        snapshot.executionPeriod ? JSON.stringify(snapshot.executionPeriod) : null,
        JSON.stringify(snapshot.inputReferences),
        JSON.stringify(snapshot.outputReferences),
        snapshot.note ?? null,
        snapshot.createdAt,
        snapshot.updatedAt
      ]
    );
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

function rowToWorkflowTask(row: WorkflowTaskRow): WorkflowTask {
  const snapshot: WorkflowTaskSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    basedOnServiceRequestId: row.based_on_service_request_id ?? undefined,
    status: row.status,
    intent: row.intent,
    priority: row.priority,
    code: parseJson<WorkflowTaskCode>(row.code),
    description: row.description ?? undefined,
    businessStatus: row.business_status
      ? parseJson<WorkflowTaskBusinessStatus>(row.business_status)
      : undefined,
    requesterPractitionerId: row.requester_practitioner_id ?? undefined,
    ownerOrganizationId: row.owner_organization_id ?? undefined,
    ownerPractitionerId: row.owner_practitioner_id ?? undefined,
    authoredOn: toIsoString(row.authored_on),
    lastModified: toIsoString(row.last_modified),
    executionPeriod: row.execution_period
      ? parseJson<WorkflowTaskExecutionPeriod>(row.execution_period)
      : undefined,
    inputReferences: parseJson<WorkflowTaskReference[]>(row.input_references),
    outputReferences: parseJson<WorkflowTaskReference[]>(row.output_references),
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return WorkflowTask.rehydrate(snapshot);
}

function parseJson<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
