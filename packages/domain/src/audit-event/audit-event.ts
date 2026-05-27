import { createHash } from "node:crypto";
import { DomainError } from "../shared/domain-error.js";

export type AuditAction =
  | "patient.list"
  | "patient.create"
  | "patient.read"
  | "patient.fhir-export"
  | "patient.fhir-bundle-export"
  | "patient.fhir-document-bundle-export"
  | "provider-directory.read"
  | "provider-directory.fhir-export"
  | "record-transfer.list"
  | "record-transfer.create"
  | "record-transfer.read"
  | "record-transfer.fhir-export"
  | "encounter.list"
  | "encounter.create"
  | "encounter.read"
  | "encounter.finish"
  | "encounter.fhir-export"
  | "allergy-intolerance.list"
  | "allergy-intolerance.create"
  | "allergy-intolerance.read"
  | "allergy-intolerance.fhir-export"
  | "condition.list"
  | "condition.create"
  | "condition.read"
  | "condition.fhir-export"
  | "medication-request.list"
  | "medication-request.create"
  | "medication-request.read"
  | "medication-request.fhir-export"
  | "medication-dispense.list"
  | "medication-dispense.create"
  | "medication-dispense.read"
  | "medication-dispense.fhir-export"
  | "medication-administration.list"
  | "medication-administration.create"
  | "medication-administration.read"
  | "medication-administration.fhir-export"
  | "observation.list"
  | "observation.create"
  | "observation.read"
  | "observation.fhir-export"
  | "service-request.list"
  | "service-request.create"
  | "service-request.read"
  | "service-request.fhir-export"
  | "workflow-task.list"
  | "workflow-task.create"
  | "workflow-task.read"
  | "workflow-task.fhir-export"
  | "procedure.list"
  | "procedure.create"
  | "procedure.read"
  | "procedure.fhir-export"
  | "diagnostic-report.list"
  | "diagnostic-report.create"
  | "diagnostic-report.read"
  | "diagnostic-report.fhir-export"
  | "imaging-study.list"
  | "imaging-study.create"
  | "imaging-study.read"
  | "imaging-study.fhir-export"
  | "clinical-document.list"
  | "clinical-document.create"
  | "clinical-document.sign"
  | "clinical-document.fhir-export"
  | "consent.list"
  | "consent.create"
  | "consent.revoke"
  | "consent.fhir-export"
  | "audit-event.list"
  | "audit-event.integrity-verify";

export type AuditResourceType =
  | "Patient"
  | "ProviderDirectory"
  | "RecordTransfer"
  | "Encounter"
  | "AllergyIntolerance"
  | "Condition"
  | "MedicationRequest"
  | "MedicationDispense"
  | "MedicationAdministration"
  | "Observation"
  | "ServiceRequest"
  | "Task"
  | "Procedure"
  | "DiagnosticReport"
  | "ImagingStudy"
  | "ClinicalDocument"
  | "Consent"
  | "AuditEvent";

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

    return new AuditEvent({
      id: input.id?.trim() || undefined,
      occurredAt: input.occurredAt ?? new Date(),
      actorId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId,
      patientId: normalizeOptional(input.patientId),
      purposeOfUse: normalizeOptional(input.purposeOfUse),
      ipAddress: normalizeOptional(input.ipAddress),
      userAgent: normalizeOptional(input.userAgent),
      metadata: input.metadata
    });
  }

  static rehydrate(snapshot: AuditEventSnapshot): AuditEvent {
    return new AuditEvent({
      id: snapshot.id,
      occurredAt: new Date(snapshot.occurredAt),
      actorId: snapshot.actorId,
      action: snapshot.action,
      resourceType: snapshot.resourceType,
      resourceId: snapshot.resourceId,
      patientId: snapshot.patientId,
      purposeOfUse: snapshot.purposeOfUse,
      ipAddress: snapshot.ipAddress,
      userAgent: snapshot.userAgent,
      metadata: snapshot.metadata,
      hashAlgorithm: snapshot.hashAlgorithm,
      previousHash: snapshot.previousHash,
      payloadHash: snapshot.payloadHash,
      integrityHash: snapshot.integrityHash
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
  const integrityHash = hashCanonical({
    algorithm: "sha256",
    payloadHash,
    previousHash: previousHash ?? null
  });

  return AuditEvent.rehydrate({
    ...snapshot,
    hashAlgorithm: "sha256",
    previousHash,
    payloadHash,
    integrityHash
  });
}

export function buildAuditIntegrityReport(
  patientId: string,
  events: readonly AuditEvent[],
  checkedAt = new Date()
): AuditIntegrityReport {
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
