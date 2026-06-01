import { useState } from "react";
import type { AllergyIntolerance } from "../../types/allergies.js";
import type {
  Procedure,
  ServiceRequest,
  WorkflowTask
} from "../../types/careWorkflow.js";
import type { ClinicalDocument } from "../../types/clinicalDocuments.js";
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

export function useClinicalRecordCollectionState() {
  const [encounters, setEncounters] = useState<readonly Encounter[]>([]);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string>();
  const [clinicalDocuments, setClinicalDocuments] =
    useState<readonly ClinicalDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>();
  const [allergyIntolerances, setAllergyIntolerances] =
    useState<readonly AllergyIntolerance[]>([]);
  const [selectedAllergyIntoleranceId, setSelectedAllergyIntoleranceId] =
    useState<string>();
  const [conditions, setConditions] = useState<readonly Condition[]>([]);
  const [selectedConditionId, setSelectedConditionId] = useState<string>();
  const [observations, setObservations] = useState<readonly Observation[]>([]);
  const [selectedObservationId, setSelectedObservationId] = useState<string>();
  const [medicationRequests, setMedicationRequests] =
    useState<readonly MedicationRequest[]>([]);
  const [selectedMedicationRequestId, setSelectedMedicationRequestId] =
    useState<string>();
  const [medicationDispenses, setMedicationDispenses] =
    useState<readonly MedicationDispense[]>([]);
  const [selectedMedicationDispenseId, setSelectedMedicationDispenseId] =
    useState<string>();
  const [medicationAdministrations, setMedicationAdministrations] =
    useState<readonly MedicationAdministration[]>([]);
  const [
    selectedMedicationAdministrationId,
    setSelectedMedicationAdministrationId
  ] = useState<string>();
  const [serviceRequests, setServiceRequests] =
    useState<readonly ServiceRequest[]>([]);
  const [selectedServiceRequestId, setSelectedServiceRequestId] =
    useState<string>();
  const [workflowTasks, setWorkflowTasks] =
    useState<readonly WorkflowTask[]>([]);
  const [selectedWorkflowTaskId, setSelectedWorkflowTaskId] =
    useState<string>();
  const [procedures, setProcedures] = useState<readonly Procedure[]>([]);
  const [selectedProcedureId, setSelectedProcedureId] = useState<string>();
  const [diagnosticReports, setDiagnosticReports] =
    useState<readonly DiagnosticReport[]>([]);
  const [selectedDiagnosticReportId, setSelectedDiagnosticReportId] =
    useState<string>();
  const [imagingStudies, setImagingStudies] =
    useState<readonly ImagingStudy[]>([]);
  const [selectedImagingStudyId, setSelectedImagingStudyId] =
    useState<string>();

  return {
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
    procedures,
    selectedAllergyIntoleranceId,
    selectedConditionId,
    selectedDiagnosticReportId,
    selectedDocumentId,
    selectedEncounterId,
    selectedImagingStudyId,
    selectedMedicationAdministrationId,
    selectedMedicationDispenseId,
    selectedMedicationRequestId,
    selectedObservationId,
    selectedProcedureId,
    selectedServiceRequestId,
    selectedWorkflowTaskId,
    serviceRequests,
    setAllergyIntolerances,
    setClinicalDocuments,
    setConditions,
    setDiagnosticReports,
    setEncounters,
    setImagingStudies,
    setMedicationAdministrations,
    setMedicationDispenses,
    setMedicationRequests,
    setObservations,
    setProcedures,
    setSelectedAllergyIntoleranceId,
    setSelectedConditionId,
    setSelectedDiagnosticReportId,
    setSelectedDocumentId,
    setSelectedEncounterId,
    setSelectedImagingStudyId,
    setSelectedMedicationAdministrationId,
    setSelectedMedicationDispenseId,
    setSelectedMedicationRequestId,
    setSelectedObservationId,
    setSelectedProcedureId,
    setSelectedServiceRequestId,
    setSelectedWorkflowTaskId,
    setServiceRequests,
    setWorkflowTasks,
    workflowTasks
  };
}
