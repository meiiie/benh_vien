import type pg from "pg";
import type {
  RecordTransferBundleType,
  RecordTransferPriority,
  RecordTransferStatus
} from "@benh-vien-so/domain";

export type PostgresQueryable = Pick<pg.Pool | pg.PoolClient, "query">;

export type RecordTransferRow = {
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
