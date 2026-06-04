import type { AllergyIntolerance } from "../types/allergies.js";
import type {
  Procedure,
  ServiceRequest,
  WorkflowTask
} from "../types/careWorkflow.js";
import type { ClinicalDocument } from "../types/clinicalDocuments.js";
import type { Condition } from "../types/conditions.js";
import type {
  DiagnosticReport,
  ImagingStudy
} from "../types/diagnosticResults.js";
import type { Encounter } from "../types/encounters.js";
import type {
  MedicationAdministration,
  MedicationDispense,
  MedicationRequest
} from "../types/medications.js";
import type { Observation } from "../types/observations.js";
import type { Patient } from "../types/patientRegistry.js";
import type { ProviderDirectory } from "../types/providerDirectory.js";
import type { RecordTransfer } from "../types/recordTransfers.js";

export type DashboardMetrics = {
  readonly allergyIntolerances: number;
  readonly clinicalDocuments: number;
  readonly conditions: number;
  readonly diagnosticReports: number;
  readonly draftDocuments: number;
  readonly imagingStudies: number;
  readonly medicationAdministrations: number;
  readonly medicationDispenses: number;
  readonly medicationRequests: number;
  readonly observations: number;
  readonly openEncounters: number;
  readonly patients: number;
  readonly procedures: number;
  readonly providerEndpoints: number;
  readonly providerOrganizations: number;
  readonly recordTransfers: number;
  readonly serviceRequests: number;
  readonly workflowTasks: number;
};

type BuildDashboardMetricsInput = {
  readonly allergyIntolerances: readonly AllergyIntolerance[];
  readonly clinicalDocuments: readonly ClinicalDocument[];
  readonly conditions: readonly Condition[];
  readonly diagnosticReports: readonly DiagnosticReport[];
  readonly encounters: readonly Encounter[];
  readonly imagingStudies: readonly ImagingStudy[];
  readonly medicationAdministrations: readonly MedicationAdministration[];
  readonly medicationDispenses: readonly MedicationDispense[];
  readonly medicationRequests: readonly MedicationRequest[];
  readonly observations: readonly Observation[];
  readonly patients: readonly Patient[];
  readonly procedures: readonly Procedure[];
  readonly providerDirectory?: ProviderDirectory;
  readonly recordTransfers: readonly RecordTransfer[];
  readonly serviceRequests: readonly ServiceRequest[];
  readonly workflowTasks: readonly WorkflowTask[];
};

export function buildDashboardMetrics({
  allergyIntolerances,
  clinicalDocuments,
  conditions,
  diagnosticReports,
  encounters,
  imagingStudies,
  medicationAdministrations,
  medicationDispenses,
  medicationRequests,
  observations,
  patients,
  procedures,
  providerDirectory,
  recordTransfers,
  serviceRequests,
  workflowTasks
}: BuildDashboardMetricsInput): DashboardMetrics {
  return {
    allergyIntolerances: allergyIntolerances.length,
    clinicalDocuments: clinicalDocuments.length,
    conditions: conditions.length,
    diagnosticReports: diagnosticReports.length,
    draftDocuments: clinicalDocuments.filter((document) => document.status === "draft").length,
    imagingStudies: imagingStudies.length,
    medicationAdministrations: medicationAdministrations.length,
    medicationDispenses: medicationDispenses.length,
    medicationRequests: medicationRequests.length,
    observations: observations.length,
    openEncounters: encounters.filter((encounter) => encounter.status === "in-progress").length,
    patients: patients.length,
    procedures: procedures.length,
    providerEndpoints: providerDirectory?.endpoints.length ?? 0,
    providerOrganizations: providerDirectory?.organizations.length ?? 0,
    recordTransfers: recordTransfers.length,
    serviceRequests: serviceRequests.length,
    workflowTasks: workflowTasks.length
  };
}
