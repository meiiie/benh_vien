import type pg from "pg";
import type {
  RecordTransferDeliveryAttemptBundleType,
  RecordTransferDeliveryAttemptStatus
} from "@benh-vien-so/domain";

export type PostgresRecordTransferDeliveryAttemptQueryable = Pick<
  pg.Pool | pg.PoolClient,
  "query"
>;

export type RecordTransferDeliveryAttemptRow = {
  id: string;
  record_transfer_id: string;
  patient_id: string;
  target_endpoint_id: string;
  target_endpoint_address: string;
  bundle_id: string;
  bundle_type: RecordTransferDeliveryAttemptBundleType;
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
