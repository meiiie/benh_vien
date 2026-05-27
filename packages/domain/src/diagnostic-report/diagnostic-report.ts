import { DomainError } from "../shared/domain-error.js";

export type DiagnosticReportStatus =
  | "registered"
  | "partial"
  | "preliminary"
  | "final"
  | "amended"
  | "corrected"
  | "appended"
  | "cancelled"
  | "entered-in-error"
  | "unknown";

export type DiagnosticReportCategory = "laboratory" | "imaging" | "pathology" | "other";

export type DiagnosticReportCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type DiagnosticReportSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
  readonly status: DiagnosticReportStatus;
  readonly category: DiagnosticReportCategory;
  readonly code: DiagnosticReportCode;
  readonly effectiveAt: string;
  readonly issuedAt: string;
  readonly performerOrganizationId?: string;
  readonly resultsInterpreterPractitionerId?: string;
  readonly resultObservationIds: readonly string[];
  readonly conclusion?: string;
  readonly presentedFormUrl?: string;
  readonly presentedFormTitle?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateDiagnosticReportInput = Omit<
  DiagnosticReportSnapshot,
  "status" | "issuedAt" | "createdAt" | "updatedAt"
> & {
  readonly status?: DiagnosticReportStatus;
  readonly issuedAt?: string;
};

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

    if (resultObservationIds.length === 0 && !conclusion && !presentedFormUrl) {
      throw new DomainError(
        "DiagnosticReport phải có Observation kết quả, kết luận hoặc tệp báo cáo đính kèm."
      );
    }

    if (presentedFormTitle && !presentedFormUrl) {
      throw new DomainError("Tiêu đề tệp báo cáo chỉ hợp lệ khi có đường dẫn tệp.");
    }

    return new DiagnosticReport({
      id: normalizeRequired(input.id, "Mã báo cáo chẩn đoán không được để trống."),
      patientId: normalizeRequired(input.patientId, "DiagnosticReport phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      basedOnServiceRequestId: normalizeOptional(input.basedOnServiceRequestId),
      status: input.status ?? "final",
      category: input.category,
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
    return new DiagnosticReport({
      ...snapshot,
      encounterId: normalizeOptional(snapshot.encounterId),
      basedOnServiceRequestId: normalizeOptional(snapshot.basedOnServiceRequestId),
      code: normalizeCode(snapshot.code),
      effectiveAt: parseDate(
        snapshot.effectiveAt,
        "Thời điểm hiệu lực báo cáo không hợp lệ."
      ).toISOString(),
      issuedAt: parseDate(
        snapshot.issuedAt,
        "Thời điểm phát hành báo cáo không hợp lệ."
      ).toISOString(),
      performerOrganizationId: normalizeOptional(snapshot.performerOrganizationId),
      resultsInterpreterPractitionerId: normalizeOptional(snapshot.resultsInterpreterPractitionerId),
      resultObservationIds: normalizeIdList(snapshot.resultObservationIds),
      conclusion: normalizeOptional(snapshot.conclusion),
      presentedFormUrl: normalizeOptional(snapshot.presentedFormUrl),
      presentedFormTitle: normalizeOptional(snapshot.presentedFormTitle)
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

function normalizeCode(code: DiagnosticReportCode): DiagnosticReportCode {
  return {
    system: normalizeRequired(code.system, "Hệ mã báo cáo chẩn đoán không được để trống."),
    code: normalizeRequired(code.code, "Mã báo cáo chẩn đoán không được để trống."),
    display: normalizeRequired(code.display, "Tên báo cáo chẩn đoán không được để trống.")
  };
}

function normalizeIdList(values: readonly string[] | undefined): readonly string[] {
  return [
    ...new Set(
      (values ?? []).map((value) => normalizeOptional(value)).filter((value): value is string =>
        Boolean(value)
      )
    )
  ];
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
