import pg from "pg";
import { AuditEvent } from "@benh-vien-so/domain";
import type {
  AuditAction,
  AuditEventRepository,
  AuditEventSnapshot,
  AuditResourceType
} from "@benh-vien-so/domain";

const { Pool } = pg;

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
};

export class PostgresAuditEventRepository implements AuditEventRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 10
    });
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
        metadata
      FROM audit_events
      WHERE patient_id = $1
      ORDER BY occurred_at DESC
      LIMIT $2`,
      [patientId, limit]
    );

    return result.rows.map(rowToAuditEvent);
  }

  async save(event: AuditEvent): Promise<AuditEvent> {
    const snapshot = event.toSnapshot();
    const result = await this.pool.query<AuditEventRow>(
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
        metadata`,
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

    return rowToAuditEvent(result.rows[0]);
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
    metadata
  };

  return AuditEvent.rehydrate(snapshot);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
