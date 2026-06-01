import type { FormEvent, ReactNode } from "react";
import type {
  AllergyIntolerance,
  NewAllergyIntoleranceForm
} from "../../types/allergies.js";
import type {
  NewProcedureForm,
  NewServiceRequestForm,
  Procedure,
  ServiceRequest,
  WorkflowTask
} from "../../types/careWorkflow.js";
import type {
  Condition,
  NewConditionForm
} from "../../types/conditions.js";
import type {
  DiagnosticReport,
  ImagingStudy,
  NewDiagnosticReportForm,
  NewImagingStudyForm
} from "../../types/diagnosticResults.js";
import type {
  Encounter,
  NewEncounterForm
} from "../../types/encounters.js";
import type {
  MedicationAdministration,
  MedicationDispense,
  MedicationRequest,
  NewMedicationAdministrationForm,
  NewMedicationDispenseForm,
  NewMedicationRequestForm
} from "../../types/medications.js";
import type {
  NewObservationForm,
  Observation
} from "../../types/observations.js";
import type { EncounterPanelCounts } from "./EncounterPanel.js";

type ClinicalRecordSubmitHandler = (event: FormEvent<HTMLFormElement>) => Promise<void> | void;

type ClinicalRecordCollections = {
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

type ClinicalRecordForms = {
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

type ClinicalRecordSelectedIds = {
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

type ClinicalRecordSelections = {
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

type ClinicalRecordLoadingState = {
  readonly allergyIntolerances: boolean;
  readonly conditions: boolean;
  readonly diagnosticReports: boolean;
  readonly encounters: boolean;
  readonly imagingStudies: boolean;
  readonly medicationAdministrations: boolean;
  readonly medicationDispenses: boolean;
  readonly medicationRequests: boolean;
  readonly observations: boolean;
  readonly procedures: boolean;
  readonly serviceRequests: boolean;
  readonly workflowTasks: boolean;
};

type ClinicalRecordSubmittingState = {
  readonly allergyIntolerance: boolean;
  readonly condition: boolean;
  readonly diagnosticReport: boolean;
  readonly encounter: boolean;
  readonly imagingStudy: boolean;
  readonly medicationAdministration: boolean;
  readonly medicationDispense: boolean;
  readonly medicationRequest: boolean;
  readonly observation: boolean;
  readonly procedure: boolean;
  readonly serviceRequest: boolean;
};

type ClinicalRecordPanelHandlers = {
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

export type BuildClinicalRecordPanelRenderersOptions = {
  readonly collections: ClinicalRecordCollections;
  readonly forms: ClinicalRecordForms;
  readonly handlers: ClinicalRecordPanelHandlers;
  readonly isFinishingEncounter: boolean;
  readonly isWriteDisabled: boolean;
  readonly loading: ClinicalRecordLoadingState;
  readonly selectedIds: ClinicalRecordSelectedIds;
  readonly selections: ClinicalRecordSelections;
  readonly submitting: ClinicalRecordSubmittingState;
};

export type ClinicalRecordPanelRenderers = {
  readonly allergyIntolerance: () => ReactNode;
  readonly condition: () => ReactNode;
  readonly diagnosticReport: () => ReactNode;
  readonly encounter: () => ReactNode;
  readonly imagingStudy: () => ReactNode;
  readonly medicationAdministration: () => ReactNode;
  readonly medicationDispense: () => ReactNode;
  readonly medicationRequest: () => ReactNode;
  readonly observation: () => ReactNode;
  readonly procedure: () => ReactNode;
  readonly serviceRequest: () => ReactNode;
  readonly workflowTask: () => ReactNode;
};
