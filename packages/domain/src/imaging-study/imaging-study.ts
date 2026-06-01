import {
  normalizeCount,
  normalizeOptional,
  normalizeRequired,
  normalizeSeries,
  normalizeStatus,
  normalizeStudyInstanceUid,
  parseDate,
  validateCounts,
  validateTimeline
} from "./imaging-study.validation.js";
import type {
  CreateImagingStudyInput,
  ImagingStudySnapshot
} from "./imaging-study.types.js";

export type {
  CreateImagingStudyInput,
  CreateImagingStudySeriesInput,
  ImagingStudyCoding,
  ImagingStudySeries,
  ImagingStudySnapshot,
  ImagingStudyStatus
} from "./imaging-study.types.js";

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
      studyInstanceUid: normalizeStudyInstanceUid(input.studyInstanceUid),
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
      studyInstanceUid: normalizeStudyInstanceUid(snapshot.studyInstanceUid),
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
