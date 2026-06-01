export const selectRecordTransferDeliveryAttemptSql = `SELECT
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

export const upsertRecordTransferDeliveryAttemptSql = `INSERT INTO record_transfer_delivery_attempts (
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
  updated_at = EXCLUDED.updated_at`;
