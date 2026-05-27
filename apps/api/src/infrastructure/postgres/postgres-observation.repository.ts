import pg from "pg";
import { Observation } from "@benh-vien-so/domain";
import type {
  ObservationCategory,
  ObservationCode,
  ObservationQuantity,
  ObservationRepository,
  ObservationSnapshot,
  ObservationStatus
} from "@benh-vien-so/domain";

const { Pool } = pg;

type ObservationRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  status: ObservationStatus;
  category: ObservationCategory;
  code: ObservationCode | string;
  effective_at: Date | string;
  value_quantity: ObservationQuantity | string | null;
  value_text: string | null;
  performer_practitioner_id: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresObservationRepository implements ObservationRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 10
    });
  }

  async findByPatientId(patientId: string): Promise<Observation[]> {
    const result = await this.pool.query<ObservationRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        status,
        category,
        code,
        effective_at,
        value_quantity,
        value_text,
        performer_practitioner_id,
        created_at,
        updated_at
      FROM observations
      WHERE patient_id = $1
      ORDER BY effective_at DESC`,
      [patientId]
    );

    return result.rows.map(rowToObservation);
  }

  async findById(id: string): Promise<Observation | undefined> {
    const result = await this.pool.query<ObservationRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        status,
        category,
        code,
        effective_at,
        value_quantity,
        value_text,
        performer_practitioner_id,
        created_at,
        updated_at
      FROM observations
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToObservation(row) : undefined;
  }

  async save(observation: Observation): Promise<void> {
    const snapshot = observation.toSnapshot();

    await this.pool.query(
      `INSERT INTO observations (
        id,
        patient_id,
        encounter_id,
        status,
        category,
        code,
        effective_at,
        value_quantity,
        value_text,
        performer_practitioner_id,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        encounter_id = EXCLUDED.encounter_id,
        status = EXCLUDED.status,
        category = EXCLUDED.category,
        code = EXCLUDED.code,
        effective_at = EXCLUDED.effective_at,
        value_quantity = EXCLUDED.value_quantity,
        value_text = EXCLUDED.value_text,
        performer_practitioner_id = EXCLUDED.performer_practitioner_id,
        updated_at = EXCLUDED.updated_at`,
      [
        snapshot.id,
        snapshot.patientId,
        snapshot.encounterId ?? null,
        snapshot.status,
        snapshot.category,
        JSON.stringify(snapshot.code),
        snapshot.effectiveAt,
        snapshot.valueQuantity ? JSON.stringify(snapshot.valueQuantity) : null,
        snapshot.valueText ?? null,
        snapshot.performerPractitionerId ?? null,
        snapshot.createdAt,
        snapshot.updatedAt
      ]
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedObservationsIfEmpty(
  repository: ObservationRepository,
  seedObservations: readonly Observation[]
): Promise<void> {
  const firstPatientId = seedObservations[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const observations = await repository.findByPatientId(firstPatientId);

  if (observations.length > 0) {
    return;
  }

  for (const observation of seedObservations) {
    await repository.save(observation);
  }
}

function rowToObservation(row: ObservationRow): Observation {
  const code =
    typeof row.code === "string" ? (JSON.parse(row.code) as ObservationCode) : row.code;
  const valueQuantity =
    typeof row.value_quantity === "string"
      ? (JSON.parse(row.value_quantity) as ObservationQuantity)
      : row.value_quantity ?? undefined;

  const snapshot: ObservationSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    status: row.status,
    category: row.category,
    code,
    effectiveAt: toIsoString(row.effective_at),
    valueQuantity,
    valueText: row.value_text ?? undefined,
    performerPractitionerId: row.performer_practitioner_id ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return Observation.rehydrate(snapshot);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
