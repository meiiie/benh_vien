import type { FormEvent, ReactNode } from "react";
import type {
  NewPatientForm,
  Patient,
  PatientMergeForm,
  PatientStatusFilter
} from "../../types/clinical.js";
import { CreatePatientPanel } from "./CreatePatientPanel.js";
import { PatientDetailPanel } from "./PatientDetailPanel.js";
import { PatientListPanel } from "./PatientListPanel.js";
import { PatientMergePanel } from "./PatientMergePanel.js";

type PatientPanelSubmitHandler = (event: FormEvent<HTMLFormElement>) => Promise<void> | void;

type BuildPatientPanelRenderersOptions = {
  readonly patients: readonly Patient[];
  readonly visiblePatients: readonly Patient[];
  readonly selectedPatient?: Patient;
  readonly selectedPatientId?: string;
  readonly selectedPatientMergeTarget?: Patient;
  readonly patientMergeCandidates: readonly Patient[];
  readonly patientMergeConfirmationCode: string;
  readonly patientMergeForm: PatientMergeForm;
  readonly patientMergeTargetId: string;
  readonly patientForm: NewPatientForm;
  readonly searchTerm: string;
  readonly statusFilter: PatientStatusFilter;
  readonly hasFilter: boolean;
  readonly isLoadingPatients: boolean;
  readonly isMergingPatient: boolean;
  readonly isPatientMergeConfirmationValid: boolean;
  readonly isSelectedPatientMerged: boolean;
  readonly isSubmittingPatient: boolean;
  readonly onClearPatientFilters: () => void;
  readonly onCreatePatient: PatientPanelSubmitHandler;
  readonly onMergePatient: PatientPanelSubmitHandler;
  readonly onPatientFormChange: (form: NewPatientForm) => void;
  readonly onPatientMergeFormChange: (form: PatientMergeForm) => void;
  readonly onPatientRefresh: () => Promise<void> | void;
  readonly onPatientSearchTermChange: (value: string) => void;
  readonly onPatientSelect: (patientId: string) => void;
  readonly onPatientStatusFilterChange: (value: PatientStatusFilter) => void;
};

export type PatientPanelRenderers = {
  readonly createPatient: () => ReactNode;
  readonly patientDetail: () => ReactNode;
  readonly patientList: () => ReactNode;
  readonly patientMerge: () => ReactNode;
};

export function buildPatientPanelRenderers({
  patients,
  visiblePatients,
  selectedPatient,
  selectedPatientId,
  selectedPatientMergeTarget,
  patientMergeCandidates,
  patientMergeConfirmationCode,
  patientMergeForm,
  patientMergeTargetId,
  patientForm,
  searchTerm,
  statusFilter,
  hasFilter,
  isLoadingPatients,
  isMergingPatient,
  isPatientMergeConfirmationValid,
  isSelectedPatientMerged,
  isSubmittingPatient,
  onClearPatientFilters,
  onCreatePatient,
  onMergePatient,
  onPatientFormChange,
  onPatientMergeFormChange,
  onPatientRefresh,
  onPatientSearchTermChange,
  onPatientSelect,
  onPatientStatusFilterChange
}: BuildPatientPanelRenderersOptions): PatientPanelRenderers {
  return {
    createPatient: () => (
      <CreatePatientPanel
        form={patientForm}
        isSubmitting={isSubmittingPatient}
        onCreatePatient={onCreatePatient}
        onFormChange={onPatientFormChange}
      />
    ),
    patientDetail: () => (
      <PatientDetailPanel
        isMerged={isSelectedPatientMerged}
        patient={selectedPatient}
        mergeTarget={selectedPatientMergeTarget}
      />
    ),
    patientList: () => (
      <PatientListPanel
        patients={patients}
        visiblePatients={visiblePatients}
        selectedPatientId={selectedPatientId}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        hasFilter={hasFilter}
        isLoading={isLoadingPatients}
        onClearFilters={onClearPatientFilters}
        onRefresh={onPatientRefresh}
        onSearchTermChange={onPatientSearchTermChange}
        onSelectPatient={onPatientSelect}
        onStatusFilterChange={onPatientStatusFilterChange}
      />
    ),
    patientMerge: () => (
      <PatientMergePanel
        candidates={patientMergeCandidates}
        confirmationCode={patientMergeConfirmationCode}
        form={patientMergeForm}
        isConfirmationValid={isPatientMergeConfirmationValid}
        isMerging={isMergingPatient}
        selectedPatient={selectedPatient}
        targetPatientId={patientMergeTargetId}
        onFormChange={onPatientMergeFormChange}
        onMergePatient={onMergePatient}
      />
    )
  };
}
