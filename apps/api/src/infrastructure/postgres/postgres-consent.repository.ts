import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type { Consent, ConsentRepository } from "@benh-vien-so/domain";
import { rowToConsent } from "./postgres-consent.mapper.js";
import { upsertConsent } from "./postgres-consent.persistence.js";
import { selectConsentSql } from "./postgres-consent.sql.js";
import type { ConsentRow } from "./postgres-consent.types.js";

export class PostgresConsentRepository implements ConsentRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<Consent[]> {
    const result = await this.pool.query<ConsentRow>(
      `${selectConsentSql}
      WHERE patient_id = $1
      ORDER BY created_at DESC`,
      [patientId]
    );

    return result.rows.map(rowToConsent);
  }

  async findById(id: string): Promise<Consent | undefined> {
    const result = await this.pool.query<ConsentRow>(
      `${selectConsentSql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToConsent(row) : undefined;
  }

  async save(consent: Consent): Promise<void> {
    await upsertConsent(this.pool, consent);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedConsentsIfEmpty(
  repository: ConsentRepository,
  seedConsents: readonly Consent[]
): Promise<void> {
  const firstPatientId = seedConsents[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const consents = await repository.findByPatientId(firstPatientId);

  if (consents.length > 0) {
    return;
  }

  for (const consent of seedConsents) {
    await repository.save(consent);
  }
}
