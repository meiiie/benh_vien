import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import { buildAuditIntegrityReport, sealAuditEvent } from "@benh-vien-so/domain";
import type { AuditEvent, AuditEventRepository } from "@benh-vien-so/domain";
import { rowToAuditEvent } from "./postgres-audit-event.mapper.js";
import {
  findLatestAuditIntegrityHash,
  insertAuditEvent,
  lockAuditIntegrityScope,
  updateAuditEventIntegrity
} from "./postgres-audit-event.persistence.js";
import { selectAuditEventSql } from "./postgres-audit-event.sql.js";
import type { AuditEventRow } from "./postgres-audit-event.types.js";

export class PostgresAuditEventRepository implements AuditEventRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findRecent(limit = 50): Promise<AuditEvent[]> {
    const result = await this.pool.query<AuditEventRow>(
      `${selectAuditEventSql}
      ORDER BY occurred_at DESC, id DESC
      LIMIT $1`,
      [limit]
    );

    return result.rows.map(rowToAuditEvent);
  }

  async findByPatientId(patientId: string, limit = 50): Promise<AuditEvent[]> {
    const result = await this.pool.query<AuditEventRow>(
      `${selectAuditEventSql}
      WHERE patient_id = $1
      ORDER BY occurred_at DESC
      LIMIT $2`,
      [patientId, limit]
    );

    return result.rows.map(rowToAuditEvent);
  }

  async verifyPatientIntegrity(patientId: string) {
    const result = await this.pool.query<AuditEventRow>(
      `${selectAuditEventSql}
      WHERE patient_id = $1
      ORDER BY id ASC`,
      [patientId]
    );

    return buildAuditIntegrityReport(patientId, result.rows.map(rowToAuditEvent));
  }

  async save(event: AuditEvent): Promise<AuditEvent> {
    const client = await this.pool.connect();
    const snapshot = event.toSnapshot();

    try {
      await client.query("BEGIN");
      await lockAuditIntegrityScope(client, snapshot.patientId);

      const latestHash = await findLatestAuditIntegrityHash(client, snapshot.patientId);
      const insertedEvent = await insertAuditEvent(client, snapshot);
      const sealedEvent = sealAuditEvent(insertedEvent, latestHash);
      const sealedSnapshot = sealedEvent.toSnapshot();

      await updateAuditEventIntegrity(client, sealedSnapshot);
      await client.query("COMMIT");
      return sealedEvent;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
