import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type { MedicationDispense, MedicationDispenseRepository } from "@benh-vien-so/domain";
import { rowToMedicationDispense } from "./postgres-medication-dispense.mapper.js";
import { upsertMedicationDispense } from "./postgres-medication-dispense.persistence.js";
import { selectMedicationDispenseSql } from "./postgres-medication-dispense.sql.js";
import type { MedicationDispenseRow } from "./postgres-medication-dispense.types.js";

export class PostgresMedicationDispenseRepository
  implements MedicationDispenseRepository
{
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<MedicationDispense[]> {
    const result = await this.pool.query<MedicationDispenseRow>(
      `${selectMedicationDispenseSql}
      WHERE patient_id = $1
      ORDER BY COALESCE(when_handed_over, when_prepared, updated_at) DESC`,
      [patientId]
    );

    return result.rows.map(rowToMedicationDispense);
  }

  async findById(id: string): Promise<MedicationDispense | undefined> {
    const result = await this.pool.query<MedicationDispenseRow>(
      `${selectMedicationDispenseSql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToMedicationDispense(row) : undefined;
  }

  async save(medicationDispense: MedicationDispense): Promise<void> {
    await upsertMedicationDispense(this.pool, medicationDispense);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedMedicationDispensesIfEmpty(
  repository: MedicationDispenseRepository,
  seedMedicationDispenses: readonly MedicationDispense[]
): Promise<void> {
  const firstPatientId = seedMedicationDispenses[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const medicationDispenses = await repository.findByPatientId(firstPatientId);

  if (medicationDispenses.length > 0) {
    return;
  }

  for (const medicationDispense of seedMedicationDispenses) {
    await repository.save(medicationDispense);
  }
}
