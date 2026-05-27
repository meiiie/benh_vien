import { DomainError } from "../shared/domain-error.js";

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

    if (numberOfSeries < series.length) {
      throw new DomainError("Số chuỗi ảnh không được nhỏ hơn số series đã khai báo.");
    }

    if (numberOfInstances < seriesInstanceCount) {
      throw new DomainError("Số ảnh không được nhỏ hơn tổng số ảnh trong các series đã khai báo.");
    }

    return new ImagingStudy({
      id: normalizeRequired(input.id, "Mã nghiên cứu hình ảnh không được để trống."),
      patientId: normalizeRequired(input.patientId, "ImagingStudy phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      basedOnServiceRequestId: normalizeOptional(input.basedOnServiceRequestId),
      diagnosticReportId: normalizeOptional(input.diagnosticReportId),
      status: input.status ?? "available",
      studyInstanceUid: normalizeRequired(
        input.studyInstanceUid,
        "DICOM Study Instance UID không được để trống."
      ),
      accessionNumber: normalizeOptional(input.accessionNumber),
      description: normalizeOptional(input.description),
      startedAt: input.startedAt
        ? parseDate(input.startedAt, "Thời điểm bắt đầu nghiên cứu hình ảnh không hợp lệ.").toISOString()
        : undefined,
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

    return new ImagingStudy({
      ...snapshot,
      id: normalizeRequired(snapshot.id, "Mã nghiên cứu hình ảnh không được để trống."),
      patientId: normalizeRequired(snapshot.patientId, "ImagingStudy phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(snapshot.encounterId),
      basedOnServiceRequestId: normalizeOptional(snapshot.basedOnServiceRequestId),
      diagnosticReportId: normalizeOptional(snapshot.diagnosticReportId),
      studyInstanceUid: normalizeRequired(
        snapshot.studyInstanceUid,
        "DICOM Study Instance UID không được để trống."
      ),
      accessionNumber: normalizeOptional(snapshot.accessionNumber),
      description: normalizeOptional(snapshot.description),
      startedAt: snapshot.startedAt
        ? parseDate(snapshot.startedAt, "Thời điểm bắt đầu nghiên cứu hình ảnh không hợp lệ.").toISOString()
        : undefined,
      referrerPractitionerId: normalizeOptional(snapshot.referrerPractitionerId),
      interpreterPractitionerId: normalizeOptional(snapshot.interpreterPractitionerId),
      endpointId: normalizeOptional(snapshot.endpointId),
      numberOfSeries: normalizeCount(
        snapshot.numberOfSeries,
        "Số chuỗi ảnh của ImagingStudy không hợp lệ."
      ),
      numberOfInstances: normalizeCount(
        snapshot.numberOfInstances,
        "Số ảnh của ImagingStudy không hợp lệ."
      ),
      series,
      createdAt: parseDate(snapshot.createdAt, "Thời điểm tạo ImagingStudy không hợp lệ.").toISOString(),
      updatedAt: parseDate(snapshot.updatedAt, "Thời điểm cập nhật ImagingStudy không hợp lệ.").toISOString()
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
    const uid = normalizeRequired(value.uid, "DICOM Series Instance UID không được để trống.");

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
  if (!Number.isInteger(value) || value < 0) {
    throw new DomainError(message);
  }

  return value;
}

function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}
