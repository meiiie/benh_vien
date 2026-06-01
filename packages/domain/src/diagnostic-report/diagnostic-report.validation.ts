import { DomainError } from "../shared/domain-error.js";
import {
  diagnosticReportCategories,
  diagnosticReportStatuses
} from "./diagnostic-report.types.js";
import type {
  DiagnosticReportCategory,
  DiagnosticReportCode,
  DiagnosticReportStatus
} from "./diagnostic-report.types.js";

export function normalizeCode(code: DiagnosticReportCode): DiagnosticReportCode {
  return {
    system: normalizeRequired(code.system, "Hệ mã báo cáo chẩn đoán không được để trống."),
    code: normalizeRequired(code.code, "Mã báo cáo chẩn đoán không được để trống."),
    display: normalizeRequired(code.display, "Tên báo cáo chẩn đoán không được để trống.")
  };
}

export function normalizeIdList(values: readonly string[] | undefined): readonly string[] {
  return [
    ...new Set(
      (values ?? []).map((value) => normalizeOptional(value)).filter((value): value is string =>
        Boolean(value)
      )
    )
  ];
}

export function assertReportContent(
  resultObservationIds: readonly string[],
  conclusion: string | undefined,
  presentedFormUrl: string | undefined,
  presentedFormTitle: string | undefined
): void {
  if (resultObservationIds.length === 0 && !conclusion && !presentedFormUrl) {
    throw new DomainError(
      "DiagnosticReport phải có Observation kết quả, kết luận hoặc tệp báo cáo đính kèm."
    );
  }

  if (presentedFormTitle && !presentedFormUrl) {
    throw new DomainError("Tiêu đề tệp báo cáo chỉ hợp lệ khi có đường dẫn tệp.");
  }
}

export function validateTimeline(input: {
  readonly effectiveAt: Date;
  readonly issuedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}): void {
  if (input.issuedAt < input.effectiveAt) {
    throw new DomainError("Thời điểm phát hành báo cáo không được trước thời điểm hiệu lực.");
  }

  if (input.updatedAt < input.createdAt) {
    throw new DomainError("Thời điểm cập nhật báo cáo không được trước thời điểm tạo báo cáo.");
  }
}

export function normalizeStatus(value: DiagnosticReportStatus): DiagnosticReportStatus {
  if (!diagnosticReportStatuses.has(value)) {
    throw new DomainError("Trạng thái báo cáo chẩn đoán không hợp lệ.");
  }

  return value;
}

export function normalizeCategory(value: DiagnosticReportCategory): DiagnosticReportCategory {
  if (!diagnosticReportCategories.has(value)) {
    throw new DomainError("Nhóm báo cáo chẩn đoán không hợp lệ.");
  }

  return value;
}

export function normalizeRequired(value: string, message: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw new DomainError(message);
  }

  return normalized;
}

export function normalizeOptional(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}

export function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}
