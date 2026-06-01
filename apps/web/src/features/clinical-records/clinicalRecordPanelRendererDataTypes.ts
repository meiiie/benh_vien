import type { AllergyIntolerance } from "../../types/allergies.js";
import type {
  Procedure,
  ServiceRequest,
  WorkflowTask
} from "../../types/careWorkflow.js";
import type { Condition } from "../../types/conditions.js";
import type {
  DiagnosticReport,
  ImagingStudy
} from "../../types/diagnosticResults.js";
import type { Encounter } from "../../types/encounters.js";
import type {
  MedicationAdministration,
  MedicationDispense,
  MedicationRequest
} from "../../types/medications.js";
import type { Observation } from "../../types/observations.js";
import type { EncounterPanelCounts } from "./EncounterPanel.js";

export type ClinicalRecordCollections = {
  readonly allergyIntolerances: readonly AllergyIntolerance[];
  readonly conditions: readonly Condition[];
  readonly diagnosticReports: readonly DiagnosticReport[];
  readonly encounters: readonly Encounter[];
  readonly imagingStudies: readonly ImagingStudy[];
  readonly medicationAdministrations: readonly MedicationAdministration[];
  readonly medicationDispenses: readonly MedicationDispense[];
  readonly medicationRequests: readonly MedicationRequest[];
  readonly observations: readonly Observation[];
  readonly procedures: readonly Procedure[];
  readonly serviceRequests: readonly ServiceRequest[];
  readonly workflowTasks: readonly WorkflowTask[];
};

export type ClinicalRecordSelectedIds = {
  readonly allergyIntolerance?: string;
  readonly condition?: string;
  readonly diagnosticReport?: string;
  readonly encounter?: string;
  readonly imagingStudy?: string;
  readonly medicationAdministration?: string;
  readonly medicationDispense?: string;
  readonly medicationRequest?: string;
  readonly observation?: string;
  readonly procedure?: string;
  readonly serviceRequest?: string;
  readonly workflowTask?: string;
};

export type ClinicalRecordSelections = {
  readonly selectedAllergyIntolerance?: AllergyIntolerance;
  readonly selectedCondition?: Condition;
  readonly selectedDiagnosticReport?: DiagnosticReport;
  readonly selectedEncounter?: Encounter;
  readonly selectedEncounterCounts: EncounterPanelCounts;
  readonly selectedImagingStudy?: ImagingStudy;
  readonly selectedMedicationAdministration?: MedicationAdministration;
  readonly selectedMedicationDispense?: MedicationDispense;
  readonly selectedMedicationRequest?: MedicationRequest;
  readonly selectedObservation?: Observation;
  readonly selectedProcedure?: Procedure;
  readonly selectedServiceRequest?: ServiceRequest;
  readonly selectedWorkflowTask?: WorkflowTask;
};
