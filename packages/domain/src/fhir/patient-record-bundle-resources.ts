import type { AllergyIntolerance } from "../allergy-intolerance/allergy-intolerance.js";
import type { ClinicalDocument } from "../clinical-document/clinical-document.js";
import type { Consent } from "../consent/consent.js";
import type { Condition } from "../condition/condition.js";
import type { DiagnosticReport } from "../diagnostic-report/diagnostic-report.js";
import type { Encounter } from "../encounter/encounter.js";
import type { ImagingStudy } from "../imaging-study/imaging-study.js";
import type { MedicationAdministration } from "../medication-administration/medication-administration.js";
import type { MedicationDispense } from "../medication-dispense/medication-dispense.js";
import type { MedicationRequest } from "../medication-request/medication-request.js";
import type { Observation } from "../observation/observation.js";
import type { Patient } from "../patient/patient.js";
import type { Procedure } from "../procedure/procedure.js";
import type { ProviderDirectory } from "../provider-directory/provider-directory.js";
import type { ServiceRequest } from "../service-request/service-request.js";
import type { WorkflowTask } from "../workflow-task/workflow-task.js";
import type {
  FhirAllergyIntolerance,
  FhirBundle,
  FhirConsent,
  FhirCondition,
  FhirDiagnosticReport,
  FhirDocumentReference,
  FhirEndpoint,
  FhirEncounter,
  FhirImagingStudy,
  FhirMedicationAdministration,
  FhirMedicationDispense,
  FhirMedicationRequest,
  FhirObservation,
  FhirOrganization,
  FhirPatient,
  FhirPractitioner,
  FhirPractitionerRole,
  FhirProcedure,
  FhirServiceRequest,
  FhirTask
} from "./fhir-types.js";
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

export type PatientRecordBundleInput = {
  readonly patient: Patient;
  readonly encounters: readonly Encounter[];
  readonly allergyIntolerances?: readonly AllergyIntolerance[];
  readonly conditions?: readonly Condition[];
  readonly serviceRequests?: readonly ServiceRequest[];
  readonly workflowTasks?: readonly WorkflowTask[];
  readonly procedures?: readonly Procedure[];
  readonly observations?: readonly Observation[];
  readonly diagnosticReports?: readonly DiagnosticReport[];
  readonly imagingStudies?: readonly ImagingStudy[];
  readonly medicationRequests?: readonly MedicationRequest[];
  readonly medicationDispenses?: readonly MedicationDispense[];
  readonly medicationAdministrations?: readonly MedicationAdministration[];
  readonly consents?: readonly Consent[];
  readonly documents: readonly ClinicalDocument[];
  readonly providerDirectory?: ProviderDirectory;
  readonly generatedAt?: Date;
};

export type PatientRecordBundleResource =
  | FhirPatient
  | FhirEncounter
  | FhirAllergyIntolerance
  | FhirCondition
  | FhirObservation
  | FhirDiagnosticReport
  | FhirImagingStudy
  | FhirMedicationRequest
  | FhirMedicationDispense
  | FhirMedicationAdministration
  | FhirServiceRequest
  | FhirTask
  | FhirProcedure
  | FhirOrganization
  | FhirPractitioner
  | FhirPractitionerRole
  | FhirEndpoint
  | FhirConsent
  | FhirDocumentReference;

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
