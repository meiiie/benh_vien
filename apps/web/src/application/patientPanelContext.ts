import { buildPatientPanelRenderers } from "../features/patient-registry/patientPanelRenderers.js";
import type { usePatientRegistryState } from "../features/patient-registry/patientRegistryState.js";
import type { Patient } from "../types/patientRegistry.js";

type PatientRegistryState = ReturnType<typeof usePatientRegistryState>;
type PatientPanelOptions = Parameters<typeof buildPatientPanelRenderers>[0];

type BuildPatientPanelsInput = {
  readonly hasPatientListFilter: boolean;
  readonly isPatientMergeConfirmationValid: boolean;
  readonly isSelectedPatientMerged: boolean;
  readonly onCreatePatient: PatientPanelOptions["onCreatePatient"];
  readonly onMergePatient: PatientPanelOptions["onMergePatient"];
  readonly onPatientRefresh: PatientPanelOptions["onPatientRefresh"];
  readonly patientMergeCandidates: PatientPanelOptions["patientMergeCandidates"];
  readonly patientMergeConfirmationCode: string;
  readonly patientMergeTargetId: string;
  readonly patientRegistryState: PatientRegistryState;
  readonly selectedPatient: Patient | undefined;
  readonly selectedPatientMergeTarget: Patient | undefined;
  readonly visiblePatients: PatientPanelOptions["visiblePatients"];
};

export function buildPatientPanels({
  hasPatientListFilter,
  isPatientMergeConfirmationValid,
  isSelectedPatientMerged,
  onCreatePatient,
  onMergePatient,
  onPatientRefresh,
  patientMergeCandidates,
  patientMergeConfirmationCode,
  patientMergeTargetId,
  patientRegistryState,
  selectedPatient,
  selectedPatientMergeTarget,
  visiblePatients
}: BuildPatientPanelsInput) {
  return buildPatientPanelRenderers({
    patients: patientRegistryState.patients,
    visiblePatients,
    selectedPatient,
    selectedPatientId: patientRegistryState.selectedPatientId,
    selectedPatientMergeTarget,
    patientMergeCandidates,
    patientMergeConfirmationCode,
    patientMergeForm: patientRegistryState.patientMergeForm,
    patientMergeTargetId,
    patientForm: patientRegistryState.patientForm,
    searchTerm: patientRegistryState.patientSearchTerm,
    statusFilter: patientRegistryState.patientStatusFilter,
    hasFilter: hasPatientListFilter,
    isLoadingPatients: patientRegistryState.isLoadingPatients,
    isMergingPatient: patientRegistryState.isMergingPatient,
    isPatientMergeConfirmationValid,
    isSelectedPatientMerged,
    isSubmittingPatient: patientRegistryState.isSubmittingPatient,
    onClearPatientFilters: patientRegistryState.clearPatientFilters,
    onCreatePatient,
    onMergePatient,
    onPatientFormChange: patientRegistryState.setPatientForm,
    onPatientMergeFormChange: patientRegistryState.setPatientMergeForm,
    onPatientRefresh,
    onPatientSearchTermChange: patientRegistryState.setPatientSearchTerm,
    onPatientSelect: patientRegistryState.setSelectedPatientId,
    onPatientStatusFilterChange: patientRegistryState.setPatientStatusFilter
  });
}
