import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import { Encounter } from "@benh-vien-so/domain";
import type {
  EncounterClass,
  EncounterRepository,
  EncounterSnapshot,
  EncounterStatus
} from "@benh-vien-so/domain";

type EncounterRow = {
  id: string;
  patient_id: string;
  status: EncounterStatus;
  encounter_class: EncounterClass;
  service_type: string;
  reason_text: string;
  department_id: string | null;
  attending_practitioner_id: string;
  started_at: Date | string;
  ended_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresEncounterRepository implements EncounterRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<Encounter[]> {
    const result = await this.pool.query<EncounterRow>(
      `SELECT
        id,
        patient_id,
        status,
        encounter_class,
        service_type,
        reason_text,
        department_id,
        attending_practitioner_id,
        started_at,
        ended_at,
        created_at,
        updated_at
      FROM encounters
      WHERE patient_id = $1
      ORDER BY started_at DESC`,
      [patientId]
    );

    return result.rows.map(rowToEncounter);
  }

  async findById(id: string): Promise<Encounter | undefined> {
    const result = await this.pool.query<EncounterRow>(
      `SELECT
        id,
        patient_id,
        status,
        encounter_class,
        service_type,
        reason_text,
        department_id,
        attending_practitioner_id,
        started_at,
        ended_at,
        created_at,
        updated_at
      FROM encounters
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToEncounter(row) : undefined;
  }

  async save(encounter: Encounter): Promise<void> {
    const snapshot = encounter.toSnapshot();

    await this.pool.query(
      `INSERT INTO encounters (
        id,
        patient_id,
        status,
        encounter_class,
        service_type,
        reason_text,
        department_id,
        attending_practitioner_id,
        started_at,
        ended_at,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        status = EXCLUDED.status,
        encounter_class = EXCLUDED.encounter_class,
        service_type = EXCLUDED.service_type,
        reason_text = EXCLUDED.reason_text,
        department_id = EXCLUDED.department_id,
        attending_practitioner_id = EXCLUDED.attending_practitioner_id,
        started_at = EXCLUDED.started_at,
        ended_at = EXCLUDED.ended_at,
        updated_at = EXCLUDED.updated_at`,
      [
        snapshot.id,
        snapshot.patientId,
        snapshot.status,
        snapshot.class,
        snapshot.serviceType,
        snapshot.reasonText,
        snapshot.departmentId ?? null,
        snapshot.attendingPractitionerId,
        snapshot.startedAt,
        snapshot.endedAt ?? null,
        snapshot.createdAt,
        snapshot.updatedAt
      ]
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedEncountersIfEmpty(
  repository: EncounterRepository,
  seedEncounters: readonly Encounter[]
): Promise<void> {
  const firstPatientId = seedEncounters[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const encounters = await repository.findByPatientId(firstPatientId);

  if (encounters.length > 0) {
    return;
  }

  for (const encounter of seedEncounters) {
    await repository.save(encounter);
  }
}

function rowToEncounter(row: EncounterRow): Encounter {
  const snapshot: EncounterSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    status: row.status,
    class: row.encounter_class,
    serviceType: row.service_type,
    reasonText: row.reason_text,
    departmentId: row.department_id ?? undefined,
    attendingPractitionerId: row.attending_practitioner_id,
    startedAt: toIsoString(row.started_at),
    endedAt: row.ended_at ? toIsoString(row.ended_at) : undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return Encounter.rehydrate(snapshot);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
