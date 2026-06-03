import type { ClinicalDocument } from "../../types/clinicalDocuments.js";
import type {
  RecordTransfer,
  RecordTransferDeliveryAttempt
} from "../../types/recordTransfers.js";

export type SelectedFhirPreviewEffectsConfig = {
  readonly loadAllergyIntoleranceFhirPreview: (id: string) => Promise<void>;
  readonly loadConditionFhirPreview: (id: string) => Promise<void>;
  readonly loadDiagnosticReportFhirPreview: (id: string) => Promise<void>;
  readonly loadDocumentFhirPreview: (id: string) => Promise<void>;
  readonly loadDocumentProvenanceFhirPreview: (id: string) => Promise<void>;
  readonly loadImagingStudyFhirPreview: (id: string) => Promise<void>;
  readonly loadMedicationAdministrationFhirPreview: (id: string) => Promise<void>;
  readonly loadMedicationDispenseFhirPreview: (id: string) => Promise<void>;
  readonly loadMedicationRequestFhirPreview: (id: string) => Promise<void>;
  readonly loadObservationFhirPreview: (id: string) => Promise<void>;
  readonly loadProcedureFhirPreview: (id: string) => Promise<void>;
  readonly loadRecordTransferDeliveryAttempts: (id: string) => Promise<void>;
  readonly loadRecordTransferFhirTaskPreview: (id: string) => Promise<void>;
  readonly loadServiceRequestFhirPreview: (id: string) => Promise<void>;
  readonly loadWorkflowTaskFhirPreview: (id: string) => Promise<void>;
  readonly recordTransfers: readonly RecordTransfer[];
  readonly selectedAllergyIntoleranceId: string | undefined;
  readonly selectedConditionId: string | undefined;
  readonly selectedDiagnosticReportId: string | undefined;
  readonly selectedDocumentId: string | undefined;
  readonly selectedDocumentStatus: ClinicalDocument["status"] | undefined;
  readonly selectedImagingStudyId: string | undefined;
  readonly selectedMedicationAdministrationId: string | undefined;
  readonly selectedMedicationDispenseId: string | undefined;
  readonly selectedMedicationRequestId: string | undefined;
  readonly selectedObservationId: string | undefined;
  readonly selectedProcedureId: string | undefined;
  readonly selectedRecordTransferId: string | undefined;
  readonly selectedServiceRequestId: string | undefined;
  readonly selectedWorkflowTaskId: string | undefined;
  readonly setAllergyIntoleranceFhirPreview: (preview: unknown) => void;
  readonly setConditionFhirPreview: (preview: unknown) => void;
  readonly setDiagnosticReportFhirPreview: (preview: unknown) => void;
  readonly setDocumentFhirPreview: (preview: unknown) => void;
  readonly setDocumentProvenanceFhirPreview: (preview: unknown) => void;
  readonly setImagingStudyFhirPreview: (preview: unknown) => void;
  readonly setIsLoadingRecordTransferDeliveryAttempts: (isLoading: boolean) => void;
  readonly setMedicationAdministrationFhirPreview: (preview: unknown) => void;
  readonly setMedicationDispenseFhirPreview: (preview: unknown) => void;
  readonly setMedicationRequestFhirPreview: (preview: unknown) => void;
  readonly setObservationFhirPreview: (preview: unknown) => void;
  readonly setProcedureFhirPreview: (preview: unknown) => void;
  readonly setRecordTransferDeliveryAttempts: (
    attempts: readonly RecordTransferDeliveryAttempt[]
  ) => void;
  readonly setRecordTransferDeliveryAttemptWarning: (
    message: string | undefined
  ) => void;
  readonly setRecordTransferFhirTaskPreview: (preview: unknown) => void;
  readonly setServiceRequestFhirPreview: (preview: unknown) => void;
  readonly setWorkflowTaskFhirPreview: (preview: unknown) => void;
};
