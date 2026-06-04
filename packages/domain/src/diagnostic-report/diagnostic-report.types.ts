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

export const diagnosticReportStatuses = new Set<DiagnosticReportStatus>([
  "registered",
  "partial",
  "preliminary",
  "final",
  "amended",
  "corrected",
  "appended",
  "cancelled",
  "entered-in-error",
  "unknown"
]);

export const diagnosticReportCategories = new Set<DiagnosticReportCategory>([
  "laboratory",
  "imaging",
  "pathology",
  "other"
]);

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
