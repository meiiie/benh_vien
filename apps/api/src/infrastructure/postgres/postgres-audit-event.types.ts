import type pg from "pg";
import type { AuditAction, AuditResourceType } from "@benh-vien-so/domain";

export type PostgresAuditQueryable = Pick<pg.Pool | pg.PoolClient, "query">;

export type AuditEventRow = {
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
