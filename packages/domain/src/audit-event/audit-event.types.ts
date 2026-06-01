import { auditActionValues, auditResourceTypeValues } from "./audit-event.catalog.js";

export type AuditAction = (typeof auditActionValues)[number];

export type AuditResourceType = (typeof auditResourceTypeValues)[number];

export const auditActions = new Set<AuditAction>(auditActionValues);

export const auditResourceTypes = new Set<AuditResourceType>(auditResourceTypeValues);

export type AuditEventSnapshot = {
  readonly id?: string;
  readonly occurredAt: string;
  readonly actorId: string;
  readonly action: AuditAction;
  readonly resourceType: AuditResourceType;
  readonly resourceId: string;
  readonly patientId?: string;
  readonly purposeOfUse?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly metadata: Record<string, unknown>;
  readonly hashAlgorithm?: "sha256";
  readonly previousHash?: string;
  readonly payloadHash?: string;
  readonly integrityHash?: string;
};

export type RecordAuditEventInput = Omit<
  AuditEventSnapshot,
  "occurredAt" | "hashAlgorithm" | "previousHash" | "payloadHash" | "integrityHash"
> & {
  readonly occurredAt?: Date;
};

export type AuditIntegrityStatus = "verified" | "unsealed" | "broken";

export type AuditIntegrityReport = {
  readonly patientId: string;
  readonly checkedAt: string;
  readonly status: AuditIntegrityStatus;
  readonly verified: boolean;
  readonly totalEvents: number;
  readonly sealedEvents: number;
  readonly latestHash?: string;
  readonly brokenAtEventId?: string;
  readonly brokenReason?: string;
};
