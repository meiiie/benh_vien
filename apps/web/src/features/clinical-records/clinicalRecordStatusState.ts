import { useState } from "react";

export function useClinicalRecordStatusState() {
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
    setIsSubmittingServiceRequest
  };
}
