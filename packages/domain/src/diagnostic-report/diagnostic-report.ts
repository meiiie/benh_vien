import {
  assertReportContent,
  normalizeCategory,
  normalizeCode,
  normalizeIdList,
  normalizeOptional,
  normalizeRequired,
  normalizeStatus,
  parseDate,
  validateTimeline
} from "./diagnostic-report.validation.js";
import type {
  CreateDiagnosticReportInput,
  DiagnosticReportSnapshot
} from "./diagnostic-report.types.js";

export type {
  CreateDiagnosticReportInput,
  DiagnosticReportCategory,
  DiagnosticReportCode,
  DiagnosticReportSnapshot,
  DiagnosticReportStatus
} from "./diagnostic-report.types.js";

export class DiagnosticReport {
  private constructor(private readonly props: DiagnosticReportSnapshot) {}

  static issue(input: CreateDiagnosticReportInput): DiagnosticReport {
    const now = new Date();
    const effectiveAt = parseDate(input.effectiveAt, "Thời điểm hiệu lực báo cáo không hợp lệ.");
    const issuedAt = input.issuedAt
      ? parseDate(input.issuedAt, "Thời điểm phát hành báo cáo không hợp lệ.")
      : now;
    const resultObservationIds = normalizeIdList(input.resultObservationIds);
    const conclusion = normalizeOptional(input.conclusion);
    const presentedFormUrl = normalizeOptional(input.presentedFormUrl);
    const presentedFormTitle = normalizeOptional(input.presentedFormTitle);
    assertReportContent(resultObservationIds, conclusion, presentedFormUrl, presentedFormTitle);
    validateTimeline({ effectiveAt, issuedAt, createdAt: now, updatedAt: now });

    return new DiagnosticReport({
      id: normalizeRequired(input.id, "Mã báo cáo chẩn đoán không được để trống."),
      patientId: normalizeRequired(input.patientId, "DiagnosticReport phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      basedOnServiceRequestId: normalizeOptional(input.basedOnServiceRequestId),
      status: normalizeStatus(input.status ?? "final"),
      category: normalizeCategory(input.category),
      code: normalizeCode(input.code),
      effectiveAt: effectiveAt.toISOString(),
      issuedAt: issuedAt.toISOString(),
      performerOrganizationId: normalizeOptional(input.performerOrganizationId),
      resultsInterpreterPractitionerId: normalizeOptional(input.resultsInterpreterPractitionerId),
      resultObservationIds,
      conclusion,
      presentedFormUrl,
      presentedFormTitle,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: DiagnosticReportSnapshot): DiagnosticReport {
    const effectiveAt = parseDate(
      snapshot.effectiveAt,
      "Thời điểm hiệu lực báo cáo không hợp lệ."
    );
    const issuedAt = parseDate(
      snapshot.issuedAt,
      "Thời điểm phát hành báo cáo không hợp lệ."
    );
    const createdAt = parseDate(
      snapshot.createdAt,
      "Thời điểm tạo báo cáo chẩn đoán không hợp lệ."
    );
    const updatedAt = parseDate(
      snapshot.updatedAt,
      "Thời điểm cập nhật báo cáo chẩn đoán không hợp lệ."
    );
    const resultObservationIds = normalizeIdList(snapshot.resultObservationIds);
    const conclusion = normalizeOptional(snapshot.conclusion);
    const presentedFormUrl = normalizeOptional(snapshot.presentedFormUrl);
    const presentedFormTitle = normalizeOptional(snapshot.presentedFormTitle);
    assertReportContent(resultObservationIds, conclusion, presentedFormUrl, presentedFormTitle);
    validateTimeline({ effectiveAt, issuedAt, createdAt, updatedAt });

    return new DiagnosticReport({
      ...snapshot,
      id: normalizeRequired(snapshot.id, "Mã báo cáo chẩn đoán không được để trống."),
      patientId: normalizeRequired(snapshot.patientId, "DiagnosticReport phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(snapshot.encounterId),
      basedOnServiceRequestId: normalizeOptional(snapshot.basedOnServiceRequestId),
      status: normalizeStatus(snapshot.status),
      category: normalizeCategory(snapshot.category),
      code: normalizeCode(snapshot.code),
      effectiveAt: effectiveAt.toISOString(),
      issuedAt: issuedAt.toISOString(),
      performerOrganizationId: normalizeOptional(snapshot.performerOrganizationId),
      resultsInterpreterPractitionerId: normalizeOptional(snapshot.resultsInterpreterPractitionerId),
      resultObservationIds,
      conclusion,
      presentedFormUrl,
      presentedFormTitle,
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

  toSnapshot(): DiagnosticReportSnapshot {
    return {
      ...this.props,
      code: { ...this.props.code },
      resultObservationIds: [...this.props.resultObservationIds]
    };
  }
}
