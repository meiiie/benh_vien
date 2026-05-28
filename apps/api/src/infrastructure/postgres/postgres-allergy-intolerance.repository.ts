import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import { AllergyIntolerance } from "@benh-vien-so/domain";
import type {
  AllergyCategory,
  AllergyClinicalStatus,
  AllergyCode,
  AllergyCriticality,
  AllergyIntoleranceRepository,
  AllergyIntoleranceSnapshot,
  AllergyReaction,
  AllergyType,
  AllergyVerificationStatus
} from "@benh-vien-so/domain";

type AllergyIntoleranceRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  clinical_status: AllergyClinicalStatus;
  verification_status: AllergyVerificationStatus;
  type: AllergyType;
  category: AllergyCategory;
  criticality: AllergyCriticality | null;
  code: AllergyCode | string;
  reaction: AllergyReaction | string | null;
  recorded_at: Date | string;
  recorder_practitioner_id: string;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresAllergyIntoleranceRepository implements AllergyIntoleranceRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<AllergyIntolerance[]> {
    const result = await this.pool.query<AllergyIntoleranceRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        clinical_status,
        verification_status,
        type,
        category,
        criticality,
        code,
        reaction,
        recorded_at,
        recorder_practitioner_id,
        note,
        created_at,
        updated_at
      FROM allergy_intolerances
      WHERE patient_id = $1
      ORDER BY recorded_at DESC`,
      [patientId]
    );

    return result.rows.map(rowToAllergyIntolerance);
  }

  async findById(id: string): Promise<AllergyIntolerance | undefined> {
    const result = await this.pool.query<AllergyIntoleranceRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        clinical_status,
        verification_status,
        type,
        category,
        criticality,
        code,
        reaction,
        recorded_at,
        recorder_practitioner_id,
        note,
        created_at,
        updated_at
      FROM allergy_intolerances
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToAllergyIntolerance(row) : undefined;
  }

  async save(allergyIntolerance: AllergyIntolerance): Promise<void> {
    const snapshot = allergyIntolerance.toSnapshot();

    await this.pool.query(
      `INSERT INTO allergy_intolerances (
        id,
        patient_id,
        encounter_id,
        clinical_status,
        verification_status,
        type,
        category,
        criticality,
        code,
        reaction,
        recorded_at,
        recorder_practitioner_id,
        note,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        encounter_id = EXCLUDED.encounter_id,
        clinical_status = EXCLUDED.clinical_status,
        verification_status = EXCLUDED.verification_status,
        type = EXCLUDED.type,
        category = EXCLUDED.category,
        criticality = EXCLUDED.criticality,
        code = EXCLUDED.code,
        reaction = EXCLUDED.reaction,
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
        snapshot.type,
        snapshot.category,
        snapshot.criticality ?? null,
        JSON.stringify(snapshot.code),
        snapshot.reaction ? JSON.stringify(snapshot.reaction) : null,
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

export async function seedAllergyIntolerancesIfEmpty(
  repository: AllergyIntoleranceRepository,
  seedAllergyIntolerances: readonly AllergyIntolerance[]
): Promise<void> {
  const firstPatientId = seedAllergyIntolerances[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const allergyIntolerances = await repository.findByPatientId(firstPatientId);

  if (allergyIntolerances.length > 0) {
    return;
  }

  for (const allergyIntolerance of seedAllergyIntolerances) {
    await repository.save(allergyIntolerance);
  }
}

function rowToAllergyIntolerance(row: AllergyIntoleranceRow): AllergyIntolerance {
  const code = typeof row.code === "string" ? (JSON.parse(row.code) as AllergyCode) : row.code;
  const reaction =
    typeof row.reaction === "string"
      ? (JSON.parse(row.reaction) as AllergyReaction)
      : row.reaction ?? undefined;

  const snapshot: AllergyIntoleranceSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    clinicalStatus: row.clinical_status,
    verificationStatus: row.verification_status,
    type: row.type,
    category: row.category,
    criticality: row.criticality ?? undefined,
    code,
    reaction,
    recordedAt: toIsoString(row.recorded_at),
    recorderPractitionerId: row.recorder_practitioner_id,
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return AllergyIntolerance.rehydrate(snapshot);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
