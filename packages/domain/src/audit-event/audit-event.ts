import { DomainError } from "../shared/domain-error.js";

export type AuditAction =
  | "patient.list"
  | "patient.create"
  | "patient.read"
  | "patient.fhir-export"
  | "patient.fhir-bundle-export"
  | "encounter.list"
  | "encounter.create"
  | "encounter.read"
  | "encounter.finish"
  | "encounter.fhir-export"
  | "clinical-document.list"
  | "clinical-document.create"
  | "clinical-document.sign"
  | "clinical-document.fhir-export"
  | "audit-event.list";

export type AuditResourceType = "Patient" | "Encounter" | "ClinicalDocument" | "AuditEvent";

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
};

export type RecordAuditEventInput = Omit<AuditEventSnapshot, "occurredAt"> & {
  readonly occurredAt?: Date;
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
      metadata: snapshot.metadata
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
      metadata: { ...this.props.metadata }
    };
  }
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
