import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type {
  FindQueuedRecordTransferDeliveryAttemptsInput,
  RecordTransferDeliveryAttempt,
  RecordTransferDeliveryAttemptRepository
} from "@benh-vien-so/domain";
import { rowToRecordTransferDeliveryAttempt } from "./postgres-record-transfer-delivery-attempt.mapper.js";
import { upsertRecordTransferDeliveryAttempt } from "./postgres-record-transfer-delivery-attempt.persistence.js";
import { selectRecordTransferDeliveryAttemptSql } from "./postgres-record-transfer-delivery-attempt.sql.js";
import type { RecordTransferDeliveryAttemptRow } from "./postgres-record-transfer-delivery-attempt.types.js";

export class PostgresRecordTransferDeliveryAttemptRepository
  implements RecordTransferDeliveryAttemptRepository
{
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByRecordTransferId(
    recordTransferId: string
  ): Promise<RecordTransferDeliveryAttempt[]> {
    const result = await this.pool.query<RecordTransferDeliveryAttemptRow>(
      `${selectRecordTransferDeliveryAttemptSql}
      WHERE record_transfer_id = $1
      ORDER BY attempt_number ASC`,
      [recordTransferId]
    );

    return result.rows.map(rowToRecordTransferDeliveryAttempt);
  }

  async findQueued(
    input: FindQueuedRecordTransferDeliveryAttemptsInput
  ): Promise<RecordTransferDeliveryAttempt[]> {
    const limit = normalizeLimit(input.limit);

    if (limit === 0) {
      return [];
    }

    const result = await this.pool.query<RecordTransferDeliveryAttemptRow>(
      `${selectRecordTransferDeliveryAttemptSql}
      WHERE status = 'queued'
      ORDER BY queued_at ASC, attempt_number ASC
      LIMIT $1`,
      [limit]
    );

    return result.rows.map(rowToRecordTransferDeliveryAttempt);
  }

  async save(attempt: RecordTransferDeliveryAttempt): Promise<void> {
    await upsertRecordTransferDeliveryAttempt(this.pool, attempt);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

function normalizeLimit(limit: number): number {
  if (!Number.isInteger(limit) || limit < 1) {
    return 0;
  }

  return limit;
}
