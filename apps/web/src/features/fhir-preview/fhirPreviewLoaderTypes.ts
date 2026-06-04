import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type {
  FhirPreviewExport,
  SetPreview
} from "./fhirPreviewLoaderFactory.js";

export type FhirPreviewLoaderBuilder = <TId extends readonly unknown[]>(
  errorMessage: string,
  exportPreview: FhirPreviewExport<TId>,
  setPreview: SetPreview
) => (...args: TId) => Promise<void>;

export type FhirPreviewLoaderConfig = {
  readonly canReadAudit: boolean;
  readonly clinicalApi: ClinicalApiClient;
  readonly isAuditOnlySession: boolean;
  readonly setAllergyIntoleranceFhirPreview: SetPreview;
  readonly setAuditFhirBundlePreview: SetPreview;
  readonly setConditionFhirPreview: SetPreview;
  readonly setConsentFhirPreview: SetPreview;
  readonly setDiagnosticReportFhirPreview: SetPreview;
  readonly setDocumentFhirPreview: SetPreview;
  readonly setDocumentProvenanceFhirPreview: SetPreview;
  readonly setEncounterFhirPreview: SetPreview;
  readonly setImagingStudyFhirPreview: SetPreview;
  readonly setIsExportingAuditFhir: (isExporting: boolean) => void;
  readonly setMedicationAdministrationFhirPreview: SetPreview;
  readonly setMedicationDispenseFhirPreview: SetPreview;
  readonly setMedicationRequestFhirPreview: SetPreview;
  readonly setObservationFhirPreview: SetPreview;
  readonly setPatientFhirBundlePreview: SetPreview;
  readonly setPatientFhirDocumentBundlePreview: SetPreview;
  readonly setPatientFhirPreview: SetPreview;
  readonly setProcedureFhirPreview: SetPreview;
  readonly setProviderDirectoryFhirPreview: SetPreview;
  readonly setRecordTransferFhirTaskPreview: SetPreview;
  readonly setServiceRequestFhirPreview: SetPreview;
  readonly setStatusMessage: (message: string) => void;
  readonly setWorkflowTaskFhirPreview: SetPreview;
};
