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
import type { NewAllergyIntoleranceForm } from "../../types/allergies.js";
import type {
  NewProcedureForm,
  NewServiceRequestForm
} from "../../types/careWorkflow.js";
import type { NewClinicalDocumentForm } from "../../types/clinicalDocuments.js";
import type { NewConditionForm } from "../../types/conditions.js";
import type {
  NewDiagnosticReportForm,
  NewImagingStudyForm
} from "../../types/diagnosticResults.js";
import type { NewEncounterForm } from "../../types/encounters.js";
import type {
  NewMedicationAdministrationForm,
  NewMedicationDispenseForm,
  NewMedicationRequestForm
} from "../../types/medications.js";
import type { NewObservationForm } from "../../types/observations.js";

export function useClinicalRecordFormState() {
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

  return {
    allergyIntoleranceForm,
    conditionForm,
    diagnosticReportForm,
    documentForm,
    encounterForm,
    imagingStudyForm,
    medicationAdministrationForm,
    medicationDispenseForm,
    medicationRequestForm,
    observationForm,
    procedureForm,
    serviceRequestForm,
    setAllergyIntoleranceForm,
    setConditionForm,
    setDiagnosticReportForm,
    setDocumentForm,
    setEncounterForm,
    setImagingStudyForm,
    setMedicationAdministrationForm,
    setMedicationDispenseForm,
    setMedicationRequestForm,
    setObservationForm,
    setProcedureForm,
    setServiceRequestForm
  };
}
