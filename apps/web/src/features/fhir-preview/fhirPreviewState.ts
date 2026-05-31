import { useState } from "react";

export function useFhirPreviewState() {
  const [patientFhirPreview, setPatientFhirPreview] = useState<unknown>();
  const [patientFhirBundlePreview, setPatientFhirBundlePreview] =
    useState<unknown>();
  const [patientFhirDocumentBundlePreview, setPatientFhirDocumentBundlePreview] =
    useState<unknown>();
  const [consentFhirPreview, setConsentFhirPreview] = useState<unknown>();
  const [recordTransferFhirTaskPreview, setRecordTransferFhirTaskPreview] =
    useState<unknown>();
  const [encounterFhirPreview, setEncounterFhirPreview] = useState<unknown>();
  const [documentFhirPreview, setDocumentFhirPreview] = useState<unknown>();
  const [documentProvenanceFhirPreview, setDocumentProvenanceFhirPreview] =
    useState<unknown>();
  const [allergyIntoleranceFhirPreview, setAllergyIntoleranceFhirPreview] =
    useState<unknown>();
  const [conditionFhirPreview, setConditionFhirPreview] = useState<unknown>();
  const [observationFhirPreview, setObservationFhirPreview] = useState<unknown>();
  const [medicationRequestFhirPreview, setMedicationRequestFhirPreview] =
    useState<unknown>();
  const [medicationDispenseFhirPreview, setMedicationDispenseFhirPreview] =
    useState<unknown>();
  const [
    medicationAdministrationFhirPreview,
    setMedicationAdministrationFhirPreview
  ] = useState<unknown>();
  const [serviceRequestFhirPreview, setServiceRequestFhirPreview] =
    useState<unknown>();
  const [workflowTaskFhirPreview, setWorkflowTaskFhirPreview] =
    useState<unknown>();
  const [procedureFhirPreview, setProcedureFhirPreview] = useState<unknown>();
  const [diagnosticReportFhirPreview, setDiagnosticReportFhirPreview] =
    useState<unknown>();
  const [imagingStudyFhirPreview, setImagingStudyFhirPreview] =
    useState<unknown>();

  return {
    allergyIntoleranceFhirPreview,
    conditionFhirPreview,
    consentFhirPreview,
    diagnosticReportFhirPreview,
    documentFhirPreview,
    documentProvenanceFhirPreview,
    encounterFhirPreview,
    imagingStudyFhirPreview,
    medicationAdministrationFhirPreview,
    medicationDispenseFhirPreview,
    medicationRequestFhirPreview,
    observationFhirPreview,
    patientFhirBundlePreview,
    patientFhirDocumentBundlePreview,
    patientFhirPreview,
    procedureFhirPreview,
    recordTransferFhirTaskPreview,
    serviceRequestFhirPreview,
    setAllergyIntoleranceFhirPreview,
    setConditionFhirPreview,
    setConsentFhirPreview,
    setDiagnosticReportFhirPreview,
    setDocumentFhirPreview,
    setDocumentProvenanceFhirPreview,
    setEncounterFhirPreview,
    setImagingStudyFhirPreview,
    setMedicationAdministrationFhirPreview,
    setMedicationDispenseFhirPreview,
    setMedicationRequestFhirPreview,
    setObservationFhirPreview,
    setPatientFhirBundlePreview,
    setPatientFhirDocumentBundlePreview,
    setPatientFhirPreview,
    setProcedureFhirPreview,
    setRecordTransferFhirTaskPreview,
    setServiceRequestFhirPreview,
    setWorkflowTaskFhirPreview,
    workflowTaskFhirPreview
  };
}
