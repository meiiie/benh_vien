import {
  assertValidDate,
  hashAuditPayload,
  hashCanonical,
  normalizeAction,
  normalizeHash,
  normalizeMetadata,
  normalizeOptional,
  normalizeRequired,
  normalizeResourceType,
  normalizeSealMetadata,
  parseDate
} from "./audit-event.validation.js";
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
