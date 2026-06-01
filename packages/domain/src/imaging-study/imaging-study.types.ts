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

export const imagingStudyStatuses = new Set<ImagingStudyStatus>([
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
