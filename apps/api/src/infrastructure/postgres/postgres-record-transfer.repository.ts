import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import { RecordTransfer } from "@benh-vien-so/domain";
import type {
  FindDueRecordTransferRetriesInput,
  RecordTransferDeliveryAttempt,
  RecordTransferBundleType,
  RecordTransferPriority,
  RecordTransferRepository,
  RecordTransferSnapshot,
  RecordTransferStatus
} from "@benh-vien-so/domain";
import { upsertRecordTransferDeliveryAttempt } from "./postgres-record-transfer-delivery-attempt.repository.js";

type PostgresQueryable = Pick<pg.Pool | pg.PoolClient, "query">;

type RecordTransferRow = {
  id: string;
  patient_id: string;
  status: RecordTransferStatus;
  priority: RecordTransferPriority;
  bundle_type: RecordTransferBundleType;
  bundle_id: string;
  source_organization_id: string;
  recipient_organization_id: string;
  consent_reference: string;
  requested_by_actor_id: string;
  reason: string;
  requested_at: Date | string;
  sent_at: Date | string | null;
  received_at: Date | string | null;
  received_by_actor_id: string | null;
  acknowledgement_reference: string | null;
  failed_at: Date | string | null;
  failure_reason: string | null;
  next_retry_at: Date | string | null;
  retry_count: number;
  dead_lettered_at: Date | string | null;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresRecordTransferRepository implements RecordTransferRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<RecordTransfer[]> {
    const result = await this.pool.query<RecordTransferRow>(
      `${selectRecordTransferSql}
      WHERE patient_id = $1
      ORDER BY requested_at DESC`,
      [patientId]
    );

    return result.rows.map(rowToRecordTransfer);
  }

  async findById(id: string): Promise<RecordTransfer | undefined> {
    const result = await this.pool.query<RecordTransferRow>(
      `${selectRecordTransferSql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToRecordTransfer(row) : undefined;
  }

  async findDueRetries(input: FindDueRecordTransferRetriesInput): Promise<RecordTransfer[]> {
    const limit = normalizeLimit(input.limit);

    if (limit === 0) {
      return [];
    }

    const result = await this.pool.query<RecordTransferRow>(
      `${selectRecordTransferSql}
      WHERE status = 'failed'
        AND next_retry_at IS NOT NULL
        AND next_retry_at <= $1
        AND retry_count < $2
      ORDER BY next_retry_at ASC, requested_at ASC
      LIMIT $3`,
      [input.dueAt, input.maxRetryCount ?? 2147483647, limit]
    );

    return result.rows.map(rowToRecordTransfer);
  }

  async findDueDeadLetters(input: FindDueRecordTransferRetriesInput): Promise<RecordTransfer[]> {
    const limit = normalizeLimit(input.limit);

    if (limit === 0) {
      return [];
    }

    const result = await this.pool.query<RecordTransferRow>(
      `${selectRecordTransferSql}
      WHERE status = 'failed'
        AND next_retry_at IS NOT NULL
        AND next_retry_at <= $1
        AND retry_count >= $2
      ORDER BY next_retry_at ASC, requested_at ASC
      LIMIT $3`,
      [input.dueAt, input.maxRetryCount ?? 2147483647, limit]
    );

    return result.rows.map(rowToRecordTransfer);
  }

  async save(recordTransfer: RecordTransfer): Promise<void> {
    await upsertRecordTransfer(this.pool, recordTransfer);
  }

  async saveWithDeliveryAttempt(
    recordTransfer: RecordTransfer,
    deliveryAttempt: RecordTransferDeliveryAttempt
  ): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      await upsertRecordTransfer(client, recordTransfer);
      await upsertRecordTransferDeliveryAttempt(client, deliveryAttempt);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

async function upsertRecordTransfer(
  queryable: PostgresQueryable,
  recordTransfer: RecordTransfer
): Promise<void> {
  const snapshot = recordTransfer.toSnapshot();

  await queryable.query(
    `INSERT INTO record_transfers (
      id,
      patient_id,
      status,
      priority,
      bundle_type,
      bundle_id,
      source_organization_id,
      recipient_organization_id,
      consent_reference,
      requested_by_actor_id,
      reason,
      requested_at,
      sent_at,
      received_at,
      received_by_actor_id,
      acknowledgement_reference,
      failed_at,
      failure_reason,
      next_retry_at,
      retry_count,
      dead_lettered_at,
      note,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
    ON CONFLICT (id) DO UPDATE SET
      patient_id = EXCLUDED.patient_id,
      status = EXCLUDED.status,
      priority = EXCLUDED.priority,
      bundle_type = EXCLUDED.bundle_type,
      bundle_id = EXCLUDED.bundle_id,
      source_organization_id = EXCLUDED.source_organization_id,
      recipient_organization_id = EXCLUDED.recipient_organization_id,
      consent_reference = EXCLUDED.consent_reference,
      requested_by_actor_id = EXCLUDED.requested_by_actor_id,
      reason = EXCLUDED.reason,
      requested_at = EXCLUDED.requested_at,
      sent_at = EXCLUDED.sent_at,
      received_at = EXCLUDED.received_at,
      received_by_actor_id = EXCLUDED.received_by_actor_id,
      acknowledgement_reference = EXCLUDED.acknowledgement_reference,
      failed_at = EXCLUDED.failed_at,
      failure_reason = EXCLUDED.failure_reason,
      next_retry_at = EXCLUDED.next_retry_at,
      retry_count = EXCLUDED.retry_count,
      dead_lettered_at = EXCLUDED.dead_lettered_at,
      note = EXCLUDED.note,
      updated_at = EXCLUDED.updated_at`,
    [
      snapshot.id,
      snapshot.patientId,
      snapshot.status,
      snapshot.priority,
      snapshot.bundleType,
      snapshot.bundleId,
      snapshot.sourceOrganizationId,
      snapshot.recipientOrganizationId,
      snapshot.consentReference,
      snapshot.requestedByActorId,
      snapshot.reason,
      snapshot.requestedAt,
      snapshot.sentAt ?? null,
      snapshot.receivedAt ?? null,
      snapshot.receivedByActorId ?? null,
      snapshot.acknowledgementReference ?? null,
      snapshot.failedAt ?? null,
      snapshot.failureReason ?? null,
      snapshot.nextRetryAt ?? null,
      snapshot.retryCount,
      snapshot.deadLetteredAt ?? null,
      snapshot.note ?? null,
      snapshot.createdAt,
      snapshot.updatedAt
    ]
  );
}

export async function seedRecordTransfersIfEmpty(
  repository: RecordTransferRepository,
  seedRecordTransfers: readonly RecordTransfer[]
): Promise<void> {
  const firstPatientId = seedRecordTransfers[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const recordTransfers = await repository.findByPatientId(firstPatientId);

  if (recordTransfers.length > 0) {
    return;
  }

  for (const recordTransfer of seedRecordTransfers) {
    await repository.save(recordTransfer);
  }
}

const selectRecordTransferSql = `SELECT
  id,
  patient_id,
  status,
  priority,
  bundle_type,
  bundle_id,
  source_organization_id,
  recipient_organization_id,
  consent_reference,
  requested_by_actor_id,
  reason,
  requested_at,
  sent_at,
  received_at,
  received_by_actor_id,
  acknowledgement_reference,
  failed_at,
  failure_reason,
  next_retry_at,
  retry_count,
  dead_lettered_at,
  note,
  created_at,
  updated_at
  FROM record_transfers`;

function rowToRecordTransfer(row: RecordTransferRow): RecordTransfer {
  const snapshot: RecordTransferSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    status: row.status,
    priority: row.priority,
    bundleType: row.bundle_type,
    bundleId: row.bundle_id,
    sourceOrganizationId: row.source_organization_id,
    recipientOrganizationId: row.recipient_organization_id,
    consentReference: row.consent_reference,
    requestedByActorId: row.requested_by_actor_id,
    reason: row.reason,
    requestedAt: toIsoString(row.requested_at),
    sentAt: row.sent_at ? toIsoString(row.sent_at) : undefined,
    receivedAt: row.received_at ? toIsoString(row.received_at) : undefined,
    receivedByActorId: row.received_by_actor_id ?? undefined,
    acknowledgementReference: row.acknowledgement_reference ?? undefined,
    failedAt: row.failed_at ? toIsoString(row.failed_at) : undefined,
    failureReason: row.failure_reason ?? undefined,
    nextRetryAt: row.next_retry_at ? toIsoString(row.next_retry_at) : undefined,
    retryCount: row.retry_count,
    deadLetteredAt: row.dead_lettered_at ? toIsoString(row.dead_lettered_at) : undefined,
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return RecordTransfer.rehydrate(snapshot);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function normalizeLimit(limit: number): number {
  if (!Number.isInteger(limit) || limit < 1) {
    return 0;
  }

  return limit;
}
