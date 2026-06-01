import { createHash } from "node:crypto";
import { DomainError } from "../shared/domain-error.js";
import { auditActions, auditResourceTypes } from "./audit-event.types.js";
import type {
  AuditAction,
  AuditEventSnapshot,
  AuditIntegrityReport,
  AuditResourceType,
  RecordAuditEventInput
} from "./audit-event.types.js";

export type {
  AuditAction,
  AuditEventSnapshot,
  AuditIntegrityReport,
  AuditIntegrityStatus,
  AuditResourceType,
  RecordAuditEventInput
} from "./audit-event.types.js";

const sha256HexPattern = /^[a-f0-9]{64}$/;

type AuditEventProps = {
  id?: string;
  occurredAt: Date;
  actorId: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  patientId?: string;
  purposeOfUse?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, unknown>;
  hashAlgorithm?: "sha256";
  previousHash?: string;
  payloadHash?: string;
  integrityHash?: string;
};

export class AuditEvent {
  private constructor(private readonly props: AuditEventProps) {}

  static record(input: RecordAuditEventInput): AuditEvent {
    const actorId = normalizeRequired(input.actorId, "Người thực hiện audit không được để trống.");
    const resourceId = normalizeRequired(input.resourceId, "Tài nguyên audit không được để trống.");
    const occurredAt = input.occurredAt ?? new Date();
    assertValidDate(occurredAt, "Thời điểm ghi nhận audit không hợp lệ.");

    return new AuditEvent({
      id: input.id?.trim() || undefined,
      occurredAt,
      actorId,
      action: normalizeAction(input.action),
      resourceType: normalizeResourceType(input.resourceType),
      resourceId,
      patientId: normalizeOptional(input.patientId),
      purposeOfUse: normalizeOptional(input.purposeOfUse),
      ipAddress: normalizeOptional(input.ipAddress),
      userAgent: normalizeOptional(input.userAgent),
      metadata: normalizeMetadata(input.metadata)
    });
  }

  static rehydrate(snapshot: AuditEventSnapshot): AuditEvent {
    const seal = normalizeSealMetadata(snapshot);

    return new AuditEvent({
      id: normalizeOptional(snapshot.id),
      occurredAt: parseDate(snapshot.occurredAt, "Thời điểm ghi nhận audit không hợp lệ."),
      actorId: normalizeRequired(snapshot.actorId, "Người thực hiện audit không được để trống."),
      action: normalizeAction(snapshot.action),
      resourceType: normalizeResourceType(snapshot.resourceType),
      resourceId: normalizeRequired(snapshot.resourceId, "Tài nguyên audit không được để trống."),
      patientId: normalizeOptional(snapshot.patientId),
      purposeOfUse: normalizeOptional(snapshot.purposeOfUse),
      ipAddress: normalizeOptional(snapshot.ipAddress),
      userAgent: normalizeOptional(snapshot.userAgent),
      metadata: normalizeMetadata(snapshot.metadata),
      hashAlgorithm: seal.hashAlgorithm,
      previousHash: seal.previousHash,
      payloadHash: seal.payloadHash,
      integrityHash: seal.integrityHash
    });
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get patientId(): string | undefined {
    return this.props.patientId;
  }

  toSnapshot(): AuditEventSnapshot {
    return {
      id: this.props.id,
      occurredAt: this.props.occurredAt.toISOString(),
      actorId: this.props.actorId,
      action: this.props.action,
      resourceType: this.props.resourceType,
      resourceId: this.props.resourceId,
      patientId: this.props.patientId,
      purposeOfUse: this.props.purposeOfUse,
      ipAddress: this.props.ipAddress,
      userAgent: this.props.userAgent,
      metadata: { ...this.props.metadata },
      hashAlgorithm: this.props.hashAlgorithm,
      previousHash: this.props.previousHash,
      payloadHash: this.props.payloadHash,
      integrityHash: this.props.integrityHash
    };
  }
}

export function sealAuditEvent(event: AuditEvent, previousHash?: string): AuditEvent {
  const snapshot = event.toSnapshot();
  const payloadHash = hashAuditPayload(snapshot);
  const normalizedPreviousHash = previousHash
    ? normalizeHash(previousHash, "previousHash của audit không hợp lệ.")
    : undefined;
  const integrityHash = hashCanonical({
    algorithm: "sha256",
    payloadHash,
    previousHash: normalizedPreviousHash ?? null
  });

  return AuditEvent.rehydrate({
    ...snapshot,
    hashAlgorithm: "sha256",
    previousHash: normalizedPreviousHash,
    payloadHash,
    integrityHash
  });
}

export function buildAuditIntegrityReport(
  patientId: string,
  events: readonly AuditEvent[],
  checkedAt = new Date()
): AuditIntegrityReport {
  assertValidDate(checkedAt, "Thời điểm kiểm tra toàn vẹn audit không hợp lệ.");
  let expectedPreviousHash: string | undefined;
  let sealedEvents = 0;

  for (const event of events) {
    const snapshot = event.toSnapshot();
    const eventId = snapshot.id ?? `${snapshot.occurredAt}:${snapshot.action}`;

    if (
      snapshot.hashAlgorithm !== "sha256" ||
      !snapshot.payloadHash ||
      !snapshot.integrityHash
    ) {
      return {
        patientId,
        checkedAt: checkedAt.toISOString(),
        status: "unsealed",
        verified: false,
        totalEvents: events.length,
        sealedEvents,
        latestHash: expectedPreviousHash,
        brokenAtEventId: eventId,
        brokenReason: "EVENT_NOT_SEALED"
      };
    }

    if (snapshot.previousHash !== expectedPreviousHash) {
      return {
        patientId,
        checkedAt: checkedAt.toISOString(),
        status: "broken",
        verified: false,
        totalEvents: events.length,
        sealedEvents,
        latestHash: expectedPreviousHash,
        brokenAtEventId: eventId,
        brokenReason: "PREVIOUS_HASH_MISMATCH"
      };
    }

    const expectedPayloadHash = hashAuditPayload(snapshot);

    if (snapshot.payloadHash !== expectedPayloadHash) {
      return {
        patientId,
        checkedAt: checkedAt.toISOString(),
        status: "broken",
        verified: false,
        totalEvents: events.length,
        sealedEvents,
        latestHash: expectedPreviousHash,
        brokenAtEventId: eventId,
        brokenReason: "PAYLOAD_HASH_MISMATCH"
      };
    }

    const expectedIntegrityHash = hashCanonical({
      algorithm: "sha256",
      payloadHash: snapshot.payloadHash,
      previousHash: snapshot.previousHash ?? null
    });

    if (snapshot.integrityHash !== expectedIntegrityHash) {
      return {
        patientId,
        checkedAt: checkedAt.toISOString(),
        status: "broken",
        verified: false,
        totalEvents: events.length,
        sealedEvents,
        latestHash: expectedPreviousHash,
        brokenAtEventId: eventId,
        brokenReason: "INTEGRITY_HASH_MISMATCH"
      };
    }

    sealedEvents += 1;
    expectedPreviousHash = snapshot.integrityHash;
  }

  return {
    patientId,
    checkedAt: checkedAt.toISOString(),
    status: "verified",
    verified: true,
    totalEvents: events.length,
    sealedEvents,
    latestHash: expectedPreviousHash
  };
}

function hashAuditPayload(snapshot: AuditEventSnapshot): string {
  return hashCanonical({
    id: snapshot.id ?? null,
    occurredAt: snapshot.occurredAt,
    actorId: snapshot.actorId,
    action: snapshot.action,
    resourceType: snapshot.resourceType,
    resourceId: snapshot.resourceId,
    patientId: snapshot.patientId ?? null,
    purposeOfUse: snapshot.purposeOfUse ?? null,
    ipAddress: snapshot.ipAddress ?? null,
    userAgent: snapshot.userAgent ?? null,
    metadata: snapshot.metadata
  });
}

function hashCanonical(value: unknown): string {
  return createHash("sha256").update(canonicalize(value)).digest("hex");
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));

  return `{${entries
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`)
    .join(",")}}`;
}

function normalizeAction(value: AuditAction): AuditAction {
  if (!auditActions.has(value)) {
    throw new DomainError("Hành động audit không hợp lệ.");
  }

  return value;
}

function normalizeResourceType(value: AuditResourceType): AuditResourceType {
  if (!auditResourceTypes.has(value)) {
    throw new DomainError("Loại tài nguyên audit không hợp lệ.");
  }

  return value;
}

function normalizeMetadata(value: Record<string, unknown>): Record<string, unknown> {
  if (!isPlainRecord(value)) {
    throw new DomainError("Metadata audit phải là object hợp lệ.");
  }

  return { ...value };
}

function normalizeSealMetadata(snapshot: AuditEventSnapshot): {
  readonly hashAlgorithm?: "sha256";
  readonly previousHash?: string;
  readonly payloadHash?: string;
  readonly integrityHash?: string;
} {
  const previousHash = normalizeOptional(snapshot.previousHash);
  const payloadHash = normalizeOptional(snapshot.payloadHash);
  const integrityHash = normalizeOptional(snapshot.integrityHash);
  const hasSealMetadata =
    snapshot.hashAlgorithm !== undefined ||
    previousHash !== undefined ||
    payloadHash !== undefined ||
    integrityHash !== undefined;

  if (!hasSealMetadata) {
    return {};
  }

  if (snapshot.hashAlgorithm !== "sha256") {
    throw new DomainError("Thuật toán niêm phong audit không hợp lệ.");
  }

  if (!payloadHash || !integrityHash) {
    throw new DomainError("Audit đã niêm phong cần có payloadHash và integrityHash.");
  }

  return {
    hashAlgorithm: "sha256",
    previousHash: previousHash
      ? normalizeHash(previousHash, "previousHash của audit không hợp lệ.")
      : undefined,
    payloadHash: normalizeHash(payloadHash, "payloadHash của audit không hợp lệ."),
    integrityHash: normalizeHash(integrityHash, "integrityHash của audit không hợp lệ.")
  };
}

function normalizeHash(value: string, message: string): string {
  const normalized = normalizeRequired(value, message);

  if (!sha256HexPattern.test(normalized)) {
    throw new DomainError(message);
  }

  return normalized;
}

function parseDate(value: string, message: string): Date {
  const date = new Date(normalizeRequired(value, message));
  assertValidDate(date, message);

  return date;
}

function assertValidDate(value: Date, message: string): void {
  if (Number.isNaN(value.getTime())) {
    throw new DomainError(message);
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRequired(value: string, message: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new DomainError(message);
  }

  return normalized;
}

function normalizeOptional(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}
