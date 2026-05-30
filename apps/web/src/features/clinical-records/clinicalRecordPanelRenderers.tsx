import type { ComponentProps, FormEvent, ReactNode } from "react";
import type {
  AllergyIntolerance,
  Condition,
  DiagnosticReport,
  Encounter,
  ImagingStudy,
  MedicationAdministration,
  MedicationDispense,
  MedicationRequest,
  NewAllergyIntoleranceForm,
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
import { AllergyIntolerancePanel } from "./AllergyIntolerancePanel.js";
import { ConditionPanel } from "./ConditionPanel.js";
import { DiagnosticReportPanel } from "./DiagnosticReportPanel.js";
import { EncounterPanel } from "./EncounterPanel.js";
import { ImagingStudyPanel } from "./ImagingStudyPanel.js";
import { MedicationAdministrationPanel } from "./MedicationAdministrationPanel.js";
import { MedicationDispensePanel } from "./MedicationDispensePanel.js";
import { MedicationRequestPanel } from "./MedicationRequestPanel.js";
import { ObservationPanel } from "./ObservationPanel.js";
import { ProcedurePanel } from "./ProcedurePanel.js";
import { ServiceRequestPanel } from "./ServiceRequestPanel.js";
import { WorkflowTaskPanel } from "./WorkflowTaskPanel.js";

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
  readonly selectedEncounterCounts: ComponentProps<typeof EncounterPanel>["selectedEncounterCounts"];
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

type BuildClinicalRecordPanelRenderersOptions = {
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

export function buildClinicalRecordPanelRenderers({
  collections,
  forms,
  handlers,
  isFinishingEncounter,
  isWriteDisabled,
  loading,
  selectedIds,
  selections,
  submitting
}: BuildClinicalRecordPanelRenderersOptions): ClinicalRecordPanelRenderers {
  return {
    allergyIntolerance: () => (
      <AllergyIntolerancePanel
        allergyIntolerances={collections.allergyIntolerances}
        encounters={collections.encounters}
        form={forms.allergyIntolerance}
        isLoading={loading.allergyIntolerances}
        isSubmitting={submitting.allergyIntolerance}
        isWriteDisabled={isWriteDisabled}
        selectedAllergyIntolerance={selections.selectedAllergyIntolerance}
        selectedAllergyIntoleranceId={selectedIds.allergyIntolerance}
        onCreateAllergyIntolerance={handlers.onCreateAllergyIntolerance}
        onFormChange={handlers.onAllergyIntoleranceFormChange}
        onSelectAllergyIntolerance={handlers.onSelectAllergyIntolerance}
      />
    ),
    condition: () => (
      <ConditionPanel
        conditions={collections.conditions}
        encounters={collections.encounters}
        form={forms.condition}
        isLoading={loading.conditions}
        isSubmitting={submitting.condition}
        isWriteDisabled={isWriteDisabled}
        selectedCondition={selections.selectedCondition}
        selectedConditionId={selectedIds.condition}
        onCreateCondition={handlers.onCreateCondition}
        onFormChange={handlers.onConditionFormChange}
        onSelectCondition={handlers.onSelectCondition}
      />
    ),
    diagnosticReport: () => (
      <DiagnosticReportPanel
        diagnosticReports={collections.diagnosticReports}
        encounters={collections.encounters}
        form={forms.diagnosticReport}
        isLoading={loading.diagnosticReports}
        isSubmitting={submitting.diagnosticReport}
        isWriteDisabled={isWriteDisabled}
        observations={collections.observations}
        selectedDiagnosticReport={selections.selectedDiagnosticReport}
        selectedDiagnosticReportId={selectedIds.diagnosticReport}
        serviceRequests={collections.serviceRequests}
        onCreateDiagnosticReport={handlers.onCreateDiagnosticReport}
        onFormChange={handlers.onDiagnosticReportFormChange}
        onSelectDiagnosticReport={handlers.onSelectDiagnosticReport}
      />
    ),
    encounter: () => (
      <EncounterPanel
        encounters={collections.encounters}
        form={forms.encounter}
        isFinishing={isFinishingEncounter}
        isLoading={loading.encounters}
        isSubmitting={submitting.encounter}
        isWriteDisabled={isWriteDisabled}
        selectedEncounter={selections.selectedEncounter}
        selectedEncounterCounts={selections.selectedEncounterCounts}
        selectedEncounterId={selectedIds.encounter}
        onCreateEncounter={handlers.onCreateEncounter}
        onFinishEncounter={handlers.onFinishEncounter}
        onFormChange={handlers.onEncounterFormChange}
        onSelectEncounter={handlers.onSelectEncounter}
      />
    ),
    imagingStudy: () => (
      <ImagingStudyPanel
        diagnosticReports={collections.diagnosticReports}
        encounters={collections.encounters}
        form={forms.imagingStudy}
        imagingStudies={collections.imagingStudies}
        isLoading={loading.imagingStudies}
        isSubmitting={submitting.imagingStudy}
        isWriteDisabled={isWriteDisabled}
        selectedImagingStudy={selections.selectedImagingStudy}
        selectedImagingStudyId={selectedIds.imagingStudy}
        serviceRequests={collections.serviceRequests}
        onCreateImagingStudy={handlers.onCreateImagingStudy}
        onFormChange={handlers.onImagingStudyFormChange}
        onSelectImagingStudy={handlers.onSelectImagingStudy}
      />
    ),
    medicationAdministration: () => (
      <MedicationAdministrationPanel
        conditions={collections.conditions}
        encounters={collections.encounters}
        form={forms.medicationAdministration}
        isLoading={loading.medicationAdministrations}
        isSubmitting={submitting.medicationAdministration}
        isWriteDisabled={isWriteDisabled}
        medicationAdministrations={collections.medicationAdministrations}
        medicationRequests={collections.medicationRequests}
        selectedMedicationAdministration={selections.selectedMedicationAdministration}
        selectedMedicationAdministrationId={selectedIds.medicationAdministration}
        onCreateMedicationAdministration={handlers.onCreateMedicationAdministration}
        onFormChange={handlers.onMedicationAdministrationFormChange}
        onSelectMedicationAdministration={handlers.onSelectMedicationAdministration}
      />
    ),
    medicationDispense: () => (
      <MedicationDispensePanel
        encounters={collections.encounters}
        form={forms.medicationDispense}
        isLoading={loading.medicationDispenses}
        isSubmitting={submitting.medicationDispense}
        isWriteDisabled={isWriteDisabled}
        medicationDispenses={collections.medicationDispenses}
        medicationRequests={collections.medicationRequests}
        selectedMedicationDispense={selections.selectedMedicationDispense}
        selectedMedicationDispenseId={selectedIds.medicationDispense}
        onCreateMedicationDispense={handlers.onCreateMedicationDispense}
        onFormChange={handlers.onMedicationDispenseFormChange}
        onSelectMedicationDispense={handlers.onSelectMedicationDispense}
      />
    ),
    medicationRequest: () => (
      <MedicationRequestPanel
        conditions={collections.conditions}
        encounters={collections.encounters}
        form={forms.medicationRequest}
        isLoading={loading.medicationRequests}
        isSubmitting={submitting.medicationRequest}
        isWriteDisabled={isWriteDisabled}
        medicationRequests={collections.medicationRequests}
        selectedMedicationRequest={selections.selectedMedicationRequest}
        selectedMedicationRequestId={selectedIds.medicationRequest}
        onCreateMedicationRequest={handlers.onCreateMedicationRequest}
        onFormChange={handlers.onMedicationRequestFormChange}
        onSelectMedicationRequest={handlers.onSelectMedicationRequest}
      />
    ),
    observation: () => (
      <ObservationPanel
        encounters={collections.encounters}
        form={forms.observation}
        isLoading={loading.observations}
        isSubmitting={submitting.observation}
        isWriteDisabled={isWriteDisabled}
        observations={collections.observations}
        selectedObservation={selections.selectedObservation}
        selectedObservationId={selectedIds.observation}
        onCreateObservation={handlers.onCreateObservation}
        onFormChange={handlers.onObservationFormChange}
        onSelectObservation={handlers.onSelectObservation}
      />
    ),
    procedure: () => (
      <ProcedurePanel
        conditions={collections.conditions}
        diagnosticReports={collections.diagnosticReports}
        encounters={collections.encounters}
        form={forms.procedure}
        isLoading={loading.procedures}
        isSubmitting={submitting.procedure}
        isWriteDisabled={isWriteDisabled}
        procedures={collections.procedures}
        selectedProcedure={selections.selectedProcedure}
        selectedProcedureId={selectedIds.procedure}
        serviceRequests={collections.serviceRequests}
        onCreateProcedure={handlers.onCreateProcedure}
        onFormChange={handlers.onProcedureFormChange}
        onSelectProcedure={handlers.onSelectProcedure}
      />
    ),
    serviceRequest: () => (
      <ServiceRequestPanel
        conditions={collections.conditions}
        encounters={collections.encounters}
        form={forms.serviceRequest}
        isLoading={loading.serviceRequests}
        isSubmitting={submitting.serviceRequest}
        isWriteDisabled={isWriteDisabled}
        selectedServiceRequest={selections.selectedServiceRequest}
        selectedServiceRequestId={selectedIds.serviceRequest}
        serviceRequests={collections.serviceRequests}
        onCreateServiceRequest={handlers.onCreateServiceRequest}
        onFormChange={handlers.onServiceRequestFormChange}
        onSelectServiceRequest={handlers.onSelectServiceRequest}
      />
    ),
    workflowTask: () => (
      <WorkflowTaskPanel
        isLoading={loading.workflowTasks}
        selectedWorkflowTask={selections.selectedWorkflowTask}
        selectedWorkflowTaskId={selectedIds.workflowTask}
        workflowTasks={collections.workflowTasks}
        onSelectWorkflowTask={handlers.onSelectWorkflowTask}
      />
    )
  };
}
