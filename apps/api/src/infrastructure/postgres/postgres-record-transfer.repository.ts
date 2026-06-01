import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type {
  FindDueRecordTransferRetriesInput,
  RecordTransferDeliveryAttempt,
  RecordTransfer,
  RecordTransferRepository,
} from "@benh-vien-so/domain";
import { upsertRecordTransferDeliveryAttempt } from "./postgres-record-transfer-delivery-attempt.repository.js";
import { rowToRecordTransfer } from "./postgres-record-transfer.mapper.js";
import { upsertRecordTransfer } from "./postgres-record-transfer.persistence.js";
import { selectRecordTransferSql } from "./postgres-record-transfer.sql.js";
import type { RecordTransferRow } from "./postgres-record-transfer.types.js";

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

function normalizeLimit(limit: number): number {
  if (!Number.isInteger(limit) || limit < 1) {
    return 0;
  }

  return limit;
}
