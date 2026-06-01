import { normalizeDicomUid } from "../shared/dicom-uid.js";
import { DomainError } from "../shared/domain-error.js";
import { normalizeFhirUnsignedInt } from "../shared/fhir-primitives.js";
import { imagingStudyStatuses } from "./imaging-study.types.js";
import type {
  CreateImagingStudySeriesInput,
  ImagingStudyCoding,
  ImagingStudySeries,
  ImagingStudyStatus
} from "./imaging-study.types.js";

export function normalizeStudyInstanceUid(value: string): string {
  return normalizeDicomUid(value, "DICOM Study Instance UID không hợp lệ.");
}

export function normalizeSeries(
  values: readonly CreateImagingStudySeriesInput[]
): readonly ImagingStudySeries[] {
  if (values.length === 0) {
    throw new DomainError("ImagingStudy cần ít nhất một series DICOM để có metadata PACS hữu ích.");
  }

  const seenUids = new Set<string>();

  return values.map((value) => {
    const uid = normalizeDicomUid(value.uid, "DICOM Series Instance UID không hợp lệ.");

    if (seenUids.has(uid)) {
      throw new DomainError("DICOM Series Instance UID không được trùng lặp trong cùng ImagingStudy.");
    }

    seenUids.add(uid);

    return {
      uid,
      number:
        value.number === undefined
          ? undefined
          : normalizeCount(value.number, "Số thứ tự series không hợp lệ."),
      modality: normalizeCoding(value.modality, "phương thức chụp"),
      description: normalizeOptional(value.description),
      numberOfInstances: normalizeCount(
        value.numberOfInstances ?? 0,
        "Số ảnh trong series không hợp lệ."
      ),
      bodySite: value.bodySite ? normalizeCoding(value.bodySite, "vùng cơ thể") : undefined,
      startedAt: value.startedAt
        ? parseDate(value.startedAt, "Thời điểm bắt đầu series không hợp lệ.").toISOString()
        : undefined
    };
  });
}

export function normalizeStatus(value: ImagingStudyStatus): ImagingStudyStatus {
  if (!imagingStudyStatuses.has(value)) {
    throw new DomainError("Trạng thái nghiên cứu hình ảnh không hợp lệ.");
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

export function normalizeCount(value: number, message: string): number {
  return normalizeFhirUnsignedInt(value, message);
}

export function validateCounts(input: {
  readonly numberOfSeries: number;
  readonly numberOfInstances: number;
  readonly series: readonly ImagingStudySeries[];
}): void {
  const seriesInstanceCount = input.series.reduce(
    (total, item) => total + item.numberOfInstances,
    0
  );

  if (input.numberOfSeries < input.series.length) {
    throw new DomainError("Số chuỗi ảnh không được nhỏ hơn số series đã khai báo.");
  }

  if (input.numberOfInstances < seriesInstanceCount) {
    throw new DomainError("Số ảnh không được nhỏ hơn tổng số ảnh trong các series đã khai báo.");
  }
}

export function validateTimeline(input: {
  readonly startedAt?: Date;
  readonly series: readonly ImagingStudySeries[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}): void {
  if (input.updatedAt < input.createdAt) {
    throw new DomainError("Thời điểm cập nhật ImagingStudy không được trước thời điểm tạo.");
  }

  if (!input.startedAt) {
    return;
  }

  for (const series of input.series) {
    if (series.startedAt && new Date(series.startedAt) < input.startedAt) {
      throw new DomainError("Thời điểm bắt đầu series không được trước thời điểm bắt đầu nghiên cứu hình ảnh.");
    }
  }
}

export function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}

function normalizeCoding(coding: ImagingStudyCoding, label: string): ImagingStudyCoding {
  return {
    system: normalizeRequired(coding.system, `Hệ mã ${label} không được để trống.`),
    code: normalizeRequired(coding.code, `Mã ${label} không được để trống.`),
    display: normalizeRequired(coding.display, `Tên ${label} không được để trống.`)
  };
}
