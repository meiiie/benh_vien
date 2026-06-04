import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type { Encounter, EncounterRepository } from "@benh-vien-so/domain";
import { rowToEncounter } from "./postgres-encounter.mapper.js";
import { upsertEncounter } from "./postgres-encounter.persistence.js";
import { selectEncounterSql } from "./postgres-encounter.sql.js";
import type { EncounterRow } from "./postgres-encounter.types.js";

export class PostgresEncounterRepository implements EncounterRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<Encounter[]> {
    const result = await this.pool.query<EncounterRow>(
      `${selectEncounterSql}
      WHERE patient_id = $1
      ORDER BY started_at DESC`,
      [patientId]
    );

    return result.rows.map(rowToEncounter);
  }

  async findById(id: string): Promise<Encounter | undefined> {
    const result = await this.pool.query<EncounterRow>(
      `${selectEncounterSql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToEncounter(row) : undefined;
  }

  async save(encounter: Encounter): Promise<void> {
    await upsertEncounter(this.pool, encounter);
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
