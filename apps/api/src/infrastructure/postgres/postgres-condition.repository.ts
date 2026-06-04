import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type {
  Condition,
  ConditionRepository,
} from "@benh-vien-so/domain";
import { rowToCondition } from "./postgres-condition.mapper.js";
import { upsertCondition } from "./postgres-condition.persistence.js";
import { selectConditionSql } from "./postgres-condition.sql.js";
import type { ConditionRow } from "./postgres-condition.types.js";

export class PostgresConditionRepository implements ConditionRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<Condition[]> {
    const result = await this.pool.query<ConditionRow>(
      `${selectConditionSql}
      WHERE patient_id = $1
      ORDER BY recorded_at DESC`,
      [patientId]
    );

    return result.rows.map(rowToCondition);
  }

  async findById(id: string): Promise<Condition | undefined> {
    const result = await this.pool.query<ConditionRow>(
      `${selectConditionSql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToCondition(row) : undefined;
  }

  async save(condition: Condition): Promise<void> {
    await upsertCondition(this.pool, condition);
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
