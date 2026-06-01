import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type {
  MedicationAdministration,
  MedicationAdministrationRepository,
} from "@benh-vien-so/domain";
import { rowToMedicationAdministration } from "./postgres-medication-administration.mapper.js";
import { upsertMedicationAdministration } from "./postgres-medication-administration.persistence.js";
import { selectMedicationAdministrationSql } from "./postgres-medication-administration.sql.js";
import type { MedicationAdministrationRow } from "./postgres-medication-administration.types.js";

export class PostgresMedicationAdministrationRepository
  implements MedicationAdministrationRepository
{
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<MedicationAdministration[]> {
    const result = await this.pool.query<MedicationAdministrationRow>(
      `${selectMedicationAdministrationSql}
      WHERE patient_id = $1
      ORDER BY COALESCE(effective_period->>'start', updated_at::text) DESC`,
      [patientId]
    );

    return result.rows.map(rowToMedicationAdministration);
  }

  async findById(id: string): Promise<MedicationAdministration | undefined> {
    const result = await this.pool.query<MedicationAdministrationRow>(
      `${selectMedicationAdministrationSql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToMedicationAdministration(row) : undefined;
  }

  async save(medicationAdministration: MedicationAdministration): Promise<void> {
    await upsertMedicationAdministration(this.pool, medicationAdministration);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedMedicationAdministrationsIfEmpty(
  repository: MedicationAdministrationRepository,
  seedMedicationAdministrations: readonly MedicationAdministration[]
): Promise<void> {
  const firstPatientId = seedMedicationAdministrations[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const medicationAdministrations = await repository.findByPatientId(firstPatientId);

  if (medicationAdministrations.length > 0) {
    return;
  }

  for (const medicationAdministration of seedMedicationAdministrations) {
    await repository.save(medicationAdministration);
  }
}
