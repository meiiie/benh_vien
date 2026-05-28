import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import { ServiceRequest } from "@benh-vien-so/domain";
import type {
  ServiceRequestCategory,
  ServiceRequestCode,
  ServiceRequestIntent,
  ServiceRequestPriority,
  ServiceRequestRepository,
  ServiceRequestSnapshot,
  ServiceRequestStatus
} from "@benh-vien-so/domain";

type ServiceRequestRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  reason_condition_id: string | null;
  status: ServiceRequestStatus;
  intent: ServiceRequestIntent;
  category: ServiceRequestCategory;
  priority: ServiceRequestPriority;
  code: ServiceRequestCode | string;
  occurrence_at: Date | string | null;
  authored_on: Date | string;
  requester_practitioner_id: string;
  performer_organization_id: string | null;
  patient_instruction: string | null;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresServiceRequestRepository implements ServiceRequestRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<ServiceRequest[]> {
    const result = await this.pool.query<ServiceRequestRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        reason_condition_id,
        status,
        intent,
        category,
        priority,
        code,
        occurrence_at,
        authored_on,
        requester_practitioner_id,
        performer_organization_id,
        patient_instruction,
        note,
        created_at,
        updated_at
      FROM service_requests
      WHERE patient_id = $1
      ORDER BY authored_on DESC`,
      [patientId]
    );

    return result.rows.map(rowToServiceRequest);
  }

  async findById(id: string): Promise<ServiceRequest | undefined> {
    const result = await this.pool.query<ServiceRequestRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        reason_condition_id,
        status,
        intent,
        category,
        priority,
        code,
        occurrence_at,
        authored_on,
        requester_practitioner_id,
        performer_organization_id,
        patient_instruction,
        note,
        created_at,
        updated_at
      FROM service_requests
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToServiceRequest(row) : undefined;
  }

  async save(serviceRequest: ServiceRequest): Promise<void> {
    const snapshot = serviceRequest.toSnapshot();

    await this.pool.query(
      `INSERT INTO service_requests (
        id,
        patient_id,
        encounter_id,
        reason_condition_id,
        status,
        intent,
        category,
        priority,
        code,
        occurrence_at,
        authored_on,
        requester_practitioner_id,
        performer_organization_id,
        patient_instruction,
        note,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        encounter_id = EXCLUDED.encounter_id,
        reason_condition_id = EXCLUDED.reason_condition_id,
        status = EXCLUDED.status,
        intent = EXCLUDED.intent,
        category = EXCLUDED.category,
        priority = EXCLUDED.priority,
        code = EXCLUDED.code,
        occurrence_at = EXCLUDED.occurrence_at,
        authored_on = EXCLUDED.authored_on,
        requester_practitioner_id = EXCLUDED.requester_practitioner_id,
        performer_organization_id = EXCLUDED.performer_organization_id,
        patient_instruction = EXCLUDED.patient_instruction,
        note = EXCLUDED.note,
        updated_at = EXCLUDED.updated_at`,
      [
        snapshot.id,
        snapshot.patientId,
        snapshot.encounterId ?? null,
        snapshot.reasonConditionId ?? null,
        snapshot.status,
        snapshot.intent,
        snapshot.category,
        snapshot.priority,
        JSON.stringify(snapshot.code),
        snapshot.occurrenceAt ?? null,
        snapshot.authoredOn,
        snapshot.requesterPractitionerId,
        snapshot.performerOrganizationId ?? null,
        snapshot.patientInstruction ?? null,
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

export async function seedServiceRequestsIfEmpty(
  repository: ServiceRequestRepository,
  seedServiceRequests: readonly ServiceRequest[]
): Promise<void> {
  const firstPatientId = seedServiceRequests[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const serviceRequests = await repository.findByPatientId(firstPatientId);

  if (serviceRequests.length > 0) {
    return;
  }

  for (const serviceRequest of seedServiceRequests) {
    await repository.save(serviceRequest);
  }
}

function rowToServiceRequest(row: ServiceRequestRow): ServiceRequest {
  const code =
    typeof row.code === "string" ? (JSON.parse(row.code) as ServiceRequestCode) : row.code;

  const snapshot: ServiceRequestSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    reasonConditionId: row.reason_condition_id ?? undefined,
    status: row.status,
    intent: row.intent,
    category: row.category,
    priority: row.priority,
    code,
    occurrenceAt: row.occurrence_at ? toIsoString(row.occurrence_at) : undefined,
    authoredOn: toIsoString(row.authored_on),
    requesterPractitionerId: row.requester_practitioner_id,
    performerOrganizationId: row.performer_organization_id ?? undefined,
    patientInstruction: row.patient_instruction ?? undefined,
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return ServiceRequest.rehydrate(snapshot);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
