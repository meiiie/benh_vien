import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type {
  FindDueRecordTransferRetriesInput,
  RecordTransferDeliveryAttempt,
  RecordTransfer,
  RecordTransferRepository,
} from "@benh-vien-so/domain";
import { upsertRecordTransferDeliveryAttempt } from "./postgres-record-transfer-delivery-attempt.persistence.js";
import { rowToRecordTransfer } from "./postgres-record-transfer.mapper.js";
import { upsertRecordTransfer } from "./postgres-record-transfer.persistence.js";
import {
  findDueRecordTransferDeadLetters,
  findDueRecordTransferRetries
} from "./postgres-record-transfer-retry-queries.js";
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
    return findDueRecordTransferRetries(this.pool, input);
  }

  async findDueDeadLetters(input: FindDueRecordTransferRetriesInput): Promise<RecordTransfer[]> {
    return findDueRecordTransferDeadLetters(this.pool, input);
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
