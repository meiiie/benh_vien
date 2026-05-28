import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import { AuditEvent, buildAuditIntegrityReport, sealAuditEvent } from "@benh-vien-so/domain";
import type {
  AuditAction,
  AuditEventRepository,
  AuditEventSnapshot,
  AuditResourceType
} from "@benh-vien-so/domain";

type AuditEventRow = {
  id: string | number;
  occurred_at: Date | string;
  actor_id: string;
  action: AuditAction;
  resource_type: AuditResourceType;
  resource_id: string;
  patient_id: string | null;
  purpose_of_use: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | string;
  hash_algorithm: "sha256" | null;
  previous_hash: string | null;
  payload_hash: string | null;
  integrity_hash: string | null;
};

export class PostgresAuditEventRepository implements AuditEventRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findRecent(limit = 50): Promise<AuditEvent[]> {
    const result = await this.pool.query<AuditEventRow>(
      `SELECT
        id,
        occurred_at,
        actor_id,
        action,
        resource_type,
        resource_id,
        patient_id,
        purpose_of_use,
        ip_address::text AS ip_address,
        user_agent,
        metadata,
        hash_algorithm,
        previous_hash,
        payload_hash,
        integrity_hash
      FROM audit_events
      ORDER BY occurred_at DESC, id DESC
      LIMIT $1`,
      [limit]
    );

    return result.rows.map(rowToAuditEvent);
  }

  async findByPatientId(patientId: string, limit = 50): Promise<AuditEvent[]> {
    const result = await this.pool.query<AuditEventRow>(
      `SELECT
        id,
        occurred_at,
        actor_id,
        action,
        resource_type,
        resource_id,
        patient_id,
        purpose_of_use,
        ip_address::text AS ip_address,
        user_agent,
        metadata,
        hash_algorithm,
        previous_hash,
        payload_hash,
        integrity_hash
      FROM audit_events
      WHERE patient_id = $1
      ORDER BY occurred_at DESC
      LIMIT $2`,
      [patientId, limit]
    );

    return result.rows.map(rowToAuditEvent);
  }

  async verifyPatientIntegrity(patientId: string) {
    const result = await this.pool.query<AuditEventRow>(
      `SELECT
        id,
        occurred_at,
        actor_id,
        action,
        resource_type,
        resource_id,
        patient_id,
        purpose_of_use,
        ip_address::text AS ip_address,
        user_agent,
        metadata,
        hash_algorithm,
        previous_hash,
        payload_hash,
        integrity_hash
      FROM audit_events
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
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1)::bigint)", [
        snapshot.patientId ?? "__system__"
      ]);

      const latestHashResult = await client.query<{ readonly integrity_hash: string | null }>(
        `SELECT integrity_hash
        FROM audit_events
        WHERE patient_id IS NOT DISTINCT FROM $1
          AND integrity_hash IS NOT NULL
        ORDER BY id DESC
        LIMIT 1`,
        [snapshot.patientId ?? null]
      );
      const latestHash = latestHashResult.rows[0]?.integrity_hash ?? undefined;

      const result = await client.query<AuditEventRow>(
        `INSERT INTO audit_events (
          occurred_at,
          actor_id,
          action,
          resource_type,
          resource_id,
          patient_id,
          purpose_of_use,
          ip_address,
          user_agent,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::inet, $9, $10::jsonb)
        RETURNING
          id,
          occurred_at,
          actor_id,
          action,
          resource_type,
          resource_id,
          patient_id,
          purpose_of_use,
          ip_address::text AS ip_address,
          user_agent,
          metadata,
          hash_algorithm,
          previous_hash,
          payload_hash,
          integrity_hash`,
        [
          snapshot.occurredAt,
          snapshot.actorId,
          snapshot.action,
          snapshot.resourceType,
          snapshot.resourceId,
          snapshot.patientId ?? null,
          snapshot.purposeOfUse ?? null,
          snapshot.ipAddress ?? null,
          snapshot.userAgent ?? null,
          JSON.stringify(snapshot.metadata)
        ]
      );
      const sealedEvent = sealAuditEvent(rowToAuditEvent(result.rows[0]), latestHash);
      const sealedSnapshot = sealedEvent.toSnapshot();

      await client.query(
        `UPDATE audit_events
        SET
          hash_algorithm = $2,
          previous_hash = $3,
          payload_hash = $4,
          integrity_hash = $5
        WHERE id = $1`,
        [
          sealedSnapshot.id,
          sealedSnapshot.hashAlgorithm,
          sealedSnapshot.previousHash ?? null,
          sealedSnapshot.payloadHash,
          sealedSnapshot.integrityHash
        ]
      );

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

function rowToAuditEvent(row: AuditEventRow): AuditEvent {
  const metadata =
    typeof row.metadata === "string"
      ? (JSON.parse(row.metadata) as Record<string, unknown>)
      : row.metadata;

  const snapshot: AuditEventSnapshot = {
    id: String(row.id),
    occurredAt: toIsoString(row.occurred_at),
    actorId: row.actor_id,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    patientId: row.patient_id ?? undefined,
    purposeOfUse: row.purpose_of_use ?? undefined,
    ipAddress: row.ip_address ?? undefined,
    userAgent: row.user_agent ?? undefined,
    metadata,
    hashAlgorithm: row.hash_algorithm ?? undefined,
    previousHash: row.previous_hash ?? undefined,
    payloadHash: row.payload_hash ?? undefined,
    integrityHash: row.integrity_hash ?? undefined
  };

  return AuditEvent.rehydrate(snapshot);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
