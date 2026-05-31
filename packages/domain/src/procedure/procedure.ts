import { DomainError } from "../shared/domain-error.js";

export type ProcedureStatus =
  | "preparation"
  | "in-progress"
  | "not-done"
  | "on-hold"
  | "stopped"
  | "completed"
  | "entered-in-error"
  | "unknown";

export type ProcedureCategory =
  | "surgical"
  | "diagnostic"
  | "therapeutic"
  | "counseling"
  | "rehabilitation"
  | "other";

const procedureStatuses = new Set<ProcedureStatus>([
  "preparation",
  "in-progress",
  "not-done",
  "on-hold",
  "stopped",
  "completed",
  "entered-in-error",
  "unknown"
]);
const procedureCategories = new Set<ProcedureCategory>([
  "surgical",
  "diagnostic",
  "therapeutic",
  "counseling",
  "rehabilitation",
  "other"
]);

export type ProcedureCoding = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type ProcedurePerformerActorType = "Practitioner" | "PractitionerRole" | "Organization";

const procedurePerformerActorTypes = new Set<ProcedurePerformerActorType>([
  "Practitioner",
  "PractitionerRole",
  "Organization"
]);
const procedureReportReferenceResourceTypes = new Set<
  "DiagnosticReport" | "DocumentReference" | "Composition"
>([
  "DiagnosticReport",
  "DocumentReference",
  "Composition"
]);

export type ProcedurePerformer = {
  readonly actorType: ProcedurePerformerActorType;
  readonly actorId: string;
  readonly function?: ProcedureCoding;
  readonly onBehalfOfOrganizationId?: string;
};

export type ProcedurePerformedPeriod = {
  readonly start?: string;
  readonly end?: string;
};

export type ProcedureReportReference = {
  readonly resourceType: "DiagnosticReport" | "DocumentReference" | "Composition";
  readonly id: string;
};

export type ProcedureSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
  readonly partOfProcedureId?: string;
  readonly status: ProcedureStatus;
  readonly statusReason?: ProcedureCoding;
  readonly category: ProcedureCategory;
  readonly code: ProcedureCoding;
  readonly performedPeriod?: ProcedurePerformedPeriod;
  readonly recorderPractitionerId?: string;
  readonly asserterPractitionerId?: string;
  readonly performers: readonly ProcedurePerformer[];
  readonly reasonConditionId?: string;
  readonly bodySite?: ProcedureCoding;
  readonly outcome?: ProcedureCoding;
  readonly reportReferences: readonly ProcedureReportReference[];
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateProcedureInput = Omit<
  ProcedureSnapshot,
  "createdAt" | "updatedAt"
>;

export class Procedure {
  private constructor(private readonly props: ProcedureSnapshot) {}

  static record(input: CreateProcedureInput): Procedure {
    const now = new Date();
    const id = normalizeRequired(input.id, "Mã thủ thuật không được để trống.");
    const status = normalizeStatus(input.status);
    const performedPeriod = normalizePerformedPeriod(input.performedPeriod);
    const performers = normalizePerformers(input.performers);
    assertProcedureLifecycle(status, performedPeriod, performers);
    validateSelfReference(id, input.partOfProcedureId);
    validatePersistenceTimeline(now, now);

    return new Procedure({
      id,
      patientId: normalizeRequired(input.patientId, "Procedure phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      basedOnServiceRequestId: normalizeOptional(input.basedOnServiceRequestId),
      partOfProcedureId: normalizeOptional(input.partOfProcedureId),
      status,
      statusReason: normalizeCoding(input.statusReason),
      category: normalizeCategory(input.category),
      code: normalizeRequiredCoding(input.code),
      performedPeriod,
      recorderPractitionerId: normalizeOptional(input.recorderPractitionerId),
      asserterPractitionerId: normalizeOptional(input.asserterPractitionerId),
      performers,
      reasonConditionId: normalizeOptional(input.reasonConditionId),
      bodySite: normalizeCoding(input.bodySite),
      outcome: normalizeCoding(input.outcome),
      reportReferences: normalizeReportReferences(input.reportReferences),
      note: normalizeOptional(input.note),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: ProcedureSnapshot): Procedure {
    const id = normalizeRequired(snapshot.id, "Mã thủ thuật không được để trống.");
    const createdAt = parseDate(
      snapshot.createdAt,
      "Thời điểm tạo thủ thuật không hợp lệ."
    );
    const updatedAt = parseDate(
      snapshot.updatedAt,
      "Thời điểm cập nhật thủ thuật không hợp lệ."
    );
    const status = normalizeStatus(snapshot.status);
    const performedPeriod = normalizePerformedPeriod(snapshot.performedPeriod);
    const performers = normalizePerformers(snapshot.performers);
    assertProcedureLifecycle(status, performedPeriod, performers);
    validateSelfReference(id, snapshot.partOfProcedureId);
    validatePersistenceTimeline(createdAt, updatedAt);

    return new Procedure({
      ...snapshot,
      id,
      patientId: normalizeRequired(snapshot.patientId, "Procedure phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(snapshot.encounterId),
      basedOnServiceRequestId: normalizeOptional(snapshot.basedOnServiceRequestId),
      partOfProcedureId: normalizeOptional(snapshot.partOfProcedureId),
      status,
      statusReason: normalizeCoding(snapshot.statusReason),
      category: normalizeCategory(snapshot.category),
      code: normalizeRequiredCoding(snapshot.code),
      performedPeriod,
      recorderPractitionerId: normalizeOptional(snapshot.recorderPractitionerId),
      asserterPractitionerId: normalizeOptional(snapshot.asserterPractitionerId),
      performers,
      reasonConditionId: normalizeOptional(snapshot.reasonConditionId),
      bodySite: normalizeCoding(snapshot.bodySite),
      outcome: normalizeCoding(snapshot.outcome),
      reportReferences: normalizeReportReferences(snapshot.reportReferences),
      note: normalizeOptional(snapshot.note),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString()
    });
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  toSnapshot(): ProcedureSnapshot {
    return {
      ...this.props,
      statusReason: this.props.statusReason ? { ...this.props.statusReason } : undefined,
      code: { ...this.props.code },
      performedPeriod: this.props.performedPeriod ? { ...this.props.performedPeriod } : undefined,
      performers: this.props.performers.map((performer) => ({
        ...performer,
        function: performer.function ? { ...performer.function } : undefined
      })),
      bodySite: this.props.bodySite ? { ...this.props.bodySite } : undefined,
      outcome: this.props.outcome ? { ...this.props.outcome } : undefined,
      reportReferences: this.props.reportReferences.map((reference) => ({ ...reference }))
    };
  }
}

function normalizeRequiredCoding(code: ProcedureCoding): ProcedureCoding {
  return {
    system: normalizeRequired(code.system, "Hệ mã thủ thuật không được để trống."),
    code: normalizeRequired(code.code, "Mã thủ thuật không được để trống."),
    display: normalizeRequired(code.display, "Tên thủ thuật không được để trống.")
  };
}

function normalizeCoding(code: ProcedureCoding | undefined): ProcedureCoding | undefined {
  return code ? normalizeRequiredCoding(code) : undefined;
}

function normalizePerformedPeriod(
  period: ProcedurePerformedPeriod | undefined
): ProcedurePerformedPeriod | undefined {
  if (!period?.start && !period?.end) {
    return undefined;
  }

  const start = period.start
    ? parseDate(period.start, "Thời điểm bắt đầu thủ thuật không hợp lệ.").toISOString()
    : undefined;
  const end = period.end
    ? parseDate(period.end, "Thời điểm kết thúc thủ thuật không hợp lệ.").toISOString()
    : undefined;

  if (start && end && new Date(end).getTime() < new Date(start).getTime()) {
    throw new DomainError("Thời điểm kết thúc thủ thuật không được trước thời điểm bắt đầu.");
  }

  return { start, end };
}

function normalizePerformers(
  performers: readonly ProcedurePerformer[] | undefined
): readonly ProcedurePerformer[] {
  const normalized = new Map<string, ProcedurePerformer>();

  for (const performer of performers ?? []) {
    const actorType = normalizePerformerActorType(performer.actorType);
    const actorId = normalizeRequired(performer.actorId, "Người hoặc đơn vị thực hiện thủ thuật không được để trống.");
    normalized.set(`${actorType}/${actorId}`, {
      actorType,
      actorId,
      function: normalizeCoding(performer.function),
      onBehalfOfOrganizationId: normalizeOptional(performer.onBehalfOfOrganizationId)
    });
  }

  return [...normalized.values()];
}

function normalizeReportReferences(
  references: readonly ProcedureReportReference[] | undefined
): readonly ProcedureReportReference[] {
  const normalized = new Map<string, ProcedureReportReference>();

  for (const reference of references ?? []) {
    const resourceType = normalizeReportReferenceResourceType(reference.resourceType);
    const id = normalizeRequired(reference.id, "Báo cáo liên quan thủ thuật không được để trống.");
    normalized.set(`${resourceType}/${id}`, {
      resourceType,
      id
    });
  }

  return [...normalized.values()];
}

function assertProcedureLifecycle(
  status: ProcedureStatus,
  performedPeriod: ProcedurePerformedPeriod | undefined,
  performers: readonly ProcedurePerformer[]
): void {
  if (status === "completed" && !performedPeriod?.start && !performedPeriod?.end) {
    throw new DomainError("Thủ thuật đã hoàn tất cần có thời điểm thực hiện để truy vết.");
  }

  if (status === "completed" && performers.length === 0) {
    throw new DomainError("Thủ thuật đã hoàn tất cần có tối thiểu một người hoặc đơn vị thực hiện.");
  }
}

function validateSelfReference(id: string, partOfProcedureId: string | undefined): void {
  const normalizedPartOfProcedureId = normalizeOptional(partOfProcedureId);

  if (normalizedPartOfProcedureId && normalizedPartOfProcedureId === id) {
    throw new DomainError("Thủ thuật không được là một phần của chính nó.");
  }
}

function validatePersistenceTimeline(createdAt: Date, updatedAt: Date): void {
  if (updatedAt < createdAt) {
    throw new DomainError("Thời điểm cập nhật thủ thuật không được trước thời điểm tạo thủ thuật.");
  }
}

function normalizeStatus(value: ProcedureStatus): ProcedureStatus {
  if (!procedureStatuses.has(value)) {
    throw new DomainError("Trạng thái thủ thuật không hợp lệ.");
  }

  return value;
}

function normalizeCategory(value: ProcedureCategory): ProcedureCategory {
  if (!procedureCategories.has(value)) {
    throw new DomainError("Nhóm thủ thuật không hợp lệ.");
  }

  return value;
}

function normalizePerformerActorType(
  value: ProcedurePerformerActorType
): ProcedurePerformerActorType {
  if (!procedurePerformerActorTypes.has(value)) {
    throw new DomainError("Loại chủ thể thực hiện thủ thuật không hợp lệ.");
  }

  return value;
}

function normalizeReportReferenceResourceType(
  value: ProcedureReportReference["resourceType"]
): ProcedureReportReference["resourceType"] {
  if (!procedureReportReferenceResourceTypes.has(value)) {
    throw new DomainError("Loại báo cáo liên quan thủ thuật không hợp lệ.");
  }

  return value;
}

function normalizeRequired(value: string, message: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw new DomainError(message);
  }

  return normalized;
}

function normalizeOptional(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}

function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}
