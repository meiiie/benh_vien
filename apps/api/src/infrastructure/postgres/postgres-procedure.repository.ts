import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type { Procedure, ProcedureRepository } from "@benh-vien-so/domain";
import { rowToProcedure } from "./postgres-procedure.mapper.js";
import { upsertProcedure } from "./postgres-procedure.persistence.js";
import { selectProcedureSql } from "./postgres-procedure.sql.js";
import type { ProcedureRow } from "./postgres-procedure.types.js";

export class PostgresProcedureRepository implements ProcedureRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<Procedure[]> {
    const result = await this.pool.query<ProcedureRow>(
      `${selectProcedureSql}
      WHERE patient_id = $1
      ORDER BY COALESCE(performed_period->>'start', updated_at::text) DESC`,
      [patientId]
    );

    return result.rows.map(rowToProcedure);
  }

  async findById(id: string): Promise<Procedure | undefined> {
    const result = await this.pool.query<ProcedureRow>(
      `${selectProcedureSql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToProcedure(row) : undefined;
  }

  async save(procedure: Procedure): Promise<void> {
    await upsertProcedure(this.pool, procedure);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedProceduresIfEmpty(
  repository: ProcedureRepository,
  seedProcedures: readonly Procedure[]
): Promise<void> {
  const firstPatientId = seedProcedures[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const procedures = await repository.findByPatientId(firstPatientId);

  if (procedures.length > 0) {
    return;
  }

  for (const procedure of seedProcedures) {
    await repository.save(procedure);
  }
}
