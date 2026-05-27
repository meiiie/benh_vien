import pg from "pg";
import { Condition } from "@benh-vien-so/domain";
import type {
  ConditionCategory,
  ConditionClinicalStatus,
  ConditionCode,
  ConditionRepository,
  ConditionSeverity,
  ConditionSnapshot,
  ConditionVerificationStatus
} from "@benh-vien-so/domain";

const { Pool } = pg;

type ConditionRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  clinical_status: ConditionClinicalStatus;
  verification_status: ConditionVerificationStatus;
  category: ConditionCategory;
  code: ConditionCode | string;
  severity: ConditionSeverity | null;
  onset_at: Date | string | null;
  recorded_at: Date | string;
  recorder_practitioner_id: string;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresConditionRepository implements ConditionRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 10
    });
  }

  async findByPatientId(patientId: string): Promise<Condition[]> {
    const result = await this.pool.query<ConditionRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        clinical_status,
        verification_status,
        category,
        code,
        severity,
        onset_at,
        recorded_at,
        recorder_practitioner_id,
        note,
        created_at,
        updated_at
      FROM conditions
      WHERE patient_id = $1
      ORDER BY recorded_at DESC`,
      [patientId]
    );

    return result.rows.map(rowToCondition);
  }

  async findById(id: string): Promise<Condition | undefined> {
    const result = await this.pool.query<ConditionRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        clinical_status,
        verification_status,
        category,
        code,
        severity,
        onset_at,
        recorded_at,
        recorder_practitioner_id,
        note,
        created_at,
        updated_at
      FROM conditions
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToCondition(row) : undefined;
  }

  async save(condition: Condition): Promise<void> {
    const snapshot = condition.toSnapshot();

    await this.pool.query(
      `INSERT INTO conditions (
        id,
        patient_id,
        encounter_id,
        clinical_status,
        verification_status,
        category,
        code,
        severity,
        onset_at,
        recorded_at,
        recorder_practitioner_id,
        note,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        encounter_id = EXCLUDED.encounter_id,
        clinical_status = EXCLUDED.clinical_status,
        verification_status = EXCLUDED.verification_status,
        category = EXCLUDED.category,
        code = EXCLUDED.code,
        severity = EXCLUDED.severity,
        onset_at = EXCLUDED.onset_at,
        recorded_at = EXCLUDED.recorded_at,
        recorder_practitioner_id = EXCLUDED.recorder_practitioner_id,
        note = EXCLUDED.note,
        updated_at = EXCLUDED.updated_at`,
      [
        snapshot.id,
        snapshot.patientId,
        snapshot.encounterId ?? null,
        snapshot.clinicalStatus,
        snapshot.verificationStatus,
        snapshot.category,
        JSON.stringify(snapshot.code),
        snapshot.severity ?? null,
        snapshot.onsetAt ?? null,
        snapshot.recordedAt,
        snapshot.recorderPractitionerId,
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

export async function seedConditionsIfEmpty(
  repository: ConditionRepository,
  seedConditions: readonly Condition[]
): Promise<void> {
  const firstPatientId = seedConditions[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const conditions = await repository.findByPatientId(firstPatientId);

  if (conditions.length > 0) {
    return;
  }

  for (const condition of seedConditions) {
    await repository.save(condition);
  }
}

function rowToCondition(row: ConditionRow): Condition {
  const code =
    typeof row.code === "string" ? (JSON.parse(row.code) as ConditionCode) : row.code;

  const snapshot: ConditionSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    clinicalStatus: row.clinical_status,
    verificationStatus: row.verification_status,
    category: row.category,
    code,
    severity: row.severity ?? undefined,
    onsetAt: row.onset_at ? toIsoString(row.onset_at) : undefined,
    recordedAt: toIsoString(row.recorded_at),
    recorderPractitionerId: row.recorder_practitioner_id,
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return Condition.rehydrate(snapshot);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
