import {
  assertProcedureLifecycle,
  normalizeCoding,
  normalizeOptional,
  normalizePerformedPeriod,
  normalizePerformers,
  normalizeReportReferences,
  normalizeRequired,
  normalizeRequiredCoding,
  parseDate,
  validatePersistenceTimeline,
  validateSelfReference
} from "./procedure.validation.js";
import {
  normalizeCategory,
  normalizeStatus
} from "./procedure.code-set-guards.js";
import type {
  CreateProcedureInput,
  ProcedureSnapshot
} from "./procedure.types.js";

export type {
  CreateProcedureInput,
  ProcedureCategory,
  ProcedureCoding,
  ProcedurePerformedPeriod,
  ProcedurePerformer,
  ProcedurePerformerActorType,
  ProcedureReportReference,
  ProcedureSnapshot,
  ProcedureStatus
} from "./procedure.types.js";

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
