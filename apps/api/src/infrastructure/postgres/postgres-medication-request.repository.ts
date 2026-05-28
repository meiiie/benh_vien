import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import { MedicationRequest } from "@benh-vien-so/domain";
import type {
  DosageInstruction,
  MedicationCode,
  MedicationRequestCategory,
  MedicationRequestIntent,
  MedicationRequestPriority,
  MedicationRequestRepository,
  MedicationRequestSnapshot,
  MedicationRequestStatus
} from "@benh-vien-so/domain";

type MedicationRequestRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  reason_condition_id: string | null;
  status: MedicationRequestStatus;
  intent: MedicationRequestIntent;
  category: MedicationRequestCategory;
  priority: MedicationRequestPriority;
  medication_code: MedicationCode | string;
  dosage_instruction: DosageInstruction | string;
  authored_on: Date | string;
  requester_practitioner_id: string;
  expected_supply_duration_days: number | null;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresMedicationRequestRepository implements MedicationRequestRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<MedicationRequest[]> {
    const result = await this.pool.query<MedicationRequestRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        reason_condition_id,
        status,
        intent,
        category,
        priority,
        medication_code,
        dosage_instruction,
        authored_on,
        requester_practitioner_id,
        expected_supply_duration_days,
        note,
        created_at,
        updated_at
      FROM medication_requests
      WHERE patient_id = $1
      ORDER BY authored_on DESC`,
      [patientId]
    );

    return result.rows.map(rowToMedicationRequest);
  }

  async findById(id: string): Promise<MedicationRequest | undefined> {
    const result = await this.pool.query<MedicationRequestRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        reason_condition_id,
        status,
        intent,
        category,
        priority,
        medication_code,
        dosage_instruction,
        authored_on,
        requester_practitioner_id,
        expected_supply_duration_days,
        note,
        created_at,
        updated_at
      FROM medication_requests
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToMedicationRequest(row) : undefined;
  }

  async save(medicationRequest: MedicationRequest): Promise<void> {
    const snapshot = medicationRequest.toSnapshot();

    await this.pool.query(
      `INSERT INTO medication_requests (
        id,
        patient_id,
        encounter_id,
        reason_condition_id,
        status,
        intent,
        category,
        priority,
        medication_code,
        dosage_instruction,
        authored_on,
        requester_practitioner_id,
        expected_supply_duration_days,
        note,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        encounter_id = EXCLUDED.encounter_id,
        reason_condition_id = EXCLUDED.reason_condition_id,
        status = EXCLUDED.status,
        intent = EXCLUDED.intent,
        category = EXCLUDED.category,
        priority = EXCLUDED.priority,
        medication_code = EXCLUDED.medication_code,
        dosage_instruction = EXCLUDED.dosage_instruction,
        authored_on = EXCLUDED.authored_on,
        requester_practitioner_id = EXCLUDED.requester_practitioner_id,
        expected_supply_duration_days = EXCLUDED.expected_supply_duration_days,
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
        JSON.stringify(snapshot.medicationCode),
        JSON.stringify(snapshot.dosageInstruction),
        snapshot.authoredOn,
        snapshot.requesterPractitionerId,
        snapshot.expectedSupplyDurationDays ?? null,
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

export async function seedMedicationRequestsIfEmpty(
  repository: MedicationRequestRepository,
  seedMedicationRequests: readonly MedicationRequest[]
): Promise<void> {
  const firstPatientId = seedMedicationRequests[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const medicationRequests = await repository.findByPatientId(firstPatientId);

  if (medicationRequests.length > 0) {
    return;
  }

  for (const medicationRequest of seedMedicationRequests) {
    await repository.save(medicationRequest);
  }
}

function rowToMedicationRequest(row: MedicationRequestRow): MedicationRequest {
  const medicationCode =
    typeof row.medication_code === "string"
      ? (JSON.parse(row.medication_code) as MedicationCode)
      : row.medication_code;
  const dosageInstruction =
    typeof row.dosage_instruction === "string"
      ? (JSON.parse(row.dosage_instruction) as DosageInstruction)
      : row.dosage_instruction;

  const snapshot: MedicationRequestSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    reasonConditionId: row.reason_condition_id ?? undefined,
    status: row.status,
    intent: row.intent,
    category: row.category,
    priority: row.priority,
    medicationCode,
    dosageInstruction,
    authoredOn: toIsoString(row.authored_on),
    requesterPractitionerId: row.requester_practitioner_id,
    expectedSupplyDurationDays: row.expected_supply_duration_days ?? undefined,
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return MedicationRequest.rehydrate(snapshot);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
