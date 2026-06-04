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
export type ImagingStudyStatus =
  | "registered"
  | "available"
  | "cancelled"
  | "entered-in-error"
  | "unknown";

export type DiagnosticReportCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type DiagnosticReport = {
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

export type ImagingStudy = {
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

export type DiagnosticReportsResponse = {
  readonly items: readonly DiagnosticReport[];
};

export type ImagingStudiesResponse = {
  readonly items: readonly ImagingStudy[];
};

export type NewDiagnosticReportForm = {
  encounterId: string;
  basedOnServiceRequestId: string;
  category: DiagnosticReportCategory;
  codeSystem: string;
  code: string;
  codeDisplay: string;
  effectiveAt: string;
  issuedAt: string;
  performerOrganizationId: string;
  resultsInterpreterPractitionerId: string;
  resultObservationIds: string[];
  conclusion: string;
  presentedFormUrl: string;
  presentedFormTitle: string;
};

export type NewImagingStudyForm = {
  encounterId: string;
  basedOnServiceRequestId: string;
  diagnosticReportId: string;
  studyInstanceUid: string;
  accessionNumber: string;
  description: string;
  startedAt: string;
  referrerPractitionerId: string;
  interpreterPractitionerId: string;
  endpointId: string;
  seriesUid: string;
  seriesNumber: string;
  modalitySystem: string;
  modalityCode: string;
  modalityDisplay: string;
  seriesDescription: string;
  numberOfInstances: string;
  bodySiteSystem: string;
  bodySiteCode: string;
  bodySiteDisplay: string;
};
