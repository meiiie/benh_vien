import { useState } from "react";
import {
  defaultAllergyIntoleranceForm,
  defaultClinicalDocumentForm,
  defaultConditionForm,
  defaultDiagnosticReportForm,
  defaultEncounterForm,
  defaultImagingStudyForm,
  defaultMedicationAdministrationForm,
  defaultMedicationDispenseForm,
  defaultMedicationRequestForm,
  defaultObservationForm,
  defaultProcedureForm,
  defaultServiceRequestForm
} from "../../config/demoClinicalDefaults.js";
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
  NewAllergyIntoleranceForm,
  NewClinicalDocumentForm,
  NewConditionForm,
  NewDiagnosticReportForm,
  NewEncounterForm,
  NewImagingStudyForm,
  NewMedicationAdministrationForm,
  NewMedicationDispenseForm,
  NewMedicationRequestForm,
  NewObservationForm,
  NewProcedureForm,
  NewServiceRequestForm,
  Observation,
  Procedure,
  ServiceRequest,
  WorkflowTask
} from "../../types/clinical.js";

export function useClinicalRecordState() {
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
  const [encounterForm, setEncounterForm] =
    useState<NewEncounterForm>(defaultEncounterForm);
  const [documentForm, setDocumentForm] =
    useState<NewClinicalDocumentForm>(defaultClinicalDocumentForm);
  const [allergyIntoleranceForm, setAllergyIntoleranceForm] =
    useState<NewAllergyIntoleranceForm>(defaultAllergyIntoleranceForm);
  const [conditionForm, setConditionForm] =
    useState<NewConditionForm>(defaultConditionForm);
  const [observationForm, setObservationForm] =
    useState<NewObservationForm>(defaultObservationForm);
  const [medicationRequestForm, setMedicationRequestForm] =
    useState<NewMedicationRequestForm>(defaultMedicationRequestForm);
  const [medicationDispenseForm, setMedicationDispenseForm] =
    useState<NewMedicationDispenseForm>(defaultMedicationDispenseForm);
  const [medicationAdministrationForm, setMedicationAdministrationForm] =
    useState<NewMedicationAdministrationForm>(
      defaultMedicationAdministrationForm
    );
  const [serviceRequestForm, setServiceRequestForm] =
    useState<NewServiceRequestForm>(defaultServiceRequestForm);
  const [procedureForm, setProcedureForm] =
    useState<NewProcedureForm>(defaultProcedureForm);
  const [diagnosticReportForm, setDiagnosticReportForm] =
    useState<NewDiagnosticReportForm>(defaultDiagnosticReportForm);
  const [imagingStudyForm, setImagingStudyForm] =
    useState<NewImagingStudyForm>(defaultImagingStudyForm);
  const [isLoadingEncounters, setIsLoadingEncounters] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isLoadingAllergyIntolerances, setIsLoadingAllergyIntolerances] =
    useState(false);
  const [isLoadingConditions, setIsLoadingConditions] = useState(false);
  const [isLoadingObservations, setIsLoadingObservations] = useState(false);
  const [isLoadingMedicationRequests, setIsLoadingMedicationRequests] =
    useState(false);
  const [isLoadingMedicationDispenses, setIsLoadingMedicationDispenses] =
    useState(false);
  const [
    isLoadingMedicationAdministrations,
    setIsLoadingMedicationAdministrations
  ] = useState(false);
  const [isLoadingServiceRequests, setIsLoadingServiceRequests] =
    useState(false);
  const [isLoadingWorkflowTasks, setIsLoadingWorkflowTasks] = useState(false);
  const [isLoadingProcedures, setIsLoadingProcedures] = useState(false);
  const [isLoadingDiagnosticReports, setIsLoadingDiagnosticReports] =
    useState(false);
  const [isLoadingImagingStudies, setIsLoadingImagingStudies] =
    useState(false);
  const [isSubmittingEncounter, setIsSubmittingEncounter] = useState(false);
  const [isSubmittingDocument, setIsSubmittingDocument] = useState(false);
  const [
    isSubmittingAllergyIntolerance,
    setIsSubmittingAllergyIntolerance
  ] = useState(false);
  const [isSubmittingCondition, setIsSubmittingCondition] = useState(false);
  const [isSubmittingObservation, setIsSubmittingObservation] =
    useState(false);
  const [isSubmittingMedicationRequest, setIsSubmittingMedicationRequest] =
    useState(false);
  const [isSubmittingMedicationDispense, setIsSubmittingMedicationDispense] =
    useState(false);
  const [
    isSubmittingMedicationAdministration,
    setIsSubmittingMedicationAdministration
  ] = useState(false);
  const [isSubmittingServiceRequest, setIsSubmittingServiceRequest] =
    useState(false);
  const [isSubmittingProcedure, setIsSubmittingProcedure] = useState(false);
  const [isSubmittingDiagnosticReport, setIsSubmittingDiagnosticReport] =
    useState(false);
  const [isSubmittingImagingStudy, setIsSubmittingImagingStudy] =
    useState(false);
  const [isSigningDocument, setIsSigningDocument] = useState(false);
  const [isFinishingEncounter, setIsFinishingEncounter] = useState(false);

  return {
    allergyIntoleranceForm,
    allergyIntolerances,
    clinicalDocuments,
    conditionForm,
    conditions,
    diagnosticReportForm,
    diagnosticReports,
    documentForm,
    encounterForm,
    encounters,
    imagingStudies,
    imagingStudyForm,
    isFinishingEncounter,
    isLoadingAllergyIntolerances,
    isLoadingConditions,
    isLoadingDiagnosticReports,
    isLoadingDocuments,
    isLoadingEncounters,
    isLoadingImagingStudies,
    isLoadingMedicationAdministrations,
    isLoadingMedicationDispenses,
    isLoadingMedicationRequests,
    isLoadingObservations,
    isLoadingProcedures,
    isLoadingServiceRequests,
    isLoadingWorkflowTasks,
    isSigningDocument,
    isSubmittingAllergyIntolerance,
    isSubmittingCondition,
    isSubmittingDiagnosticReport,
    isSubmittingDocument,
    isSubmittingEncounter,
    isSubmittingImagingStudy,
    isSubmittingMedicationAdministration,
    isSubmittingMedicationDispense,
    isSubmittingMedicationRequest,
    isSubmittingObservation,
    isSubmittingProcedure,
    isSubmittingServiceRequest,
    medicationAdministrationForm,
    medicationAdministrations,
    medicationDispenseForm,
    medicationDispenses,
    medicationRequestForm,
    medicationRequests,
    observationForm,
    observations,
    procedureForm,
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
    serviceRequestForm,
    serviceRequests,
    setAllergyIntoleranceForm,
    setAllergyIntolerances,
    setClinicalDocuments,
    setConditionForm,
    setConditions,
    setDiagnosticReportForm,
    setDiagnosticReports,
    setDocumentForm,
    setEncounterForm,
    setEncounters,
    setImagingStudies,
    setImagingStudyForm,
    setIsFinishingEncounter,
    setIsLoadingAllergyIntolerances,
    setIsLoadingConditions,
    setIsLoadingDiagnosticReports,
    setIsLoadingDocuments,
    setIsLoadingEncounters,
    setIsLoadingImagingStudies,
    setIsLoadingMedicationAdministrations,
    setIsLoadingMedicationDispenses,
    setIsLoadingMedicationRequests,
    setIsLoadingObservations,
    setIsLoadingProcedures,
    setIsLoadingServiceRequests,
    setIsLoadingWorkflowTasks,
    setIsSigningDocument,
    setIsSubmittingAllergyIntolerance,
    setIsSubmittingCondition,
    setIsSubmittingDiagnosticReport,
    setIsSubmittingDocument,
    setIsSubmittingEncounter,
    setIsSubmittingImagingStudy,
    setIsSubmittingMedicationAdministration,
    setIsSubmittingMedicationDispense,
    setIsSubmittingMedicationRequest,
    setIsSubmittingObservation,
    setIsSubmittingProcedure,
    setIsSubmittingServiceRequest,
    setMedicationAdministrationForm,
    setMedicationAdministrations,
    setMedicationDispenseForm,
    setMedicationDispenses,
    setMedicationRequestForm,
    setMedicationRequests,
    setObservationForm,
    setObservations,
    setProcedureForm,
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
    setServiceRequestForm,
    setServiceRequests,
    setWorkflowTasks,
    workflowTasks
  };
}
