import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type { Observation, ObservationRepository } from "@benh-vien-so/domain";
import { rowToObservation } from "./postgres-observation.mapper.js";
import { upsertObservation } from "./postgres-observation.persistence.js";
import { selectObservationSql } from "./postgres-observation.sql.js";
import type { ObservationRow } from "./postgres-observation.types.js";

export class PostgresObservationRepository implements ObservationRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<Observation[]> {
    const result = await this.pool.query<ObservationRow>(
      `${selectObservationSql}
      WHERE patient_id = $1
      ORDER BY effective_at DESC`,
      [patientId]
    );

    return result.rows.map(rowToObservation);
  }

  async findById(id: string): Promise<Observation | undefined> {
    const result = await this.pool.query<ObservationRow>(
      `${selectObservationSql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToObservation(row) : undefined;
  }

  async save(observation: Observation): Promise<void> {
    await upsertObservation(this.pool, observation);
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
