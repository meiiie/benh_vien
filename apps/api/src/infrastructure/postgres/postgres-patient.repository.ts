import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type {
  Patient,
  PatientRepository,
} from "@benh-vien-so/domain";
import { throwPatientIdentifierConflictIfNeeded } from "./postgres-patient-conflict.js";
import { rowToPatient } from "./postgres-patient.mapper.js";
import { upsertPatientSnapshot } from "./postgres-patient.persistence.js";
import { selectPatientByIdentifierSql, selectPatientSql } from "./postgres-patient.sql.js";
import type { PatientRow } from "./postgres-patient.types.js";

export class PostgresPatientRepository implements PatientRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findAll(): Promise<Patient[]> {
    const result = await this.pool.query<PatientRow>(
      `${selectPatientSql}
      ORDER BY created_at DESC`
    );

    return result.rows.map(rowToPatient);
  }

  async findById(id: string): Promise<Patient | undefined> {
    const result = await this.pool.query<PatientRow>(
      `${selectPatientSql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToPatient(row) : undefined;
  }

  async findByIdentifier(identifier: {
    readonly system: string;
    readonly value: string;
  }): Promise<Patient | undefined> {
    const result = await this.pool.query<PatientRow>(
      selectPatientByIdentifierSql,
      [identifier.system, identifier.value]
    );

    const row = result.rows[0];
    return row ? rowToPatient(row) : undefined;
  }

  async save(patient: Patient): Promise<void> {
    const snapshot = patient.toSnapshot();
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      await upsertPatientSnapshot(client, snapshot);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      await throwPatientIdentifierConflictIfNeeded(error, this, snapshot);
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedPatientsIfEmpty(
  repository: PatientRepository,
  seedPatients: readonly Patient[]
): Promise<void> {
  const patients = await repository.findAll();

  if (patients.length > 0) {
    return;
  }

  for (const patient of seedPatients) {
    await repository.save(patient);
  }
}
