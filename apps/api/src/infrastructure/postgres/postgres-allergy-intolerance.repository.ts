import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type {
  AllergyIntolerance,
  AllergyIntoleranceRepository,
} from "@benh-vien-so/domain";
import { rowToAllergyIntolerance } from "./postgres-allergy-intolerance.mapper.js";
import { upsertAllergyIntolerance } from "./postgres-allergy-intolerance.persistence.js";
import { selectAllergyIntoleranceSql } from "./postgres-allergy-intolerance.sql.js";
import type { AllergyIntoleranceRow } from "./postgres-allergy-intolerance.types.js";

export class PostgresAllergyIntoleranceRepository implements AllergyIntoleranceRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<AllergyIntolerance[]> {
    const result = await this.pool.query<AllergyIntoleranceRow>(
      `${selectAllergyIntoleranceSql}
      WHERE patient_id = $1
      ORDER BY recorded_at DESC`,
      [patientId]
    );

    return result.rows.map(rowToAllergyIntolerance);
  }

  async findById(id: string): Promise<AllergyIntolerance | undefined> {
    const result = await this.pool.query<AllergyIntoleranceRow>(
      `${selectAllergyIntoleranceSql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToAllergyIntolerance(row) : undefined;
  }

  async save(allergyIntolerance: AllergyIntolerance): Promise<void> {
    await upsertAllergyIntolerance(this.pool, allergyIntolerance);
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
