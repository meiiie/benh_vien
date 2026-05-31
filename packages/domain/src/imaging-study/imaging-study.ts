import { DomainError } from "../shared/domain-error.js";
import { normalizeDicomUid } from "../shared/dicom-uid.js";
import { normalizeFhirUnsignedInt } from "../shared/fhir-primitives.js";

export type ImagingStudyStatus =
  | "registered"
  | "available"
  | "cancelled"
  | "entered-in-error"
  | "unknown";

export type ImagingStudyCoding = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

const imagingStudyStatuses = new Set<ImagingStudyStatus>([
  "registered",
  "available",
  "cancelled",
  "entered-in-error",
  "unknown"
]);

export type ImagingStudySeries = {
  readonly uid: string;
  readonly number?: number;
  readonly modality: ImagingStudyCoding;
  readonly description?: string;
  readonly numberOfInstances: number;
  readonly bodySite?: ImagingStudyCoding;
  readonly startedAt?: string;
};

export type ImagingStudySnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
  readonly diagnosticReportId?: string;
  readonly status: ImagingStudyStatus;
  readonly studyInstanceUid: string;
  readonly accessionNumber?: string;
  readonly description?: string;
  readonly startedAt?: string;
  readonly referrerPractitionerId?: string;
  readonly interpreterPractitionerId?: string;
  readonly endpointId?: string;
  readonly numberOfSeries: number;
  readonly numberOfInstances: number;
  readonly series: readonly ImagingStudySeries[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateImagingStudySeriesInput = Omit<ImagingStudySeries, "numberOfInstances"> & {
  readonly numberOfInstances?: number;
};

export type CreateImagingStudyInput = Omit<
  ImagingStudySnapshot,
  "status" | "numberOfSeries" | "numberOfInstances" | "series" | "createdAt" | "updatedAt"
> & {
  readonly status?: ImagingStudyStatus;
  readonly numberOfSeries?: number;
  readonly numberOfInstances?: number;
  readonly series: readonly CreateImagingStudySeriesInput[];
};

export class ImagingStudy {
  private constructor(private readonly props: ImagingStudySnapshot) {}

  static record(input: CreateImagingStudyInput): ImagingStudy {
    const now = new Date();
    const series = normalizeSeries(input.series);
    const startedAt = input.startedAt
      ? parseDate(input.startedAt, "Thời điểm bắt đầu nghiên cứu hình ảnh không hợp lệ.")
      : undefined;
    const seriesInstanceCount = series.reduce(
      (total, item) => total + item.numberOfInstances,
      0
    );
    const numberOfSeries = normalizeCount(
      input.numberOfSeries ?? series.length,
      "Số chuỗi ảnh của ImagingStudy không hợp lệ."
    );
    const numberOfInstances = normalizeCount(
      input.numberOfInstances ?? seriesInstanceCount,
      "Số ảnh của ImagingStudy không hợp lệ."
    );

    validateCounts({ numberOfSeries, numberOfInstances, series });
    validateTimeline({ startedAt, series, createdAt: now, updatedAt: now });

    return new ImagingStudy({
      id: normalizeRequired(input.id, "Mã nghiên cứu hình ảnh không được để trống."),
      patientId: normalizeRequired(input.patientId, "ImagingStudy phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      basedOnServiceRequestId: normalizeOptional(input.basedOnServiceRequestId),
      diagnosticReportId: normalizeOptional(input.diagnosticReportId),
      status: normalizeStatus(input.status ?? "available"),
      studyInstanceUid: normalizeDicomUid(
        input.studyInstanceUid,
        "DICOM Study Instance UID không hợp lệ."
      ),
      accessionNumber: normalizeOptional(input.accessionNumber),
      description: normalizeOptional(input.description),
      startedAt: startedAt?.toISOString(),
      referrerPractitionerId: normalizeOptional(input.referrerPractitionerId),
      interpreterPractitionerId: normalizeOptional(input.interpreterPractitionerId),
      endpointId: normalizeOptional(input.endpointId),
      numberOfSeries,
      numberOfInstances,
      series,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: ImagingStudySnapshot): ImagingStudy {
    const series = normalizeSeries(snapshot.series);
    const startedAt = snapshot.startedAt
      ? parseDate(snapshot.startedAt, "Thời điểm bắt đầu nghiên cứu hình ảnh không hợp lệ.")
      : undefined;
    const createdAt = parseDate(snapshot.createdAt, "Thời điểm tạo ImagingStudy không hợp lệ.");
    const updatedAt = parseDate(snapshot.updatedAt, "Thời điểm cập nhật ImagingStudy không hợp lệ.");
    const numberOfSeries = normalizeCount(
      snapshot.numberOfSeries,
      "Số chuỗi ảnh của ImagingStudy không hợp lệ."
    );
    const numberOfInstances = normalizeCount(
      snapshot.numberOfInstances,
      "Số ảnh của ImagingStudy không hợp lệ."
    );
    validateCounts({ numberOfSeries, numberOfInstances, series });
    validateTimeline({ startedAt, series, createdAt, updatedAt });

    return new ImagingStudy({
      ...snapshot,
      id: normalizeRequired(snapshot.id, "Mã nghiên cứu hình ảnh không được để trống."),
      patientId: normalizeRequired(snapshot.patientId, "ImagingStudy phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(snapshot.encounterId),
      basedOnServiceRequestId: normalizeOptional(snapshot.basedOnServiceRequestId),
      diagnosticReportId: normalizeOptional(snapshot.diagnosticReportId),
      status: normalizeStatus(snapshot.status),
      studyInstanceUid: normalizeDicomUid(
        snapshot.studyInstanceUid,
        "DICOM Study Instance UID không hợp lệ."
      ),
      accessionNumber: normalizeOptional(snapshot.accessionNumber),
      description: normalizeOptional(snapshot.description),
      startedAt: startedAt?.toISOString(),
      referrerPractitionerId: normalizeOptional(snapshot.referrerPractitionerId),
      interpreterPractitionerId: normalizeOptional(snapshot.interpreterPractitionerId),
      endpointId: normalizeOptional(snapshot.endpointId),
      numberOfSeries,
      numberOfInstances,
      series,
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

  toSnapshot(): ImagingStudySnapshot {
    return {
      ...this.props,
      series: this.props.series.map((series) => ({
        ...series,
        modality: { ...series.modality },
        bodySite: series.bodySite ? { ...series.bodySite } : undefined
      }))
    };
  }
}

function normalizeSeries(values: readonly CreateImagingStudySeriesInput[]): readonly ImagingStudySeries[] {
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

function normalizeCoding(coding: ImagingStudyCoding, label: string): ImagingStudyCoding {
  return {
    system: normalizeRequired(coding.system, `Hệ mã ${label} không được để trống.`),
    code: normalizeRequired(coding.code, `Mã ${label} không được để trống.`),
    display: normalizeRequired(coding.display, `Tên ${label} không được để trống.`)
  };
}

function normalizeStatus(value: ImagingStudyStatus): ImagingStudyStatus {
  if (!imagingStudyStatuses.has(value)) {
    throw new DomainError("Trạng thái nghiên cứu hình ảnh không hợp lệ.");
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

function normalizeCount(value: number, message: string): number {
  return normalizeFhirUnsignedInt(value, message);
}

function validateCounts(input: {
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

function validateTimeline(input: {
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

function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}
