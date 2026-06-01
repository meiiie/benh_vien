import { useEffect } from "react";
import type { ClinicalDocument } from "../../types/clinicalDocuments.js";
import type {
  RecordTransfer,
  RecordTransferDeliveryAttempt
} from "../../types/recordTransfers.js";

type SelectedFhirPreviewEffectsConfig = {
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

export function useSelectedFhirPreviewEffects(
  config: SelectedFhirPreviewEffectsConfig
) {
  useEffect(() => {
    if (!config.selectedDocumentId) {
      config.setDocumentFhirPreview(undefined);
      config.setDocumentProvenanceFhirPreview(undefined);
      return;
    }

    void config.loadDocumentFhirPreview(config.selectedDocumentId);
    if (config.selectedDocumentStatus === "signed") {
      void config.loadDocumentProvenanceFhirPreview(config.selectedDocumentId);
      return;
    }

    config.setDocumentProvenanceFhirPreview({
      note: "FHIR Provenance chỉ được xuất khi tài liệu đã ký/xác nhận."
    });
  }, [config.selectedDocumentId, config.selectedDocumentStatus]);

  useSelectedPreview({
    clearPreview: config.setConditionFhirPreview,
    loadPreview: config.loadConditionFhirPreview,
    selectedId: config.selectedConditionId
  });
  useSelectedPreview({
    clearPreview: config.setAllergyIntoleranceFhirPreview,
    loadPreview: config.loadAllergyIntoleranceFhirPreview,
    selectedId: config.selectedAllergyIntoleranceId
  });
  useSelectedPreview({
    clearPreview: config.setObservationFhirPreview,
    loadPreview: config.loadObservationFhirPreview,
    selectedId: config.selectedObservationId
  });
  useSelectedPreview({
    clearPreview: config.setMedicationRequestFhirPreview,
    loadPreview: config.loadMedicationRequestFhirPreview,
    selectedId: config.selectedMedicationRequestId
  });
  useSelectedPreview({
    clearPreview: config.setMedicationDispenseFhirPreview,
    loadPreview: config.loadMedicationDispenseFhirPreview,
    selectedId: config.selectedMedicationDispenseId
  });
  useSelectedPreview({
    clearPreview: config.setMedicationAdministrationFhirPreview,
    loadPreview: config.loadMedicationAdministrationFhirPreview,
    selectedId: config.selectedMedicationAdministrationId
  });
  useSelectedPreview({
    clearPreview: config.setServiceRequestFhirPreview,
    loadPreview: config.loadServiceRequestFhirPreview,
    selectedId: config.selectedServiceRequestId
  });
  useSelectedPreview({
    clearPreview: config.setWorkflowTaskFhirPreview,
    loadPreview: config.loadWorkflowTaskFhirPreview,
    selectedId: config.selectedWorkflowTaskId
  });
  useSelectedPreview({
    clearPreview: config.setProcedureFhirPreview,
    loadPreview: config.loadProcedureFhirPreview,
    selectedId: config.selectedProcedureId
  });
  useSelectedPreview({
    clearPreview: config.setDiagnosticReportFhirPreview,
    loadPreview: config.loadDiagnosticReportFhirPreview,
    selectedId: config.selectedDiagnosticReportId
  });
  useSelectedPreview({
    clearPreview: config.setImagingStudyFhirPreview,
    loadPreview: config.loadImagingStudyFhirPreview,
    selectedId: config.selectedImagingStudyId
  });

  useEffect(() => {
    if (!config.selectedRecordTransferId) {
      clearRecordTransferPreview(config);
      return;
    }

    if (
      !config.recordTransfers.some(
        (recordTransfer) => recordTransfer.id === config.selectedRecordTransferId
      )
    ) {
      clearRecordTransferPreview(config);
      return;
    }

    void config.loadRecordTransferFhirTaskPreview(config.selectedRecordTransferId);
    void config.loadRecordTransferDeliveryAttempts(config.selectedRecordTransferId);
  }, [config.selectedRecordTransferId, config.recordTransfers]);
}

type SelectedPreviewConfig = {
  readonly clearPreview: (preview: unknown) => void;
  readonly loadPreview: (id: string) => Promise<void>;
  readonly selectedId: string | undefined;
};

function useSelectedPreview(config: SelectedPreviewConfig) {
  useEffect(() => {
    if (!config.selectedId) {
      config.clearPreview(undefined);
      return;
    }

    void config.loadPreview(config.selectedId);
  }, [config.selectedId]);
}

function clearRecordTransferPreview(config: SelectedFhirPreviewEffectsConfig) {
  config.setRecordTransferFhirTaskPreview(undefined);
  config.setRecordTransferDeliveryAttempts([]);
  config.setRecordTransferDeliveryAttemptWarning(undefined);
  config.setIsLoadingRecordTransferDeliveryAttempts(false);
}
