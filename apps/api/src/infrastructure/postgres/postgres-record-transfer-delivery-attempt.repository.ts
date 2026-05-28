import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import { RecordTransferDeliveryAttempt } from "@benh-vien-so/domain";
import type {
  RecordTransferDeliveryAttemptRepository,
  RecordTransferDeliveryAttemptSnapshot,
  RecordTransferDeliveryAttemptStatus
} from "@benh-vien-so/domain";

type RecordTransferDeliveryAttemptRow = {
  id: string;
  record_transfer_id: string;
  patient_id: string;
  target_endpoint_id: string;
  target_endpoint_address: string;
  bundle_id: string;
  bundle_type: "collection" | "document";
  idempotency_key: string;
  attempt_number: number;
  status: RecordTransferDeliveryAttemptStatus;
  queued_at: Date | string;
  completed_at: Date | string | null;
  http_status: number | null;
  response_body_preview: string | null;
  error_message: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

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

  async save(attempt: RecordTransferDeliveryAttempt): Promise<void> {
    const snapshot = attempt.toSnapshot();

    await this.pool.query(
      `INSERT INTO record_transfer_delivery_attempts (
        id,
        record_transfer_id,
        patient_id,
        target_endpoint_id,
        target_endpoint_address,
        bundle_id,
        bundle_type,
        idempotency_key,
        attempt_number,
        status,
        queued_at,
        completed_at,
        http_status,
        response_body_preview,
        error_message,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        completed_at = EXCLUDED.completed_at,
        http_status = EXCLUDED.http_status,
        response_body_preview = EXCLUDED.response_body_preview,
        error_message = EXCLUDED.error_message,
        updated_at = EXCLUDED.updated_at`,
      [
        snapshot.id,
        snapshot.recordTransferId,
        snapshot.patientId,
        snapshot.targetEndpointId,
        snapshot.targetEndpointAddress,
        snapshot.bundleId,
        snapshot.bundleType,
        snapshot.idempotencyKey,
        snapshot.attemptNumber,
        snapshot.status,
        snapshot.queuedAt,
        snapshot.completedAt ?? null,
        snapshot.httpStatus ?? null,
        snapshot.responseBodyPreview ?? null,
        snapshot.errorMessage ?? null,
        snapshot.createdAt,
        snapshot.updatedAt
      ]
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

const selectRecordTransferDeliveryAttemptSql = `SELECT
  id,
  record_transfer_id,
  patient_id,
  target_endpoint_id,
  target_endpoint_address,
  bundle_id,
  bundle_type,
  idempotency_key,
  attempt_number,
  status,
  queued_at,
  completed_at,
  http_status,
  response_body_preview,
  error_message,
  created_at,
  updated_at
  FROM record_transfer_delivery_attempts`;

function rowToRecordTransferDeliveryAttempt(
  row: RecordTransferDeliveryAttemptRow
): RecordTransferDeliveryAttempt {
  const snapshot: RecordTransferDeliveryAttemptSnapshot = {
    id: row.id,
    recordTransferId: row.record_transfer_id,
    patientId: row.patient_id,
    targetEndpointId: row.target_endpoint_id,
    targetEndpointAddress: row.target_endpoint_address,
    bundleId: row.bundle_id,
    bundleType: row.bundle_type,
    idempotencyKey: row.idempotency_key,
    attemptNumber: row.attempt_number,
    status: row.status,
    queuedAt: toIsoString(row.queued_at),
    completedAt: row.completed_at ? toIsoString(row.completed_at) : undefined,
    httpStatus: row.http_status ?? undefined,
    responseBodyPreview: row.response_body_preview ?? undefined,
    errorMessage: row.error_message ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return RecordTransferDeliveryAttempt.rehydrate(snapshot);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
