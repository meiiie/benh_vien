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
