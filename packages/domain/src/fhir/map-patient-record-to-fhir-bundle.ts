import type { AllergyIntolerance } from "../allergy-intolerance/allergy-intolerance.js";
import type { ClinicalDocument } from "../clinical-document/clinical-document.js";
import type { Condition } from "../condition/condition.js";
import type { DiagnosticReport } from "../diagnostic-report/diagnostic-report.js";
import type { Encounter } from "../encounter/encounter.js";
import type { ImagingStudy } from "../imaging-study/imaging-study.js";
import type { MedicationAdministration } from "../medication-administration/medication-administration.js";
import type { MedicationRequest } from "../medication-request/medication-request.js";
import type { Observation } from "../observation/observation.js";
import type { Patient } from "../patient/patient.js";
import type { Procedure } from "../procedure/procedure.js";
import type { ProviderDirectory } from "../provider-directory/provider-directory.js";
import type { ServiceRequest } from "../service-request/service-request.js";
import type { WorkflowTask } from "../workflow-task/workflow-task.js";
import type {
  FhirBundle,
  FhirAllergyIntolerance,
  FhirCondition,
  FhirDiagnosticReport,
  FhirDocumentReference,
  FhirEndpoint,
  FhirEncounter,
  FhirImagingStudy,
  FhirMedicationAdministration,
  FhirMedicationRequest,
  FhirObservation,
  FhirOrganization,
  FhirPatient,
  FhirProcedure,
  FhirPractitioner,
  FhirPractitionerRole,
  FhirServiceRequest,
  FhirTask
} from "./fhir-types.js";
import { mapAllergyIntoleranceToFhir } from "./map-allergy-intolerance-to-fhir.js";
import { mapClinicalDocumentToFhir } from "./map-clinical-document-to-fhir.js";
import { mapConditionToFhir } from "./map-condition-to-fhir.js";
import { mapDiagnosticReportToFhir } from "./map-diagnostic-report-to-fhir.js";
import { mapEncounterToFhir } from "./map-encounter-to-fhir.js";
import { mapImagingStudyToFhir } from "./map-imaging-study-to-fhir.js";
import { mapMedicationAdministrationToFhir } from "./map-medication-administration-to-fhir.js";
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
  readonly medicationAdministrations?: readonly MedicationAdministration[];
  readonly documents: readonly ClinicalDocument[];
  readonly providerDirectory?: ProviderDirectory;
  readonly generatedAt?: Date;
};

export function mapPatientRecordToFhirBundle(input: PatientRecordBundleInput): FhirBundle {
  const generatedAt = input.generatedAt ?? new Date();
  const patient = mapPatientToFhir(input.patient);
  const encounters = input.encounters.map(mapEncounterToFhir);
  const allergyIntolerances =
    input.allergyIntolerances?.map(mapAllergyIntoleranceToFhir) ?? [];
  const conditions = input.conditions?.map(mapConditionToFhir) ?? [];
  const serviceRequests = input.serviceRequests?.map(mapServiceRequestToFhir) ?? [];
  const workflowTasks = input.workflowTasks?.map(mapWorkflowTaskToFhir) ?? [];
  const procedures = input.procedures?.map(mapProcedureToFhir) ?? [];
  const observations = input.observations?.map(mapObservationToFhir) ?? [];
  const diagnosticReports = input.diagnosticReports?.map(mapDiagnosticReportToFhir) ?? [];
  const imagingStudies = input.imagingStudies?.map(mapImagingStudyToFhir) ?? [];
  const medicationRequests = input.medicationRequests?.map(mapMedicationRequestToFhir) ?? [];
  const medicationAdministrations =
    input.medicationAdministrations?.map(mapMedicationAdministrationToFhir) ?? [];
  const documents = input.documents.map(mapClinicalDocumentToFhir);
  const providerResources = input.providerDirectory
    ? mapProviderDirectoryToFhirResources(input.providerDirectory)
    : [];
  const resources = [
    patient,
    ...providerResources,
    ...encounters,
    ...allergyIntolerances,
    ...conditions,
    ...serviceRequests,
    ...workflowTasks,
    ...procedures,
    ...observations,
    ...diagnosticReports,
    ...imagingStudies,
    ...medicationRequests,
    ...medicationAdministrations,
    ...documents
  ];

  return {
    resourceType: "Bundle",
    id: `patient-record-${patient.id}`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"]
    },
    identifier: {
      system: "urn:wiiicare:nexus:fhir-bundle",
      value: `patient-record:${patient.id}:${generatedAt.toISOString()}`
    },
    type: "collection",
    timestamp: generatedAt.toISOString(),
    entry: resources.map(toBundleEntry)
  };
}

function toBundleEntry(
  resource:
    | FhirPatient
    | FhirEncounter
    | FhirAllergyIntolerance
    | FhirCondition
    | FhirObservation
    | FhirDiagnosticReport
    | FhirImagingStudy
    | FhirMedicationRequest
    | FhirMedicationAdministration
    | FhirServiceRequest
    | FhirTask
    | FhirProcedure
    | FhirOrganization
    | FhirPractitioner
    | FhirPractitionerRole
    | FhirEndpoint
    | FhirDocumentReference
): FhirBundle["entry"][number] {
  return {
    fullUrl: `urn:wiiicare:nexus:${resource.resourceType}:${resource.id}`,
    resource
  };
}
