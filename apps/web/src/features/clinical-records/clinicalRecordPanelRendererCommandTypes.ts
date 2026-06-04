import type { FormEvent } from "react";
import type { NewAllergyIntoleranceForm } from "../../types/allergies.js";
import type {
  NewProcedureForm,
  NewServiceRequestForm
} from "../../types/careWorkflow.js";
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

export type ClinicalRecordSubmitHandler = (
  event: FormEvent<HTMLFormElement>
) => Promise<void> | void;

export type ClinicalRecordForms = {
  readonly allergyIntolerance: NewAllergyIntoleranceForm;
  readonly condition: NewConditionForm;
  readonly diagnosticReport: NewDiagnosticReportForm;
  readonly encounter: NewEncounterForm;
  readonly imagingStudy: NewImagingStudyForm;
  readonly medicationAdministration: NewMedicationAdministrationForm;
  readonly medicationDispense: NewMedicationDispenseForm;
  readonly medicationRequest: NewMedicationRequestForm;
  readonly observation: NewObservationForm;
  readonly procedure: NewProcedureForm;
  readonly serviceRequest: NewServiceRequestForm;
};

export type ClinicalRecordPanelHandlers = {
  readonly onCreateAllergyIntolerance: ClinicalRecordSubmitHandler;
  readonly onCreateCondition: ClinicalRecordSubmitHandler;
  readonly onCreateDiagnosticReport: ClinicalRecordSubmitHandler;
  readonly onCreateEncounter: ClinicalRecordSubmitHandler;
  readonly onCreateImagingStudy: ClinicalRecordSubmitHandler;
  readonly onCreateMedicationAdministration: ClinicalRecordSubmitHandler;
  readonly onCreateMedicationDispense: ClinicalRecordSubmitHandler;
  readonly onCreateMedicationRequest: ClinicalRecordSubmitHandler;
  readonly onCreateObservation: ClinicalRecordSubmitHandler;
  readonly onCreateProcedure: ClinicalRecordSubmitHandler;
  readonly onCreateServiceRequest: ClinicalRecordSubmitHandler;
  readonly onFinishEncounter: (encounterId: string) => Promise<void> | void;
  readonly onAllergyIntoleranceFormChange: (form: NewAllergyIntoleranceForm) => void;
  readonly onConditionFormChange: (form: NewConditionForm) => void;
  readonly onDiagnosticReportFormChange: (form: NewDiagnosticReportForm) => void;
  readonly onEncounterFormChange: (form: NewEncounterForm) => void;
  readonly onImagingStudyFormChange: (form: NewImagingStudyForm) => void;
  readonly onMedicationAdministrationFormChange: (form: NewMedicationAdministrationForm) => void;
  readonly onMedicationDispenseFormChange: (form: NewMedicationDispenseForm) => void;
  readonly onMedicationRequestFormChange: (form: NewMedicationRequestForm) => void;
  readonly onObservationFormChange: (form: NewObservationForm) => void;
  readonly onProcedureFormChange: (form: NewProcedureForm) => void;
  readonly onServiceRequestFormChange: (form: NewServiceRequestForm) => void;
  readonly onSelectAllergyIntolerance: (recordId: string) => void;
  readonly onSelectCondition: (recordId: string) => void;
  readonly onSelectDiagnosticReport: (recordId: string) => void;
  readonly onSelectEncounter: (recordId: string) => void;
  readonly onSelectImagingStudy: (recordId: string) => void;
  readonly onSelectMedicationAdministration: (recordId: string) => void;
  readonly onSelectMedicationDispense: (recordId: string) => void;
  readonly onSelectMedicationRequest: (recordId: string) => void;
  readonly onSelectObservation: (recordId: string) => void;
  readonly onSelectProcedure: (recordId: string) => void;
  readonly onSelectServiceRequest: (recordId: string) => void;
  readonly onSelectWorkflowTask: (recordId: string) => void;
};
