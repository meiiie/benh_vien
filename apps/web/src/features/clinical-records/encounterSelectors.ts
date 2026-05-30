import type {
  AllergyIntolerance,
  ClinicalDocument,
  Condition,
  DiagnosticReport,
  Encounter,
  ImagingStudy,
  MedicationAdministration,
  MedicationDispense,
  MedicationRequest,
  Observation,
  Procedure,
  ServiceRequest,
  WorkflowTask
} from "../../types/clinical.js";

type BuildEncounterRecordCountsInput = {
  readonly allergyIntolerances: readonly AllergyIntolerance[];
  readonly clinicalDocuments: readonly ClinicalDocument[];
  readonly conditions: readonly Condition[];
  readonly diagnosticReports: readonly DiagnosticReport[];
  readonly imagingStudies: readonly ImagingStudy[];
  readonly medicationAdministrations: readonly MedicationAdministration[];
  readonly medicationDispenses: readonly MedicationDispense[];
  readonly medicationRequests: readonly MedicationRequest[];
  readonly observations: readonly Observation[];
  readonly procedures: readonly Procedure[];
  readonly selectedEncounter?: Encounter;
  readonly serviceRequests: readonly ServiceRequest[];
  readonly workflowTasks: readonly WorkflowTask[];
};

export function buildEncounterRecordCounts({
  allergyIntolerances,
  clinicalDocuments,
  conditions,
  diagnosticReports,
  imagingStudies,
  medicationAdministrations,
  medicationDispenses,
  medicationRequests,
  observations,
  procedures,
  selectedEncounter,
  serviceRequests,
  workflowTasks
}: BuildEncounterRecordCountsInput) {
  if (!selectedEncounter) {
    return {
      allergyIntolerances: 0,
      conditions: 0,
      diagnosticReports: 0,
      documents: 0,
      imagingStudies: 0,
      medicationAdministrations: 0,
      medicationDispenses: 0,
      medicationRequests: 0,
      observations: 0,
      procedures: 0,
      serviceRequests: 0,
      workflowTasks: 0
    };
  }

  const encounterId = selectedEncounter.id;

  return {
    allergyIntolerances: allergyIntolerances.filter(
      (allergyIntolerance) => allergyIntolerance.encounterId === encounterId
    ).length,
    conditions: conditions.filter((condition) => condition.encounterId === encounterId).length,
    diagnosticReports: diagnosticReports.filter(
      (diagnosticReport) => diagnosticReport.encounterId === encounterId
    ).length,
    documents: clinicalDocuments.filter((document) => document.encounterId === encounterId).length,
    imagingStudies: imagingStudies.filter((imagingStudy) => imagingStudy.encounterId === encounterId).length,
    medicationAdministrations: medicationAdministrations.filter(
      (medicationAdministration) => medicationAdministration.encounterId === encounterId
    ).length,
    medicationDispenses: medicationDispenses.filter(
      (medicationDispense) => medicationDispense.encounterId === encounterId
    ).length,
    medicationRequests: medicationRequests.filter(
      (medicationRequest) => medicationRequest.encounterId === encounterId
    ).length,
    observations: observations.filter((observation) => observation.encounterId === encounterId).length,
    procedures: procedures.filter((procedure) => procedure.encounterId === encounterId).length,
    serviceRequests: serviceRequests.filter(
      (serviceRequest) => serviceRequest.encounterId === encounterId
    ).length,
    workflowTasks: workflowTasks.filter((task) => task.encounterId === encounterId).length
  };
}
