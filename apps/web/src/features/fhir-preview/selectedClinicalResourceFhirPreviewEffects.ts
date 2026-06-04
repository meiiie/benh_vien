import type { SelectedFhirPreviewEffectsConfig } from "./selectedFhirPreviewEffectTypes.js";
import { useSelectedPreview } from "./selectedPreviewEffectHook.js";

export function useSelectedClinicalResourceFhirPreviewEffects(
  config: SelectedFhirPreviewEffectsConfig
) {
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
}
