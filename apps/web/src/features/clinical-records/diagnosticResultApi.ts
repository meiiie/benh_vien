import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type {
  DiagnosticReport,
  DiagnosticReportsResponse,
  ImagingStudiesResponse,
  ImagingStudy,
  ImagingStudySeries
} from "../../types/diagnosticResults.js";
import { postTreatmentJson, requestTreatmentJson } from "./clinicalRecordHttp.js";

type CreateDiagnosticReportCommand = Pick<
  DiagnosticReport,
  "category" | "code" | "effectiveAt" | "resultObservationIds"
> &
  Partial<
    Pick<
      DiagnosticReport,
      | "encounterId"
      | "basedOnServiceRequestId"
      | "issuedAt"
      | "performerOrganizationId"
      | "resultsInterpreterPractitionerId"
      | "conclusion"
      | "presentedFormUrl"
      | "presentedFormTitle"
    >
  >;

type CreateImagingStudySeriesCommand = Omit<
  ImagingStudySeries,
  "numberOfInstances"
> & {
  readonly numberOfInstances?: number;
};

type CreateImagingStudyCommand = Pick<ImagingStudy, "studyInstanceUid"> &
  Partial<
    Pick<
      ImagingStudy,
      | "encounterId"
      | "basedOnServiceRequestId"
      | "diagnosticReportId"
      | "accessionNumber"
      | "description"
      | "startedAt"
      | "referrerPractitionerId"
      | "interpreterPractitionerId"
      | "endpointId"
    >
  > & {
    readonly series: readonly CreateImagingStudySeriesCommand[];
  };

export function listDiagnosticReports(
  api: ClinicalApiClient,
  patientId: string
): Promise<DiagnosticReportsResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/diagnostic-reports`);
}

export function createDiagnosticReport(
  api: ClinicalApiClient,
  patientId: string,
  command: CreateDiagnosticReportCommand
): Promise<DiagnosticReport> {
  return postTreatmentJson(api, `/patients/${patientId}/diagnostic-reports`, command);
}

export function exportDiagnosticReportFhir(
  api: ClinicalApiClient,
  diagnosticReportId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/diagnostic-reports/${diagnosticReportId}/fhir`);
}

export function listImagingStudies(
  api: ClinicalApiClient,
  patientId: string
): Promise<ImagingStudiesResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/imaging-studies`);
}

export function createImagingStudy(
  api: ClinicalApiClient,
  patientId: string,
  command: CreateImagingStudyCommand
): Promise<ImagingStudy> {
  return postTreatmentJson(api, `/patients/${patientId}/imaging-studies`, command);
}

export function exportImagingStudyFhir(
  api: ClinicalApiClient,
  imagingStudyId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/imaging-studies/${imagingStudyId}/fhir`);
}
