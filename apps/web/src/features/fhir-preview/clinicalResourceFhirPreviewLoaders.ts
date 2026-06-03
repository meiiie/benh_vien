import {
  exportAllergyIntoleranceFhir,
  exportConditionFhir,
  exportDiagnosticReportFhir,
  exportEncounterFhir,
  exportImagingStudyFhir,
  exportMedicationAdministrationFhir,
  exportMedicationDispenseFhir,
  exportMedicationRequestFhir,
  exportObservationFhir,
  exportProcedureFhir,
  exportServiceRequestFhir,
  exportWorkflowTaskFhir
} from "../clinical-records/clinicalRecordApi.js";
import type {
  FhirPreviewLoaderBuilder,
  FhirPreviewLoaderConfig
} from "./fhirPreviewLoaderTypes.js";

type ClinicalResourceFhirPreviewLoaderConfig = Pick<
  FhirPreviewLoaderConfig,
  | "setAllergyIntoleranceFhirPreview"
  | "setConditionFhirPreview"
  | "setDiagnosticReportFhirPreview"
  | "setEncounterFhirPreview"
  | "setImagingStudyFhirPreview"
  | "setMedicationAdministrationFhirPreview"
  | "setMedicationDispenseFhirPreview"
  | "setMedicationRequestFhirPreview"
  | "setObservationFhirPreview"
  | "setProcedureFhirPreview"
  | "setServiceRequestFhirPreview"
  | "setWorkflowTaskFhirPreview"
>;

export function buildClinicalResourceFhirPreviewLoaders(
  config: ClinicalResourceFhirPreviewLoaderConfig,
  buildLoader: FhirPreviewLoaderBuilder
) {
  return {
    loadAllergyIntoleranceFhirPreview: buildLoader(
      "Không thể xuất FHIR AllergyIntolerance",
      exportAllergyIntoleranceFhir,
      config.setAllergyIntoleranceFhirPreview
    ),
    loadConditionFhirPreview: buildLoader(
      "Không thể xuất FHIR Condition",
      exportConditionFhir,
      config.setConditionFhirPreview
    ),
    loadDiagnosticReportFhirPreview: buildLoader(
      "Không thể xuất FHIR DiagnosticReport",
      exportDiagnosticReportFhir,
      config.setDiagnosticReportFhirPreview
    ),
    loadEncounterFhirPreview: buildLoader(
      "Không thể xuất FHIR Encounter",
      exportEncounterFhir,
      config.setEncounterFhirPreview
    ),
    loadImagingStudyFhirPreview: buildLoader(
      "Không thể xuất FHIR ImagingStudy",
      exportImagingStudyFhir,
      config.setImagingStudyFhirPreview
    ),
    loadMedicationAdministrationFhirPreview: buildLoader(
      "Không thể xuất FHIR MedicationAdministration",
      exportMedicationAdministrationFhir,
      config.setMedicationAdministrationFhirPreview
    ),
    loadMedicationDispenseFhirPreview: buildLoader(
      "Không thể xuất FHIR MedicationDispense",
      exportMedicationDispenseFhir,
      config.setMedicationDispenseFhirPreview
    ),
    loadMedicationRequestFhirPreview: buildLoader(
      "Không thể xuất FHIR MedicationRequest",
      exportMedicationRequestFhir,
      config.setMedicationRequestFhirPreview
    ),
    loadObservationFhirPreview: buildLoader(
      "Không thể xuất FHIR Observation",
      exportObservationFhir,
      config.setObservationFhirPreview
    ),
    loadProcedureFhirPreview: buildLoader(
      "Không thể xuất FHIR Procedure",
      exportProcedureFhir,
      config.setProcedureFhirPreview
    ),
    loadServiceRequestFhirPreview: buildLoader(
      "Không thể xuất FHIR ServiceRequest",
      exportServiceRequestFhir,
      config.setServiceRequestFhirPreview
    ),
    loadWorkflowTaskFhirPreview: buildLoader(
      "Không thể xuất FHIR Task",
      exportWorkflowTaskFhir,
      config.setWorkflowTaskFhirPreview
    )
  };
}
