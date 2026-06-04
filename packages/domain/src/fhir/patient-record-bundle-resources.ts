import type { FhirBundle } from "./fhir-types.js";
import { mapAllergyIntoleranceToFhir } from "./map-allergy-intolerance-to-fhir.js";
import { mapClinicalDocumentToFhir } from "./map-clinical-document-to-fhir.js";
import { mapConsentToFhir } from "./map-consent-to-fhir.js";
import { mapConditionToFhir } from "./map-condition-to-fhir.js";
import { mapDiagnosticReportToFhir } from "./map-diagnostic-report-to-fhir.js";
import { mapEncounterToFhir } from "./map-encounter-to-fhir.js";
import { mapImagingStudyToFhir } from "./map-imaging-study-to-fhir.js";
import { mapMedicationAdministrationToFhir } from "./map-medication-administration-to-fhir.js";
import { mapMedicationDispenseToFhir } from "./map-medication-dispense-to-fhir.js";
import { mapMedicationRequestToFhir } from "./map-medication-request-to-fhir.js";
import { mapObservationToFhir } from "./map-observation-to-fhir.js";
import { mapPatientToFhir } from "./map-patient-to-fhir.js";
import { mapProcedureToFhir } from "./map-procedure-to-fhir.js";
import { mapProviderDirectoryToFhirResources } from "./map-provider-directory-to-fhir.js";
import { mapServiceRequestToFhir } from "./map-service-request-to-fhir.js";
import { mapWorkflowTaskToFhir } from "./map-workflow-task-to-fhir.js";
import type {
  PatientRecordBundleInput,
  PatientRecordBundleResource
} from "./patient-record-bundle.types.js";

export type {
  PatientRecordBundleInput,
  PatientRecordBundleResource
} from "./patient-record-bundle.types.js";

export function buildPatientRecordBundleResources(
  input: PatientRecordBundleInput
): readonly PatientRecordBundleResource[] {
  const providerResources = input.providerDirectory
    ? mapProviderDirectoryToFhirResources(input.providerDirectory)
    : [];

  return [
    mapPatientToFhir(input.patient),
    ...providerResources,
    ...(input.consents?.map(mapConsentToFhir) ?? []),
    ...input.encounters.map(mapEncounterToFhir),
    ...(input.allergyIntolerances?.map(mapAllergyIntoleranceToFhir) ?? []),
    ...(input.conditions?.map(mapConditionToFhir) ?? []),
    ...(input.serviceRequests?.map(mapServiceRequestToFhir) ?? []),
    ...(input.workflowTasks?.map(mapWorkflowTaskToFhir) ?? []),
    ...(input.procedures?.map(mapProcedureToFhir) ?? []),
    ...(input.observations?.map(mapObservationToFhir) ?? []),
    ...(input.diagnosticReports?.map(mapDiagnosticReportToFhir) ?? []),
    ...(input.imagingStudies?.map(mapImagingStudyToFhir) ?? []),
    ...(input.medicationRequests?.map(mapMedicationRequestToFhir) ?? []),
    ...(input.medicationDispenses?.map(mapMedicationDispenseToFhir) ?? []),
    ...(input.medicationAdministrations?.map(mapMedicationAdministrationToFhir) ?? []),
    ...input.documents.map(mapClinicalDocumentToFhir)
  ];
}

export function toPatientRecordBundleEntry(
  resource: PatientRecordBundleResource
): FhirBundle["entry"][number] {
  return {
    fullUrl: `urn:wiiicare:nexus:${resource.resourceType}:${resource.id}`,
    resource
  };
}
